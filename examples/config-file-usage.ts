/**
 * @clqu/storage - Yapılandırma Dosyası Örneği
 * 
 * Bu örnek, @clqu/storage paketinin storage.options.json dosyası
 * kullanarak yapılandırılmasını gösterir.
 */

import { Storage } from '../src';
import * as fs from 'fs';
import * as path from 'path';

// Örnek konfigürasyon dosyası yolu
const CONFIG_PATH = path.join(__dirname, 'storage.options.json');

// Örnek konfigürasyon içeriği oluştur
function createExampleConfig(): void {
	const storageConfig = {
		// adapter değeri opsiyoneldir, artık doğrudan kullanılabilir
		secret: 'ornek-konfigurasyon-gizli-anahtari',
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

async function configFileExample() {
	console.log('--- @clqu/storage: Yapılandırma Dosyası Örneği ---');

	// Örnek yapılandırma dosyası oluştur
	createExampleConfig();

	try {
		// Storage.options.json dosyasından otomatik yapılandırma yüklenecek
		console.log('Storage.options.json dosyasından yapılandırma yükleniyor...');
		const storage = new Storage();

		// Test verisi kaydet
		console.log('Veri kaydediliyor...');
		await storage.set('config-test-key', 'Bu veri, yapılandırma dosyasındaki secret ile şifrelenecek');
		console.log('Veri kaydedildi!');

		// Veriyi geri al
		console.log('Veri alınıyor...');
		const value = await storage.get('config-test-key');
		console.log('Alınan veri:', value);

		// Temizlik: Verilerimizi silelim
		console.log('Veriler temizleniyor...');
		await storage.delete('config-test-key');
		console.log('Veriler temizlendi!');

	} finally {
		// Örnek yapılandırma dosyasını temizle
		cleanupExampleConfig();
	}

	console.log('--- Yapılandırma Dosyası Örneği Tamamlandı ---');
}

// Örneği çalıştır
if (require.main === module) {
	configFileExample().catch(err => {
		console.error('Hata oluştu:', err);
		// Hata olsa bile yapılandırma dosyasını temizle
		cleanupExampleConfig();
		process.exit(1);
	});
}

export { configFileExample }; 