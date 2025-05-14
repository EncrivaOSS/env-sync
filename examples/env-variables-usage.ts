/**
 * @clqu/storage - Çevresel Değişkenler ile Kullanım Örneği
 * 
 * Bu örnek, storage sınıfının çevresel değişkenlerden (process.env)
 * secret key alarak kullanılmasını gösterir.
 */

import { Storage } from '../src';

// Örnek çevresel değişken ayarla (gerçek uygulamalarda .env dosyası veya
// işletim sistemi çevresel değişken yönetimi kullanılır)
process.env.CL_STORAGE_SECRET_KEY = 'cevre-degiskeni-gizli-anahtar';

async function envVariablesExample() {
	console.log('--- @clqu/storage: Çevresel Değişkenler Örneği ---');
	console.log('Kullanılan çevresel değişken:');
	console.log('CL_STORAGE_SECRET_KEY =', process.env.CL_STORAGE_SECRET_KEY);

	// Çevresel değişkenden secret key alan storage örneği
	// Not: Secret key parametresi vermediğimiz için process.env.CL_STORAGE_SECRET_KEY kullanılacak
	const storage = new Storage(undefined, 'mongodb://localhost:27017');

	// Test verisi kaydet
	console.log('1. Veri kaydediliyor...');
	await storage.set('env-test-key', {
		message: 'Bu veri, çevresel değişkenden alınan secret ile şifrelenecek',
		timestamp: new Date().toISOString()
	});
	console.log('   Veri kaydedildi!');

	// Veriyi geri al
	console.log('2. Veri alınıyor...');
	const value = await storage.get('env-test-key');
	console.log('   Alınan veri:', value);

	// Çevresel değişkeni değiştirme örneği
	// Not: Gerçek uygulamalarda bu şekilde değiştirilmez, burada sadece örnek amaçlı
	console.log('\n3. Çevresel değişkeni değiştiriyoruz...');
	process.env.CL_STORAGE_SECRET_KEY = 'yeni-gizli-anahtar';
	console.log('   Yeni CL_STORAGE_SECRET_KEY =', process.env.CL_STORAGE_SECRET_KEY);

	// Yeni bir storage örneği oluştur (yeni secret key ile)
	const newStorage = new Storage(undefined, 'mongodb://localhost:27017');

	// Önceki veriyi almaya çalış - farklı secretKey olduğu için çözülemeyen veri gelecek
	console.log('4. Önceki veriyi yeni secret ile almaya çalışıyoruz...');
	try {
		const newValue = await newStorage.get('env-test-key');
		// Not: Çözemese bile bir değer dönecektir (şifreli hali),
		// Bu değer orijinal değere benzemeyecek
		console.log('   Alınan veri (şifre çözülemedi):', newValue);
	} catch (error) {
		console.error('   Hata:', error.message);
	}

	// Temizlik: İlk storage ile kaydettiğimiz veriyi silelim
	console.log('5. Temizlik yapılıyor...');
	process.env.CL_STORAGE_SECRET_KEY = 'cevre-degiskeni-gizli-anahtar'; // İlk değere geri döndür
	await storage.delete('env-test-key');
	console.log('   Veriler temizlendi!');

	// Çevresel değişkeni temizle
	delete process.env.CL_STORAGE_SECRET_KEY;

	console.log('--- Çevresel Değişkenler Örneği Tamamlandı ---');
}

// Örneği çalıştır
if (require.main === module) {
	envVariablesExample().catch(err => {
		console.error('Hata oluştu:', err);
		// Çevresel değişkeni temizle
		delete process.env.CL_STORAGE_SECRET_KEY;
		process.exit(1);
	});
}

export { envVariablesExample }; 