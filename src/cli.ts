#!/usr/bin/env node

import 'dotenv/config';
import { Command } from 'commander';
import { getStorageConfig, Storage } from './index';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { Logger } from 'tslog';
import { getBlacklistVariables } from './utils/config';

const program = new Command();

program
	.name('env-sync')
	.description('Sync env vars from database and run given command')
	.option('--upload-variables', 'Upload new environment variables to database')
	.option('--force-upload-variables', 'Force upload all environment variables to database')
	.option('--no-logging', 'Disable logging')
	.option('--secret <key>', 'Encryption key')
	.option('--adapter-url <url>', 'MongoDB connection URL')
	.showHelpAfterError(true)
	.allowUnknownOption(true)
	.allowExcessArguments(true)
	.argument('<command>', 'The command to run (e.g., npm, bun)')
	.argument('[args...]', 'Arguments to pass to the command (e.g., run dev)')
	.action(async (command: string, args: string[], options) => {
		const config = getStorageConfig();
		const uploadVariables = options.uploadVariables;
		const forceUploadVariables = options.forceUploadVariables;
		const secretKey = options.secret || process.env.ENVSYNC_SECRET_KEY || config?.secret;
		const adapterURL = options.adapterUrl || process.env.ENVSYNC_ADAPTER_URL || config?.adapterURL;
		const logger = new Logger({
			name: 'envSync',
			hideLogPositionForProduction: true,
			prettyLogTemplate: "[{{name}}] {{logLevelName}} — ",
			stylePrettyLogs: true,
			type: options.noLogging ? 'hidden' : 'pretty'
		});

		if (forceUploadVariables && uploadVariables) {
			logger.error('You cannot use --force-upload-variables and --upload-variables at the same time.');
			process.exit(1);
		}

		const variablesBlacklist = getBlacklistVariables();

		try {
			const envPath = path.join(process.cwd(), '.env');
			let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

			const envVars: Record<string, string> = {};
			envContent.split('\n').forEach(line => {
				const trimmed = line.trim();
				if (trimmed && !trimmed.startsWith('#')) {
					const [key, ...vals] = trimmed.split('=');
					envVars[key.trim()] = process.env[key.trim()] || vals.join('=').trim();
				}
			});

			logger.info('Getting environment variables from database...');

			if (!secretKey) {
				logger.error('Secret key not found.');
				logger.error('Use "--secret=KEY" or set ENVSYNC_SECRET_KEY');
				process.exit(1);
			}

			const storage = new Storage(secretKey, adapterURL);
			let allData = await storage.getAll();
			logger.info(`Total ${Object.keys(allData).length} variables found in database.`);

			if (uploadVariables) {
				logger.info('Uploading environment variables to database...');
				const notInDatabase = Object.keys(envVars).filter(key => !allData[key] && !variablesBlacklist.includes(key));

				logger.info(`Total ${notInDatabase.length} variables are not in database.`);

				if (notInDatabase.length > 0) {
					logger.warn(`${notInDatabase.length} variables will be uploaded to database.`);
					for (const key of notInDatabase) {
						await storage.set(key, envVars[key]);
					}
					allData = await storage.getAll();
				} else {
					logger.warn('No different variables found to synchronize with database.');
				}
			}

			if (forceUploadVariables) {
				logger.info('Force uploading environment variables to database...');
				logger.info('Uploading environment variables to database...');
				const adapter = await storage.getAdapter();
				const sameValues = await adapter.getSameValues(envVars);
				const notSameValues = Object.keys(envVars).filter(key => !sameValues.includes(key) && !variablesBlacklist.includes(key));

				logger.info(`Total ${sameValues.length} variables are already in database.`);
				logger.info(`Total ${notSameValues.length} variables are not in database.`);

				if (notSameValues.length > 0) {
					logger.warn(`${notSameValues.length} variables will be uploaded to database.`);
					for (const key of notSameValues) {
						await storage.set(key, envVars[key]);
					}
					allData = await storage.getAll();
				} else {
					logger.warn('No different variables found to synchronize with database.');
				}
			}

			const updatedVars: string[] = [];

			for (const [key, value] of Object.entries(allData)) {
				if (['string', 'number', 'boolean'].includes(typeof value)) {
					const envKey = key.toUpperCase();
					envVars[envKey] = String(value);
					updatedVars.push(envKey);
				} else {
					logger.info(`  - ${key}: Complex type not added`);
				}
			}

			let newEnv = [
				'# Updated by env-sync',
				'# Updated at ' + new Date().toISOString() + ' UTC',
			].join('\n') + '\n\n';

			for (const [key, value] of Object.entries(envVars)) {
				newEnv += `${key}="${value}"\n`;
			}

			fs.writeFileSync(envPath, newEnv);

			logger.info(`${updatedVars.length} variables updated in .env file.`);
			logger.warn(`Running "${command} ${args.join(' ')}"...`);

			const child = spawn(command, args, {
				stdio: 'inherit',
				shell: true,
			});

			child.on('exit', code => {
				process.exit(code ?? 0);
			});

		} catch (err) {
			logger.error(err);
			process.exit(1);
		}
	});

program
	.on('--help', () => {
		console.log('\nExamples:');
		console.log('  $ env-sync --secret=abc --adapter-url=mongodb://localhost bun run dev');
		console.log('  $ env-sync npm start');
	});

program.parse();
