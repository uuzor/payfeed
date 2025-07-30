# Vercel Deployment Guide for StreamPay

This guide will help you deploy your BasePay-powered streaming app to Vercel.

## 🚀 Quick Deploy

### Option 1: Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/streampay.git
   git push -u origin main
   ```

2. **Deploy with Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect the configuration
   - Click "Deploy"

### Option 2: Deploy with Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Follow the prompts**
   - Select your account/team
   - Confirm project settings
   - Deploy to production

## 📁 Project Structure for Vercel

```
/
├── api/                    # Vercel serverless functions
│   ├── auth/
│   │   └── connect.ts
│   ├── streams/
│   │   ├── index.ts
│   │   ├── [streamId].ts
│   │   └── user/[userId].ts
│   ├── messages.ts
│   ├── community/stats.ts
│   └── verify-access/[userId].ts
├── client/                 # React frontend
├── server/                 # Shared server logic
├── shared/                 # Shared schemas
├── vercel.json            # Vercel configuration
└── README.md
```

## ⚙️ Configuration

### vercel.json
The app is configured to:
- Use `nodejs20.x` runtime for API routes
- Build frontend with `vite build` command
- Serve the React app from the `dist` output directory
- Handle client-side routing with fallbacks
- Include database environment variable configuration

### Environment Variables (Required)
Set these in Vercel dashboard:
- `DATABASE_URL` - Your Neon/PostgreSQL database connection string

### Optional Environment Variables
- `VITE_TESTNET` - Set to `false` for mainnet
- `VITE_COMMUNITY_WALLET` - Custom community wallet address

## 🔧 Key Changes for Vercel

### 1. API Routes Migration
- Moved from Express routes to Vercel serverless functions
- Each route is now a separate file in `/api` directory
- Maintains the same REST API interface

### 2. Real-time Messaging
- Replaced WebSockets with polling-based messaging
- Messages update every 5 seconds automatically
- Maintains real-time feel without persistent connections

### 3. Storage
- Uses in-memory storage (resets between function calls)
- Easy to replace with external database (PostgreSQL, MongoDB)
- Consider upgrading to persistent storage for production

## 🎯 Post-Deployment

### 1. Test the App
- Connect your Base wallet
- Start a USDC stream
- Verify community feed access
- Test messaging functionality

### 2. Custom Domain (Optional)
- Go to Vercel dashboard
- Navigate to your project settings
- Add your custom domain

### 3. Analytics (Optional)
- Enable Vercel Analytics in project settings
- Monitor performance and usage

## 📊 Performance Considerations

### Serverless Function Limits
- 10-second execution limit (Hobby plan)
- 50-second limit (Pro/Team plans)
- Functions auto-scale based on traffic

### Storage Recommendations
For production, consider:
- **PostgreSQL**: Neon, Supabase, PlanetScale
- **MongoDB**: MongoDB Atlas
- **Redis**: Upstash Redis for caching

## 🔐 Security Notes

- API routes validate input using Zod schemas
- Wallet signature verification (placeholder - implement full verification)
- Rate limiting recommended for production
- Consider adding CORS configuration

## 🚨 Troubleshooting

### Build Errors
```bash
# Clear build cache
vercel --force

# Check build logs in Vercel dashboard
```

### API Errors
- Check function logs in Vercel dashboard
- Ensure all imports are correct
- Verify serverless function structure

### Missing Features
Some features work differently on Vercel:
- WebSockets → Polling (already implemented)
- In-memory storage → Consider external database
- File uploads → Use Vercel Blob or external service

## 📈 Scaling

### Traffic Growth
- Vercel auto-scales serverless functions
- Consider database connection pooling
- Monitor function execution times

### Feature Additions
- Add new API routes in `/api` directory
- Update frontend components as needed
- Maintain shared schemas in `/shared`

Your StreamPay app is now ready for production on Vercel! 🎉