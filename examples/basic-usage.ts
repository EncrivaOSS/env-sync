/**
 * @clqu/storage - Temel Kullanım Örneği
 * 
 * Bu örnek, @clqu/storage paketinin temel kullanımını gösterir.
 * Doğrudan Storage sınıfını kullanarak veri kaydetme, alma, silme işlemlerini içerir.
 */

import { Storage } from '../src';

async function basicExample() {
	console.log('--- @clqu/storage: Temel Kullanım Örneği ---');

	// Secret Key ile storage örneği oluşturma
	const storage = new Storage('benim-gizli-anahtarim', 'mongodb://localhost:27017');

	// String veri kaydet
	console.log('1. String veri kaydediliyor...');
	await storage.set('username', 'ahmetcan');
	console.log('   String veri kaydedildi!');

	// Obje veri kaydet
	console.log('2. Obje veri kaydediliyor...');
	await storage.set('user-profile', {
		name: 'Ahmet Can',
		age: 28,
		email: 'ahmet@example.com',
		roles: ['admin', 'editor']
	});
	console.log('   Obje veri kaydedildi!');

	// String veri al
	console.log('3. String veri alınıyor...');
	const username = await storage.get('username');
	console.log(`   Username: ${username}`);

	// Obje veri al
	console.log('4. Obje veri alınıyor...');
	const profile = await storage.get('user-profile');
	console.log('   Profil:', profile);

	// Veri sil
	console.log('5. Veri siliniyor...');
	await storage.delete('username');
	console.log('   Veri silindi!');

	// Silinen veriyi kontrol et
	console.log('6. Silinen veriyi kontrol et...');
	const deletedUsername = await storage.get('username');
	console.log(`   Silinen veri sonucu: ${deletedUsername === null ? 'Veri bulunamadı' : deletedUsername}`);

	// Tüm verileri al
	console.log('7. Tüm verileri al...');
	const allData = await storage.getAll();
	console.log('   Tüm veriler:', allData);

	console.log('--- Temel Kullanım Örneği Tamamlandı ---');
}

// Örneği çalıştır
if (require.main === module) {
	basicExample().catch(err => {
		console.error('Hata oluştu:', err);
		process.exit(1);
	});
}

export { basicExample }; 