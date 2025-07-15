# Fractal Ordinals Marketplace API

A comprehensive backend API for trading Bitcoin Ordinals on the Fractal network. This marketplace enables users to list, buy, and sell Ordinals using Bitcoin transactions with PSBT (Partially Signed Bitcoin Transaction) technology.

## 🚀 Features

- **Ordinal Listings**: Create, update, and manage Ordinal listings
- **Offer System**: Make and submit offers for listed Ordinals
- **PSBT Integration**: Secure transaction handling with Partially Signed Bitcoin Transactions
- **Rate Limiting**: API protection with mutex-based rate limiting
- **Swagger Documentation**: Interactive API documentation
- **MongoDB Integration**: Persistent data storage
- **Multi-Network Support**: Testnet and Mainnet configurations
- **Vercel Deployment**: Ready for cloud deployment

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🔧 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Bitcoin wallet with Ordinal support
- Fractal network access

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/bitman09/fractal-ordinals-marketplace.git
   cd fractal-ordinals-marketplace
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Network Configuration
   NETWORKTYPE=testnet
   PORT=9000
   
   # MongoDB Configuration
   DB_USERNAME=your_mongodb_username
   DB_PASSWORD=your_mongodb_password
   DB_HOST=your_mongodb_host
   DB_NAME=fractal_ordinals_marketplace
   
   # Bitcoin Configuration
   PRIVATE_KEY=your_private_key_for_transactions
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NETWORKTYPE` | Network type (testnet/mainnet) | testnet | Yes |
| `PORT` | Server port | 9000 | No |
| `DB_USERNAME` | MongoDB username | - | Yes |
| `DB_PASSWORD` | MongoDB password | - | Yes |
| `DB_HOST` | MongoDB host | - | Yes |
| `DB_NAME` | MongoDB database name | - | Yes |
| `PRIVATE_KEY` | Bitcoin private key for transactions | - | Yes |

### Network Types

- **testnet**: For development and testing
- **mainnet**: For production use

## 🚀 Usage

### Starting the Server

```bash
# Development mode with hot reload
npm run dev

# Production mode
npm start

# Build the project
npm run build
```

### Accessing the API

- **Server Status**: `http://localhost:9000/`
- **API Documentation**: `http://localhost:9000/api-docs`
- **API Base URL**: `http://localhost:9000/api`

## 📚 API Documentation

### Core Endpoints

#### Listing Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/create-listing` | Create a new Ordinal listing |
| `POST` | `/api/save-listing` | Save a signed listing PSBT |
| `PUT` | `/api/update-listing` | Update an existing listing |
| `DELETE` | `/api/delete-listing` | Remove a listing from marketplace |

#### Offer Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/create-offer` | Create an offer for a listing |
| `POST` | `/api/submit-offer` | Submit a signed offer PSBT |

### Request/Response Examples

#### Create Listing
```json
POST /api/create-listing
{
  "ordinalId": "1234567890abcdef",
  "price": 0.001,
  "sellerPaymentAddress": "bc1q...",
  "sellerOrdinalPublicKey": "02...",
  "ordinalUtxoTxId": "abc123...",
  "ordinalUtxoVout": 0
}
```

#### Create Offer
```json
POST /api/create-offer
{
  "listingId": "listing_123",
  "buyerPaymentAddress": "bc1q...",
  "buyerOrdinalPublicKey": "02..."
}
```

## 📁 Project Structure

```
fractal-ordinals-marketplace/
├── config/                 # Configuration files
│   ├── config.ts          # Environment and app config
│   ├── db.ts              # Database connection
│   └── index.ts           # Config exports
├── model/                  # Database models
│   └── OrderModel/        # Order/Listing schema
├── routes/                 # API route handlers
│   ├── ListingRoute/      # Listing management routes
│   └── OfferRoute/        # Offer management routes
├── service/                # Business logic services
│   ├── psbt/              # PSBT handling
│   ├── utxo/              # UTXO management
│   └── wallet/            # Wallet operations
├── utils/                  # Utility functions
│   ├── getBlock.api.ts    # Block API utilities
│   ├── mutex.ts           # Rate limiting utilities
│   ├── types.ts           # TypeScript type definitions
│   └── unisat.api.ts      # Unisat API integration
├── index.ts               # Main application entry point
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── vercel.json            # Vercel deployment config
└── README.md              # This file
```

## 🗄️ Database Schema

### Order Model

```typescript
interface Order {
  ordinalId: string;           // Unique Ordinal identifier
  price: number;               // Listing price in BTC
  sellerPaymentAddress: string; // Seller's payment address
  sellerOrdinalPublicKey: string; // Seller's public key
  status: 'Active' | 'Pending' | 'Sold'; // Listing status
  ordinalUtxoTxId: string;     // UTXO transaction ID
  ordinalUtxoVout: number;     // UTXO output index
  serviceFee?: number;         // Platform service fee
  signedListingPSBT: string;   // Signed PSBT for listing
  createdAt?: Date;            // Creation timestamp
  updatedAt?: Date;            // Last update timestamp
}
```

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run ts.check     # TypeScript type checking
npm run build        # Build for production

# Production
npm start            # Start production server
npm run add-build    # Add built files to git
```

### Code Quality

- **TypeScript**: Full type safety
- **ESLint**: Code linting (if configured)
- **Pre-commit hooks**: Automatic type checking and building

## 🚀 Deployment

### Vercel Deployment

This project is configured for Vercel deployment:

1. **Build Configuration**: See `vercel.json`
2. **Environment Variables**: Set in Vercel dashboard
3. **Deploy Command**: `npm run build`

### Manual Deployment

```bash
# Build the project
npm run build

# Start production server
npm start
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Run tests and checks**
   ```bash
   npm run ts.check
   npm run build
   ```
5. **Commit your changes**
   ```bash
   git commit -m "feat: add your feature description"
   ```
6. **Push to your branch**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Create a Pull Request**

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Build/tooling changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Contact

- **LinkedIn**: [Michal Stefanow](https://www.linkedin.com/in/michalstefanow/)
- **Telegram**: [@mylord1_1](https://t.me/mylord1_1)

## 🙏 Acknowledgments

- Bitcoin Ordinals community
- Fractal network developers
- PSBT technology contributors

---

**Note**: This is a production-ready API for trading Bitcoin Ordinals on the Fractal network. Ensure you understand the risks associated with cryptocurrency trading and always test thoroughly on testnet before using mainnet. 