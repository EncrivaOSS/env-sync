#!/usr/bin/env node

import 'dotenv/config'
import { getStorageConfig, Storage } from './index';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

// Argument parsing function
function parseArgs(args: string[]) {
	const result: Record<string, string> = {};
	const remainingArgs: string[] = [];

	for (const arg of args) {
		// Parse arguments in --secret=value or --adapter-url=value format
		if (arg.startsWith('--secret=')) {
			result.secret = arg.substring('--secret='.length);
		}
		else if (arg.startsWith('--adapter-url=')) {
			result.adapterUrl = arg.substring('--adapter-url='.length);
		}
		else {
			remainingArgs.push(arg);
		}
	}

	return { parsedArgs: result, remainingArgs };
}

async function main() {
	const args = process.argv.slice(2);
	const { parsedArgs, remainingArgs } = parseArgs(args);

	// Use special arguments if provided, otherwise use environment variables
	const config = getStorageConfig();
	const secretKey = parsedArgs.secret || process.env.ENVSYNC_SECRET_KEY || config?.secret;
	const adapterURL = parsedArgs.adapterUrl || process.env.ENVSYNC_ADAPTER_URL || config?.adapterURL;

	// If "env-sync bun run dev" type command
	if (remainingArgs.length > 0) {
		// First argument will be the program (bun, npm, yarn, etc.)
		const program = remainingArgs[0];

		try {
			// .env dosyasını oku veya oluştur
			const envPath = path.join(process.cwd(), '.env');
			let envContent = '';

			if (fs.existsSync(envPath)) {
				envContent = fs.readFileSync(envPath, 'utf8');
			}

			// Mevcut .env değerlerini analiz et
			const envVars: Record<string, string> = {};
			envContent.split('\n').forEach(line => {
				const trimmedLine = line.trim();
				if (trimmedLine && !trimmedLine.startsWith('#')) {
					const [key, ...values] = trimmedLine.split('=');
					if (key) {
						envVars[key.trim()] = values.join('=').trim();
					}
				}
			});

			console.log('EnvSync: Getting environment variables from database...');

			// Secret key kontrolü
			if (!secretKey) {
				console.error('EnvSync: Secret key not found.');
				console.error('EnvSync: Use "--secret=KEY" argument or set ENVSYNC_SECRET_KEY environment variable.');
				process.exit(1);
			}

			// Storage bağlantısı oluştur ve verileri al
			const storage = new Storage(secretKey, adapterURL);

			const allData = await storage.getAll();

			console.log('EnvSync: Database variables (decrypted):');
			const updatedVars: string[] = [];

			// Veritabanından alınan her veriyi .env'e ekle
			for (const [key, value] of Object.entries(allData)) {
				// Sadece string, number ve boolean değerleri ekle
				if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
					const envKey = key.toUpperCase();
					envVars[envKey] = String(value);
					updatedVars.push(envKey);
					console.log(`  - ${key} → ${envKey}=${value}`);
				} else {
					console.log(`  - ${key}: Complex data type (object/array) not added to .env`);
				}
			}

			if (updatedVars.length === 0) {
				console.log('  No data to add. Database is empty or contains only complex data structures.');
			}

			// Değişkenleri yeniden .env dosyasına yaz
			let newEnvContent = '# This file was updated by env-sync CLI\n\n';
			for (const [key, value] of Object.entries(envVars)) {
				if (updatedVars.includes(key)) {
					newEnvContent += `${key}=${value} # Updated by env-sync\n`;
				} else {
					newEnvContent += `${key}=${value}\n`;
				}
			}

			// .env dosyasını güncelle
			fs.writeFileSync(envPath, newEnvContent);

			console.log(`\nEnvSync: .env file updated (${updatedVars.length} variables)`);
			if (updatedVars.length > 0) {
				console.log('EnvSync: Updated variables:', updatedVars.join(', '));
			}

			// Programı çalıştır (npm run dev, bun run dev, vs.)
			console.log(`\nEnvSync: Running command: "${remainingArgs.join(' ')}"...\n`);

			const child = spawn(program, remainingArgs.slice(1), {
				stdio: 'inherit',
				shell: true
			});

			child.on('exit', (code) => {
				process.exit(code || 0);
			});

		} catch (error) {
			console.error('EnvSync error:', error);
			process.exit(1);
		}
	} else {
		console.log('Usage: env-sync [options] <command> <arguments>');
		console.log('\nOptions:');
		console.log('  --secret=KEY         Encryption key');
		console.log('  --adapter-url=URL        MongoDB connection URL');
		console.log('\nExamples:');
		console.log('  env-sync --secret=secret --adapter-url=mongodb://localhost:27017 bun run dev');
		console.log('  env-sync npm start');
		process.exit(0);
	}
}

main().catch(err => {
	console.error('Unexpected error:', err);
	process.exit(1);
}); 