# pAyI - AI Credit Card Rewards Optimizer

An AI-powered credit card rewards optimization platform that helps users maximize their cashback and rewards through intelligent, location-based recommendations.

## 🎯 Features

- **AI-Powered Recommendations**: Smart algorithm analyzes your cards and merchant categories to suggest the best card for each purchase
- **Location-Based Detection**: Real-time merchant identification and nearby store tracking
- **Card Portfolio Management**: Easy-to-use interface to manage your credit card portfolio
- **Intelligent Offer Matching**: Automatic matching of merchant categories with card-specific bonus categories
- **Real-time Calculations**: Instant reward calculations factoring in annual fees, rotating categories, and special offers
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom component library
- **State Management**: React Hooks

### Backend
- **Runtime**: Node.js
- **API**: Next.js API Routes
- **Authentication**: JWT with bcrypt
- **Database**: In-memory database (production-ready for PostgreSQL/MongoDB migration)

### AI/ML
- **Recommendation Engine**: Custom scoring algorithm
- **Factors Considered**:
  - Rewards rate and multipliers
  - Annual fee amortization
  - Category matching
  - Merchant-specific offers
  - User spending patterns

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/hbhavane/pAyI.git
cd pAyI
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your configuration:
```env
JWT_SECRET=your-secret-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📱 Usage

### Getting Started
1. **Sign Up**: Create an account with your email and password
2. **Add Cards**: Build your credit card portfolio by adding your cards
3. **Enable Location**: Allow location access for merchant detection
4. **Get Recommendations**: Select a nearby merchant to see which card gives you the best rewards

### Example Flow
1. You arrive at Starbucks
2. The app detects nearby merchants
3. Select "Starbucks" from the merchant list
4. pAyI analyzes all your cards and shows:
   - Best card to use (e.g., "Amex Gold - 4x points on dining")
   - Expected reward amount
   - Comparison with other cards in your wallet

## 🎨 Key Components

### Authentication System
- Secure JWT-based authentication
- Password hashing with bcrypt
- Protected API routes

### Card Management
- Add/remove cards from portfolio
- View card details and base rewards
- Browse all available cards

### Recommendation Engine
- Multi-factor scoring algorithm
- Category-based matching
- Annual fee optimization
- Real-time calculations

### Merchant Detection
- Location-based merchant discovery
- Category identification
- Distance calculations

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login to existing account
- `GET /api/auth/me` - Get current user info

### Cards
- `GET /api/cards/all` - Get all available cards
- `GET /api/cards/user` - Get user's cards
- `POST /api/cards/user` - Add card to portfolio
- `DELETE /api/cards/user` - Remove card from portfolio

### Recommendations
- `POST /api/recommendations` - Get card recommendations for a merchant

### Offers
- `GET /api/offers?cardId={id}` - Get offers for a specific card

### Merchants
- `GET /api/merchants` - Get all merchants
- `GET /api/merchants?lat={lat}&lng={lng}&radius={radius}` - Get nearby merchants

## 🗄️ Data Models

### User
- id, email, name, createdAt

### CreditCard
- id, name, issuer, network, tier, annualFee, baseRewardsRate

### CardOffer
- id, cardId, merchantId, category, rewardsRate, rewardsType, description

### Merchant
- id, name, category, location

## 🔒 Security

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens with 7-day expiration
- Protected API routes with token verification
- Input validation on all endpoints

## 📈 Future Enhancements

- [ ] Real database integration (PostgreSQL + MongoDB)
- [ ] Google Maps API integration
- [ ] Plaid API for transaction syncing
- [ ] Push notifications (FCM)
- [ ] Machine learning for spending pattern analysis
- [ ] Offer web scraping/API integrations
- [ ] PWA support for mobile
- [ ] Transaction history tracking
- [ ] Advanced analytics dashboard
- [ ] Multi-user household support

## 🛠️ Development

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Lint Code
```bash
npm run lint
```

## 📦 Deployment

This app is ready to deploy to:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **AWS/Google Cloud**
- **Docker** (containerized deployment)

### Vercel Deployment
```bash
vercel deploy
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

ISC License

## 👥 Authors

- GitHub: [@hbhavane](https://github.com/hbhavane)

---

Built with ❤️ using Next.js, TypeScript, and AI