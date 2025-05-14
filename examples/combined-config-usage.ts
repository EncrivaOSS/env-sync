/**
 * @clqu/storage - Kombine Yapılandırma Örneği
 * 
 * Bu örnek, @clqu/storage paketinin çevresel değişkenler ve storage.options.json
 * dosyasını beraber kullanarak yapılandırılmasını gösterir.
 */

import { Storage } from '../src';
import * as fs from 'fs';
import * as path from 'path';

// Örnek konfigürasyon dosyası yolu
const CONFIG_PATH = path.join(__dirname, 'storage.options.json');

// Örnek konfigürasyon içeriği oluştur
function createExampleConfig(): void {
	const storageConfig = {
		secret: 'json-dosyasindaki-gizli-anahtar',
		adapterURL: 'mongodb://localhost:27017'
	};

	fs.writeFileSync(CONFIG_PATH, JSON.stringify(storageConfig, null, 2));
	console.log(`Örnek yapılandırma dosyası oluşturuldu: ${CONFIG_PATH}`);
}

// Temizlik: Örnek konfigürasyon dosyasını sil
function cleanupExampleConfig(): void {
	if (fs.existsSync(CONFIG_PATH)) {
		fs.unlinkSync(CONFIG_PATH);
		console.log(`Örnek yapılandırma dosyası silindi: ${CONFIG_PATH}`);
	}
}

async function combinedConfigExample() {
	console.log('--- @clqu/storage: Kombine Yapılandırma Örneği ---');

	// Örnek yapılandırma dosyası oluştur
	createExampleConfig();

	try {
		// 1. Sadece JSON dosyasından yapılandırma ile kullanım
		console.log('\n1. SADECE JSON DOSYASINDAN YAPILANDIRMA:');
		console.log('storage.options.json dosyasındaki yapılandırma:');
		console.log(JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8')));

		// ENV değişkeni henüz ayarlanmadı
		console.log('ENV değişkeni: CL_STORAGE_SECRET_KEY =', process.env.CL_STORAGE_SECRET_KEY || 'tanımlanmamış');

		// Storage.options.json dosyasından otomatik yapılandırma yüklenecek
		const jsonOnlyStorage = new Storage();

		// Test verisi kaydet
		await jsonOnlyStorage.set('json-key', 'Bu veri, JSON yapılandırmasındaki secret ile şifrelenecek');
		console.log('Veri kaydedildi! (JSON secret ile)');

		// Veriyi geri al
		const jsonValue = await jsonOnlyStorage.get('json-key');
		console.log('JSON secret ile alınan veri:', jsonValue);

		// ---------------------------------------------------------------------

		// 2. ENV değişkeni ekle (daha yüksek önceliğe sahip)
		console.log('\n2. ENV DEĞİŞKENİ EKLE (YÜKSEK ÖNCELİKLİ):');
		process.env.CL_STORAGE_SECRET_KEY = 'env-degiskenindeki-gizli-anahtar';
		console.log('ENV değişkeni ayarlandı: CL_STORAGE_SECRET_KEY =', process.env.CL_STORAGE_SECRET_KEY);

		// Yeni bir storage örneği oluştur
		// Bu örnek, ENV değişkenini JSON dosyasına tercih edecek
		const envPriorityStorage = new Storage();

		// İlk kaydedilen veriyi almayı dene (farklı secret key ile şifrelendiği için çözülemeyecek)
		try {
			const tryJsonValue = await envPriorityStorage.get('json-key');
			console.log('Önceki veri farklı secret ile alındı:', tryJsonValue);
			console.log('(Not: Veri muhtemelen doğru şekilde çözülemedi çünkü farklı secret key kullanıldı)');
		} catch (error) {
			console.error('Önceki veri alınırken hata:', error.message);
		}

		// Yeni veri kaydet (ENV secret key ile)
		await envPriorityStorage.set('env-key', 'Bu veri, ENV değişkenindeki secret ile şifrelenecek');
		console.log('Veri kaydedildi! (ENV secret ile)');

		// Veriyi geri al
		const envValue = await envPriorityStorage.get('env-key');
		console.log('ENV secret ile alınan veri:', envValue);

		// ---------------------------------------------------------------------

		// 3. Constructor parametresi kullanımı (en yüksek öncelik)
		console.log('\n3. CONSTRUCTOR PARAMETRESİ KULLANIMI (EN YÜKSEK ÖNCELİK):');

		// Constructor'a parametre olarak secret key geçerek diğer tüm yapılandırmalar override edilir
		const paramStorage = new Storage('constructor-parametresi-gizli-anahtar', 'mongodb://localhost:27017');

		// Yeni veri kaydet (Constructor secret key ile)
		await paramStorage.set('param-key', 'Bu veri, constructor parametresindeki secret ile şifrelenecek');
		console.log('Veri kaydedildi! (Constructor secret ile)');

		// Veriyi geri al
		const paramValue = await paramStorage.get('param-key');
		console.log('Constructor secret ile alınan veri:', paramValue);

		// ---------------------------------------------------------------------

		// 4. Secret key önceliğini özet olarak göster
		console.log('\n4. SECRET KEY ÖNCELİK SIRASI ÖZET:');
		console.log('1. Constructor parametresi:', 'constructor-parametresi-gizli-anahtar');
		console.log('2. ENV değişkeni:', process.env.CL_STORAGE_SECRET_KEY);
		console.log('3. JSON dosyası:', JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8')).secret);

		// Temizlik: Verilerimizi silelim
		console.log('\nTemizlik yapılıyor...');
		await jsonOnlyStorage.delete('json-key');
		await envPriorityStorage.delete('env-key');
		await paramStorage.delete('param-key');
		console.log('Veriler temizlendi!');

	} finally {
		// Örnek yapılandırma dosyasını temizle
		cleanupExampleConfig();

		// Çevresel değişkeni temizle
		delete process.env.CL_STORAGE_SECRET_KEY;
	}

	console.log('--- Kombine Yapılandırma Örneği Tamamlandı ---');
}

// Örneği çalıştır
if (require.main === module) {
	combinedConfigExample().catch(err => {
		console.error('Hata oluştu:', err);
		// Hata olsa bile temizlik yap
		cleanupExampleConfig();
		delete process.env.CL_STORAGE_SECRET_KEY;
		process.exit(1);
	});
}

export { combinedConfigExample }; 