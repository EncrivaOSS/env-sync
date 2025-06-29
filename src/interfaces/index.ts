export interface StorageOptions {
	url: string;
	dbName?: string;
	collectionName?: string;
	secretKey?: string;
}

export interface Adapter {
	set(key: string, value: any): Promise<void>;
	get(key: string): Promise<any>;
	delete(key: string): Promise<void>;
	getAll(): Promise<Record<string, any>>;
	getSameValues(envVars: Record<string, string>): Promise<string[]>;
}

export type IStorage = Omit<Adapter, 'getSameValues'>;

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