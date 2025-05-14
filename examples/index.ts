/**
 * @clqu/storage - Tüm Kullanım Örnekleri
 * 
 * Bu dosya, tüm kullanım örneklerini içeren ana dosyadır.
 * İstenilen örneği çalıştırmak için aşağıdaki komutları kullanabilirsiniz:
 * 
 * Tüm örnekler:
 * - npm run build && node dist/examples/index.js
 * 
 * Belirli bir örnek:
 * - npm run build && node dist/examples/index.js basic
 * - npm run build && node dist/examples/index.js config
 * - npm run build && node dist/examples/index.js env
 * - npm run build && node dist/examples/index.js types
 */

import { basicExample } from './basic-usage';
import { configFileExample } from './config-file-usage';
import { envVariablesExample } from './env-variables-usage';
import { dataTypesExample } from './data-types-usage';
import { combinedConfigExample } from './combined-config-usage';

// Kullanım bilgisini göster
function showUsage() {
	console.log(`
@clqu/storage - Kullanım Örnekleri

Kullanım: node dist/examples/index.js [örnek-adı]

Mevcut örnekler:
  basic   - Temel kullanım örneği
  config  - Yapılandırma dosyası örneği
  env     - Çevresel değişkenler örneği
  types   - Farklı veri tipleri örneği
  combined - Çevresel değişkenler ve yapılandırma dosyası örneği
  all     - Tüm örnekleri çalıştır
  
Örnek: 
  node dist/examples/index.js basic
  `);
}

// Tüm örnekleri çalıştır
async function runAllExamples() {
	console.log('=== TÜM ÖRNEKLER ÇALIŞTIRILIYOR ===\n');

	try {
		console.log('\n🔹 ÖRNEK 1: Temel Kullanım');
		await basicExample();

		console.log('\n🔹 ÖRNEK 2: Yapılandırma Dosyası Kullanımı');
		await configFileExample();

		console.log('\n🔹 ÖRNEK 3: Çevresel Değişkenler ile Kullanım');
		await envVariablesExample();

		console.log('\n🔹 ÖRNEK 4: Farklı Veri Tipleri ile Kullanım');
		await dataTypesExample();

		console.log('\n🔹 ÖRNEK 5: Çevresel değişkenler ve yapılandırma dosyası örneği');
		await combinedConfigExample();

		console.log('\n=== TÜM ÖRNEKLER BAŞARIYLA TAMAMLANDI ===');
	} catch (error) {
		console.error('Hata oluştu:', error);
		process.exit(1);
	}
}

// Ana fonksiyon
async function main() {
	const args = process.argv.slice(2);
	const exampleName = args[0]?.toLowerCase();

	if (!exampleName) {
		showUsage();
		process.exit(0);
	}

	try {
		switch (exampleName) {
			case 'basic':
				await basicExample();
				break;

			case 'config':
				await configFileExample();
				break;

			case 'env':
				await envVariablesExample();
				break;

			case 'types':
				await dataTypesExample();
				break;

			case 'combined':
				await combinedConfigExample();
				break;

			case 'all':
				await runAllExamples();
				break;

			default:
				console.error(`Bilinmeyen örnek: ${exampleName}`);
				showUsage();
				process.exit(1);
		}
	} catch (error) {
		console.error('Örnek çalıştırılırken hata oluştu:', error);
		process.exit(1);
	}
}

// Dosya doğrudan çalıştırıldıysa main() fonksiyonunu çalıştır
if (require.main === module) {
	main().catch(console.error);
}

export {
	basicExample,
	configFileExample,
	envVariablesExample,
	dataTypesExample
}; 