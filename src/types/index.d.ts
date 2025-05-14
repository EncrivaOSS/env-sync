declare module '@clqu/storage' {
	export interface StorageOptions {
		url: string;
		dbName?: string;
		collectionName?: string;
		secretKey?: string;
	}

	export interface IStorage {
		set(key: string, value: any): Promise<void>;
		get(key: string): Promise<any>;
		delete(key: string): Promise<void>;
		getAll(): Promise<Record<string, any>>;
	}

	export interface MongoStorageOptions extends StorageOptions {
		url: string;
		dbName?: string;
		collectionName?: string;
	}

	export interface AdapterConfig {
		adapter?: string;
		secret?: string;
		adapterURL?: string;
	}

	export class Storage implements IStorage {
		constructor(secretKey?: string, adapterURL?: string);
		set(key: string, value: any): Promise<void>;
		get(key: string): Promise<any>;
		delete(key: string): Promise<void>;
		getAll(): Promise<Record<string, any>>;
	}
}

declare module 'package.json' {
	export interface PackageJson {
		envSyncOptions?: AdapterConfig;
	}
}