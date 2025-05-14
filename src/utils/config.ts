import fs from 'fs';
import path from 'path';
import { AdapterConfig } from '../interfaces';

/**
 * Reads the configuration file or gets the configuration from package.json
 */
export function getStorageConfig(): AdapterConfig | null {
	try {
		// 1. Try to find envSyncOptions field in package.json
		const packagePath = path.join(process.cwd(), 'package.json');
		if (fs.existsSync(packagePath)) {
			try {
				const packageFile = fs.readFileSync(packagePath, 'utf8');
				const packageJson = JSON.parse(packageFile);

				if (packageJson.envSyncOptions) {
					return packageJson.envSyncOptions;
				}
			} catch (error) {
				console.error('Package.json read error:', error);
				return null;
			}
		}

		// 2. Try to find env-sync.options.json file in the user's project
		const configPath = path.join(process.cwd(), 'env-sync.options.json');
		if (fs.existsSync(configPath)) {
			try {
				const configFile = fs.readFileSync(configPath, 'utf8');
				return JSON.parse(configFile);
			} catch (error) {
				console.error('env-sync.options.json read error:', error);
				return null;
			}
		}

		return null;
	} catch (error) {
		console.error('Configuration file read error:', error);
		return null;
	}
}

/**
 * Gets the secret key in order of priority:
 * 1. process.env.ENVSYNC_SECRET_KEY
 * 2. env-sync.options.json or package.json's secret
 * 3. Default value
 */
export function getSecretKey(config: AdapterConfig | null): string {
	// 1. Get from environment variable
	if (process.env.ENVSYNC_SECRET_KEY) {
		return process.env.ENVSYNC_SECRET_KEY;
	}

	// 2. Yapılandırma dosyasından al
	if (config && config.secret) {
		return config.secret;
	}

	// 3. Varsayılan değer
	return 'DEFAULT_SECRET';
}

/**
 * MongoDB için varsayılan ayarları döndürür
 */
export function getDefaultOptions(adapter: string): Record<string, any> {
	return {
		adapterURL: 'mongodb://localhost:27017',
		dbName: 'env-sync',
		collectionName: 'environment'
	};
}