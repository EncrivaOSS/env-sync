/**
 * @clqu/storage - Farklı Veri Tipleri ile Kullanım Örneği
 * 
 * Bu örnek, @clqu/storage paketinin farklı veri tipleri (string, number, boolean, object, array)
 * ile kullanımını ve bu verilerin şifrelenip çözülmesini gösterir.
 */

import { Storage } from '../src';

async function dataTypesExample() {
	console.log('--- @clqu/storage: Farklı Veri Tipleri Örneği ---');

	// Özel test secret key ile storage örneği oluştur
	const storage = new Storage('data-types-secret-key', 'mongodb://localhost:27017');

	// 1. String veri tipi
	console.log('1. String veri tipi test ediliyor...');
	await storage.set('string-key', 'Bu bir string değer');
	const stringValue = await storage.get('string-key');
	console.log('   String değer:', stringValue);
	console.log('   Tip:', typeof stringValue);

	// 2. Number veri tipi
	console.log('\n2. Number veri tipi test ediliyor...');

	// Integer sayı
	await storage.set('integer-key', 42);
	const intValue = await storage.get('integer-key');
	console.log('   Integer değer:', intValue);
	console.log('   Tip:', typeof intValue);

	// Float sayı
	await storage.set('float-key', 3.14159);
	const floatValue = await storage.get('float-key');
	console.log('   Float değer:', floatValue);
	console.log('   Tip:', typeof floatValue);

	// 3. Boolean veri tipi
	console.log('\n3. Boolean veri tipi test ediliyor...');
	await storage.set('bool-true-key', true);
	await storage.set('bool-false-key', false);

	const trueValue = await storage.get('bool-true-key');
	const falseValue = await storage.get('bool-false-key');

	console.log('   Boolean (true) değer:', trueValue);
	console.log('   Tip:', typeof trueValue);
	console.log('   Boolean (false) değer:', falseValue);
	console.log('   Tip:', typeof falseValue);

	// 4. Object veri tipi
	console.log('\n4. Object veri tipi test ediliyor...');
	const testObject = {
		name: 'Test Kullanıcı',
		age: 30,
		isActive: true,
		metadata: {
			registeredAt: new Date().toISOString(),
			lastLogin: new Date().toISOString(),
			preferences: {
				theme: 'dark',
				notifications: true
			}
		},
		tags: ['premium', 'verified']
	};

	await storage.set('object-key', testObject);
	const objectValue = await storage.get('object-key');

	console.log('   Object değer:');
	console.log(objectValue);
	console.log('   Tip:', typeof objectValue);
	console.log('   İç içe obje erişimi:', objectValue.metadata.preferences.theme);

	// 5. Array veri tipi
	console.log('\n5. Array veri tipi test ediliyor...');
	const testArray = [
		'string eleman',
		123,
		true,
		{ key: 'value' },
		['nested', 'array']
	];

	await storage.set('array-key', testArray);
	const arrayValue = await storage.get('array-key');

	console.log('   Array değer:');
	console.log(arrayValue);
	console.log('   Tip:', typeof arrayValue);
	console.log('   Array.isArray sonucu:', Array.isArray(arrayValue));
	console.log('   Array uzunluğu:', arrayValue.length);

	// 6. Null ve undefined
	console.log('\n6. Null ve undefined değerleri test ediliyor...');
	await storage.set('null-key', null);
	await storage.set('undefined-key', undefined);

	const nullValue = await storage.get('null-key');
	const undefinedValue = await storage.get('undefined-key');

	console.log('   Null değer:', nullValue);
	console.log('   Undefined değer:', undefinedValue);

	// 7. Date objesi
	console.log('\n7. Date objesi test ediliyor...');
	const currentDate = new Date();
	await storage.set('date-key', currentDate);

	const dateValue = await storage.get('date-key');
	console.log('   Kaydedilen tarih:', currentDate.toISOString());
	console.log('   Alınan değer:', dateValue);
	console.log('   Tip:', typeof dateValue);
	console.log('   Not: Date objesi string olarak saklanır, yeniden Date objesine çevirmek gerekir.');
	console.log('   Yeniden oluşturulan Date:', new Date(dateValue));

	// Temizlik: Test verilerini sil
	console.log('\nTüm test verileri temizleniyor...');
	await storage.delete('string-key');
	await storage.delete('integer-key');
	await storage.delete('float-key');
	await storage.delete('bool-true-key');
	await storage.delete('bool-false-key');
	await storage.delete('object-key');
	await storage.delete('array-key');
	await storage.delete('null-key');
	await storage.delete('undefined-key');
	await storage.delete('date-key');
	console.log('Test verileri temizlendi!');

	console.log('--- Farklı Veri Tipleri Örneği Tamamlandı ---');
}

// Örneği çalıştır
if (require.main === module) {
	dataTypesExample().catch(err => {
		console.error('Hata oluştu:', err);
		process.exit(1);
	});
}

export { dataTypesExample }; 