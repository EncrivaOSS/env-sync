# @encriva/env-sync

![Version](https://img.shields.io/npm/v/@encriva/env-sync)
![License](https://img.shields.io/npm/l/@encriva/env-sync)
![Downloads](https://img.shields.io/npm/dt/@encriva/env-sync)

A powerful tool for synchronizing encrypted environment variables with database support.

## 📦 Installation

```bash
# Using npm
npm install @encriva/env-sync

# Using yarn
yarn add @encriva/env-sync

# Using pnpm
pnpm add @encriva/env-sync

# Using bun
bun add @encriva/env-sync
```

## 🚀 Quick Start

### CLI Usage

```bash
# Basic usage - wrap your command with env-sync
env-sync npm start

# Upload variables to database
env-sync --upload-variables npm run dev

# Force upload all variables
env-sync --force-upload-variables npm start

# Select specific variables
env-sync --select-variables "API_KEY,DATABASE_URL" npm start

# Auto grouping (experimental)
env-sync --auto-group npm start
```

### Programmatic Usage

```typescript
import { Storage } from '@encriva/env-sync';

async function example() {
  // Create storage instance
  const storage = new Storage('your-secret-key', 'mongodb://localhost:27017');
  
  // Store data
  await storage.set('config', {
    apiKey: 'your-api-key',
    dbUrl: 'mongodb://localhost:27017'
  });
  
  // Retrieve data
  const config = await storage.get('config');
  console.log(config);
  
  // Delete data
  await storage.delete('config');
}
```

## 🌟 Features

- 🔒 **Secure Encryption**: Securely encrypts your environment variables
- 🗄️ **MongoDB Support**: Centralized storage in database
- 🔄 **Auto Synchronization**: Automatic sync on application startup
- ⚡ **CLI Tool**: Easy command-line usage
- 🎯 **Selective Sync**: Sync only specific variables
- 📊 **Rich Logging**: Detailed logging capabilities
- 🔧 **Flexible Configuration**: Multiple configuration options

## 🛠️ Configuration

### Using Environment Variables

```bash
export ENVSYNC_SECRET_KEY="your-secret-key"
export ENVSYNC_ADAPTER_URL="mongodb://localhost:27017"
export ENVSYNC_DB_NAME="env-sync"
```

### Using Configuration File

Create an `env-sync.config.json` file:

```json
{
  "secret": "your-secret-key",
  "adapterURL": "mongodb://localhost:27017",
  "dbName": "env-sync"
}
```

## 📚 CLI Options

| Option | Description |
|--------|-------------|
| `--upload-variables` | Upload new environment variables to database |
| `--force-upload-variables` | Force upload all environment variables to database |
| `--select-variables <vars>` | Comma-separated list of variables (e.g., VAR1,VAR2) |
| `--auto-group` | Automatically group variables by prefix (experimental) |
| `--secret <key>` | Encryption key |
| `--adapter-url <url>` | MongoDB connection URL |
| `--no-logging` | Disable logging |

## 💡 Usage Examples

### React/Next.js Project

```bash
# Development environment
env-sync --upload-variables npm run dev

# Production build
env-sync npm run build
```

### Node.js API

```bash
# Start API
env-sync --force-upload-variables node server.js

# With PM2
env-sync pm2 start ecosystem.config.js
```

### With Docker

```dockerfile
FROM node:18
COPY . .
RUN npm install -g @encriva/env-sync
RUN npm install
CMD ["env-sync", "npm", "start"]
```

## 🔐 Security

- All data is protected with AES encryption
- Secret keys are never stored in plain text
- MongoDB connections can be secured with SSL/TLS

## 🤝 Contributing

We welcome contributions! Please submit pull requests via our [GitHub repository](https://github.com/encrivaOSS/env-sync).

## 📘 Documentation

For more detailed information, visit our [official documentation](https://developers.encriva.com/packages/env-sync?utm_source=npm&utm_medium=referral&utm_campaign=homepage).

## 📜 License

[MIT](LICENSE) © Encriva