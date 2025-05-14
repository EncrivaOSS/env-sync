/**
 * @clqu/storage - CLI ve .env Senkronizasyon Örneği
 * 
 * Bu örnek, @clqu/storage CLI aracının veritabanını .env dosyasıyla nasıl senkronize
 * ettiğini gösterir.
 */

import { Storage } from '../src';
import * as fs from 'fs';
import * as path from 'path';

// Örnek ortam değişkeni değerlerini ayarla
const SECRET_KEY = 'env-sync-ornek-anahtar';
process.env.CL_STORAGE_SECRET_KEY = SECRET_KEY;

// Örnek bir .env dosyası oluştur
const envPath = path.join(__dirname, '.env.example');
const envContent = `
# Mevcut değerler
MEVCUT_DEGISKEN=Bu değiştirilmeyecek
APP_NAME=Mevcut Uygulama İsmi

# Database bilgileri
DB_HOST=localhost
DB_PORT=3306
`;

async function cliEnvSyncExample() {
	console.log('Veritabanı-ENV Senkronizasyon Örneği');
	console.log('-----------------------------------');

	// Örnek .env dosyasını oluştur
	fs.writeFileSync(envPath, envContent);
	console.log(`Örnek .env dosyası oluşturuldu: ${envPath}`);
	console.log('İçeriği:\n', envContent);

	// Storage örneği oluştur
	const storage = new Storage();

	// Bazı değerler ekle (bunlar .env'e aktarılacak)
	console.log('\nVeritabanına değerler ekleniyor...');
	await storage.set('app_name', 'Yeni Uygulama İsmi');
	await storage.set('api_key', 'gizli-api-anahtari-123');
	await storage.set('debug_mode', true);
	await storage.set('max_users', 100);
	await storage.set('user_settings', { theme: 'dark', language: 'tr' }); // Obje, .env'e aktarılmayacak

	// Değerleri alalım
	const allData = await storage.getAll();
	console.log('\nVeritabanındaki tüm değerler:');
	console.log(allData);

	console.log('\n--- CLI KOMUTUNUN YAPACAĞI İŞLEMLER ---');

	// CLI komutunun yapacağı işlemler:
	// 1. Mevcut .env dosyasını oku
	let envVars: Record<string, string> = {};

	if (fs.existsSync(envPath)) {
		const currentEnv = fs.readFileSync(envPath, 'utf8');

		currentEnv.split('\n').forEach(line => {
			const trimmedLine = line.trim();
			if (trimmedLine && !trimmedLine.startsWith('#')) {
				const [key, ...values] = trimmedLine.split('=');
				if (key) {
					envVars[key.trim()] = values.join('=').trim();
				}
			}
		});
	}

	console.log('\nMevcut .env değişkenleri:');
	console.log(envVars);

	// 2. Veritabanından gelen değerleri ekle/güncelle
	console.log('\nVeritabanından gelen değerler .env dosyasına ekleniyor...');
	const updatedVars: string[] = [];

	for (const [key, value] of Object.entries(allData)) {
		// Sadece string, number ve boolean değerleri ekle
		if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
			const envKey = key.toUpperCase();
			envVars[envKey] = String(value);
			updatedVars.push(envKey);
			console.log(`${envKey}=${value} olarak ayarlandı`);
		} else {
			console.log(`${key}: Obje tipi olduğu için .env'e eklenmedi`);
		}
	}

	// 3. Güncellenmiş .env dosyasını oluştur
	let newEnvContent = '# Bu dosya cl-storage CLI tarafından güncellenmiştir\n\n';

	for (const [key, value] of Object.entries(envVars)) {
		if (updatedVars.includes(key)) {
			newEnvContent += `${key}=${value} # Updated by cl-storage\n`;
		} else {
			newEnvContent += `${key}=${value}\n`;
		}
	}

	// 4. Yeni .env dosyasını kaydet
	const newEnvPath = path.join(__dirname, '.env.updated.example');
	fs.writeFileSync(newEnvPath, newEnvContent);

	console.log(`\nGüncellenmiş .env dosyası oluşturuldu: ${newEnvPath}`);
	console.log('Yeni içerik:\n', newEnvContent);

	console.log('\n--- ÖRNEK TAMAMLANDI ---');
	console.log('Gerçek kullanımda, bu işlemi otomatik olarak yapmak için:');
	console.log('cl-storage bun run dev (veya npm start, vb.)');
}

// Örneği çalıştır
cliEnvSyncExample().catch(console.error); 