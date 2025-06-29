import { MongoClient, Db, Collection } from 'mongodb';
import { IStorage, MongoStorageOptions } from '../../interfaces';
import { createHash, createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { getStorageConfig, getDefaultOptions, getSecretKey, getBlacklistVariables } from '../../utils/config';
import { isDeepStrictEqual } from 'util';


export class MongoAdapter implements IStorage {
	private client: MongoClient;
	private db: Db;
	private collection: Collection<any>;
	private secretKey: string;
	private algorithm: string = 'aes-256-cbc';

	constructor(secretKey: string, adapterURL?: string) {
		// Secret Key
		this.secretKey = (secretKey || 'DEFAULT_SECRET');

		// MongoDB URL
		const dbURL = adapterURL || process.env.ENVSYNC_ADAPTER_URL || 'mongodb://localhost:27017';

		// Varsayılan ayarlar
		const defaultOptions = getDefaultOptions('mongodb');

		// MongoDB bağlantısını başlat
		this.client = new MongoClient(dbURL);
		this.db = this.client.db("env-sync");
		this.collection = this.db.collection("environment");
	}

	private async connect(): Promise<void> {
		try {
			await this.client.connect();
		} catch (error) {
			// Eğer zaten bağlıysa hata vermesini engelle
			if (error instanceof Error && error.message.includes('already connected')) {
				return;
			}
			throw error;
		}
	}

	private hashKey(key: string): string {
		return createHash('sha256')
			.update(this.secretKey + key)
			.digest('hex');
	}

	// Secret key'den şifreleme anahtarı oluştur (32 byte)
	private getEncryptionKey(): Buffer {
		return createHash('sha256')
			.update(String(this.secretKey))
			.digest();
	}

	// Veriyi şifrele
	private encrypt(value: any): string {
		const key = this.getEncryptionKey();
		const iv = randomBytes(16); // Initialization Vector
		const cipher = createCipheriv(this.algorithm, key, iv);

		const valueStr = typeof value === 'string' ? value : JSON.stringify(value);
		let encrypted = cipher.update(valueStr, 'utf8', 'hex');
		encrypted += cipher.final('hex');

		// IV'yi şifreli verinin başına ekleyelim (hex formatında)
		return iv.toString('hex') + ':' + encrypted;
	}

	// Şifrelenmiş veriyi çöz
	private decrypt(encryptedValue: string): any {
		try {
			const key = this.getEncryptionKey();

			// IV ve şifrelenmiş veriyi ayır
			const [ivHex, encryptedText] = encryptedValue.split(':');
			if (!ivHex || !encryptedText) {
				return encryptedValue; // Şifrelenmiş değil, olduğu gibi döndür
			}

			const iv = Buffer.from(ivHex, 'hex');
			const decipher = createDecipheriv(this.algorithm, key, iv);

			let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
			decrypted += decipher.final('utf8');

			// JSON ise parse et
			try {
				return JSON.parse(decrypted);
			} catch (e) {
				return decrypted; // JSON değil, string olarak döndür
			}
		} catch (error) {
			console.error('Şifre çözme hatası:', error);
			return encryptedValue; // Hata durumunda orijinal değeri döndür
		}
	}

	public async set(key: string, value: any): Promise<void> {
		await this.connect();
		const encryptedValue = this.encrypt(value);

		await this.collection.updateOne(
			{ key: key.toUpperCase() },
			{
				$set: {
					value: encryptedValue
				}
			},
			{ upsert: true }
		);
	}

	public async get(key: string): Promise<any> {
		await this.connect();
		const result = await this.collection.findOne({ key: key.toUpperCase() });
		if (!result) return null;

		return this.decrypt(result.value);
	}

	public async getSameValues(envVars: Record<string, string>): Promise<string[]> {
		await this.connect();
		const variablesBlacklist = getBlacklistVariables();
		const allVariables = await this.getAll();

		const sameValues = Object.keys(allVariables).filter((key) => {
			const value1 = allVariables[key];
			const value2 = envVars[key];
			if (variablesBlacklist.includes(key)) return false;

			return String(value1) === String(value2);
		});

		return sameValues;
	}

	public async delete(key: string): Promise<void> {
		await this.connect();
		await this.collection.deleteOne({ key: key.toUpperCase() });
	}

	public async getAll(): Promise<Record<string, any>> {
		await this.connect();

		const documents = await this.collection.find({}).toArray();
		const result: Record<string, any> = {};

		documents.forEach((doc: any) => {
			result[doc.key] = this.decrypt(doc.value);
		});

		return result;
	}
} 