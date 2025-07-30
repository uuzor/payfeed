# StreamPay Community Platform

A BasePay-powered financial streaming app with proof-of-pay community access and social feed features.

## Features

- **Wallet Connection**: Connect using Base Account SDK
- **USDC Streaming**: Stream payments to community wallet using BasePay
- **Proof-of-Pay Access**: Exclusive community feed for active streamers
- **Real-time Messaging**: Community chat for verified streamers
- **Stream Management**: Start, pause, and resume payment streams

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Vercel Serverless Functions
- **Styling**: Tailwind CSS + shadcn/ui
- **Blockchain**: Base blockchain (USDC streaming)
- **Payment**: BasePay integration
- **Authentication**: Base Account wallet signatures

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build:vercel
```

## Deployment to Vercel

### Option 1: Connect to Git

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will automatically detect the configuration

### Option 2: Deploy with Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow the prompts to configure your project

### Environment Variables

The app works with default settings, but you can customize:

- `VITE_TESTNET` - Set to `false` for mainnet (default: `true`)
- `VITE_COMMUNITY_WALLET` - Custom community wallet address

## Architecture

- **API Routes**: Located in `/api` directory for Vercel serverless functions
- **Storage**: In-memory storage (easily replaceable with database)
- **Real-time**: Polling-based messaging (Vercel compatible)
- **Authentication**: Wallet-based using Base Account signatures

## Usage

1. Connect your Base Account wallet
2. Set up a USDC stream to the community wallet
3. Access the exclusive community feed
4. Chat with other verified streamers
5. Manage your active streams

## Community Wallet

Default: `0x742d35Cc6634C0532925a3b844Bc9e7595f6E456`

Users stream USDC to this address to gain community access. Stream verification is done off-chain for gas efficiency.



