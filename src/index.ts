import { IStorage, MongoStorageOptions, StorageOptions, AdapterConfig, Adapter } from './interfaces';
import { MongoAdapter as MongoAdapter } from './adapters/mongo';
import { getStorageConfig, getDefaultOptions, getSecretKey } from './utils/config';

/**
 * Storage sınıfı, adaptör tipine göre uygun depolama çözümünü sağlar
 */
export class Storage implements IStorage {
	private storage: Adapter;

	/**
	 * Yeni bir Storage örneği oluşturur
	 * @param secretKey Şifreleme anahtarı (opsiyonel)
	 * @param adapterURL MongoDB bağlantı URL'si (opsiyonel)
	 */
	constructor(secretKey?: string, adapterURL?: string) {
		// Yapılandırma ayarlarını al
		const config = getStorageConfig();

		// Secret key
		const finalSecretKey = secretKey ||
			process.env.ENVSYNC_SECRET_KEY ||
			(config && config.secret) ||
			'DEFAULT_SECRET';

		// AdapterURL
		const finalAdapterURL = adapterURL ||
			process.env.ENVSYNC_ADAPTER_URL ||
			(config && config.adapterURL) ||
			'mongodb://localhost:27017';

		// Database adı
		const dbName = process.env.ENVSYNC_DB_NAME || 'env-sync';

		// MongoDB bağlantısı oluştur
		this.storage = new MongoAdapter(finalSecretKey, finalAdapterURL, dbName);
	}

	/**
	 * Bir anahtar altında veri saklar
	 */
	public async set(key: string, value: any): Promise<void> {
		return this.storage.set(key, value);
	}

	/**
	 * Bir anahtarın değerini getirir
	 */
	public async get(key: string): Promise<any> {
		return this.storage.get(key);
	}

	/**
	 * Bir anahtarı siler
	 */
	public async delete(key: string): Promise<void> {
		return this.storage.delete(key);
	}

	/**
	 * Tüm anahtar/değer çiftlerini getirir
	 */
	public async getAll(): Promise<Record<string, any>> {
		return this.storage.getAll();
	}

	public async getAdapter(): Promise<Adapter> {
		return this.storage;
	}
}

// Dışa aktarılanlar
export * from './interfaces';
export { getStorageConfig, getDefaultOptions, getSecretKey } from './utils/config'; 