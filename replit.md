# StreamPay Community Platform

## Overview

This is a full-stack web application that enables cryptocurrency streaming payments using BasePay on the Base blockchain. The platform features a community-driven model where users stream USDC payments to gain access to an exclusive messaging feed and community features.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a monorepo structure with a clear separation between client and server code:

### Frontend Architecture
- **Framework**: React with TypeScript
- **Bundler**: Vite for development and production builds
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Real-time Communication**: WebSocket connection for live messaging

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Real-time**: WebSocket server for messaging
- **Session Management**: Express sessions with PostgreSQL store

## Key Components

### Database Schema
The application uses PostgreSQL with the following main entities:
- **Users**: Stores wallet addresses, usernames, and verification status
- **Streams**: Tracks payment streams with rates, amounts, and timing
- **Messages**: Community chat messages with metadata support
- **Community Stats**: Aggregated platform statistics

### Authentication & Access Control
- Wallet-based authentication using Base Account SDK
- Stream verification determines community access
- Off-chain logic for access control without smart contracts

### Payment Integration
- BasePay integration for USDC streaming on Base blockchain
- Support for both testnet and mainnet environments
- Real-time payment status tracking and verification

### Real-time Features
- WebSocket-based messaging system
- Live community feed with user interactions
- Real-time stream status updates

## Data Flow

1. **User Authentication**: Users connect via Base Account wallet
2. **Stream Creation**: Users initiate USDC streams to community wallet
3. **Access Verification**: System verifies active streams for community access
4. **Real-time Messaging**: Authenticated users participate in live community chat
5. **Payment Tracking**: Continuous monitoring of stream status and amounts

## External Dependencies

### Blockchain & Payments
- **@base-org/account**: Base Account SDK for wallet integration
- **@base-org/account-ui**: UI components for Base Account
- **@neondatabase/serverless**: Neon database connection

### UI Framework
- **Radix UI**: Accessible component primitives
- **shadcn/ui**: Pre-built component library
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Icon library

### Development Tools
- **Drizzle ORM**: Type-safe database operations
- **Zod**: Runtime type validation
- **date-fns**: Date manipulation utilities

## Deployment Strategy

### Development
- Vite dev server with HMR for frontend
- tsx for TypeScript execution in development
- Replit-specific configurations for cloud development

### Production Build
- Vite builds optimized frontend bundle
- esbuild compiles server code to ESM format
- Static assets served from Express with fallback routing

### Database Management
- Drizzle migrations for schema changes
- Connection pooling via Neon serverless
- Environment-based configuration

### Key Architectural Decisions

1. **Monorepo Structure**: Simplifies development and deployment while maintaining clear separation
2. **Off-chain Access Control**: Reduces gas costs by using stream verification instead of smart contracts
3. **WebSocket Integration**: Enables real-time community features without external services
4. **Type Safety**: End-to-end TypeScript with shared schemas between client and server
5. **Modular Components**: shadcn/ui provides consistent, accessible UI components
6. **BasePay Integration**: Leverages Base ecosystem for seamless USDC payments

The architecture prioritizes simplicity, type safety, and real-time user experience while maintaining cost-effectiveness through off-chain logic where possible.

## Recent Changes (January 2025)

### PostgreSQL Database Integration
✓ **Database Setup**: Integrated PostgreSQL with Drizzle ORM for persistent data storage
✓ **Schema Migration**: Created users, streams, messages, and community_stats tables
✓ **Storage Layer**: Replaced in-memory storage with DatabaseStorage class
✓ **API Updates**: Updated all serverless functions to use database connections
✓ **Real-time Stats**: Community statistics now persist and update across sessions

### Vercel Deployment Support
- **API Migration**: Converted Express routes to Vercel serverless functions in `/api` directory
- **Real-time Messaging**: Replaced WebSockets with polling-based system for Vercel compatibility
- **Configuration**: Added `vercel.json`, deployment guides, and environment setup
- **Error Resolution**: Fixed TypeScript errors in storage layer and component interfaces
- **Build Process**: Optimized for Vercel's build and deployment pipeline

### Architecture Updates for Production
1. **Database Layer**: PostgreSQL with Neon serverless for scalable data persistence
2. **API Routes**: Each endpoint now exists as a separate serverless function with database access
3. **Polling System**: Messages refresh every 5 seconds with persistent message history
4. **Storage Compatibility**: Full database integration with proper connection pooling
5. **Deployment Ready**: Complete Vercel deployment configuration with database support

The app now supports both local development (Express + PostgreSQL) and production deployment (Vercel + Neon) with full data persistence.