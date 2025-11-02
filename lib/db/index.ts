import { User, UserCard, CreditCard, CardOffer, Merchant } from '@/types';

// In-memory database (for MVP - replace with real database in production)
class InMemoryDB {
  private users: Map<string, User & { password: string }> = new Map();
  private userCards: Map<string, UserCard[]> = new Map();
  private cards: Map<string, CreditCard> = new Map();
  private offers: Map<string, CardOffer[]> = new Map();
  private merchants: Map<string, Merchant> = new Map();

  constructor() {
    this.seedData();
  }

  // User operations
  createUser(email: string, name: string, hashedPassword: string): User {
    const id = `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const user: User & { password: string } = {
      id,
      email,
      name,
      password: hashedPassword,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    this.userCards.set(id, []);
    return { id, email, name, createdAt: user.createdAt };
  }

  getUserByEmail(email: string): (User & { password: string }) | undefined {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return undefined;
  }

  getUserById(id: string): User | undefined {
    const user = this.users.get(id);
    if (!user) return undefined;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    };
  }

  // Card operations
  getAllCards(): CreditCard[] {
    return Array.from(this.cards.values());
  }

  getCardById(id: string): CreditCard | undefined {
    return this.cards.get(id);
  }

  // User card operations
  addUserCard(userId: string, cardId: string, nickname?: string): UserCard {
    const userCard: UserCard = {
      id: `uc_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      userId,
      cardId,
      nickname,
      addedAt: new Date(),
    };
    
    const userCardList = this.userCards.get(userId) || [];
    userCardList.push(userCard);
    this.userCards.set(userId, userCardList);
    
    return userCard;
  }

  getUserCards(userId: string): CreditCard[] {
    const userCardList = this.userCards.get(userId) || [];
    return userCardList
      .map(uc => this.cards.get(uc.cardId))
      .filter((card): card is CreditCard => card !== undefined);
  }

  removeUserCard(userId: string, cardId: string): boolean {
    const userCardList = this.userCards.get(userId) || [];
    const filtered = userCardList.filter(uc => uc.cardId !== cardId);
    this.userCards.set(userId, filtered);
    return filtered.length < userCardList.length;
  }

  // Offer operations
  getOffersForCard(cardId: string): CardOffer[] {
    return this.offers.get(cardId) || [];
  }

  getActiveOffersForCard(cardId: string): CardOffer[] {
    const now = new Date();
    return (this.offers.get(cardId) || []).filter(offer => {
      const isActive = offer.startDate <= now && (!offer.endDate || offer.endDate >= now);
      return isActive;
    });
  }

  // Merchant operations
  getAllMerchants(): Merchant[] {
    return Array.from(this.merchants.values());
  }

  getMerchantById(id: string): Merchant | undefined {
    return this.merchants.get(id);
  }

  getNearbyMerchants(lat: number, lng: number, radiusMeters: number = 5000): Merchant[] {
    return Array.from(this.merchants.values()).filter(merchant => {
      const distance = this.calculateDistance(
        lat, lng, 
        merchant.location.lat, 
        merchant.location.lng
      );
      return distance <= radiusMeters;
    });
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  private seedData() {
    // Seed credit cards
    const cards: CreditCard[] = [
      {
        id: 'card_chase_sapphire',
        name: 'Chase Sapphire Preferred',
        issuer: 'Chase',
        network: 'Visa',
        tier: 'Premium',
        annualFee: 95,
        baseRewardsRate: 1,
        imageUrl: '/cards/chase-sapphire.png',
      },
      {
        id: 'card_amex_gold',
        name: 'American Express Gold Card',
        issuer: 'American Express',
        network: 'Amex',
        tier: 'Gold',
        annualFee: 250,
        baseRewardsRate: 1,
        imageUrl: '/cards/amex-gold.png',
      },
      {
        id: 'card_citi_custom',
        name: 'Citi Custom Cash',
        issuer: 'Citi',
        network: 'Mastercard',
        tier: 'Standard',
        annualFee: 0,
        baseRewardsRate: 1,
        imageUrl: '/cards/citi-custom.png',
      },
      {
        id: 'card_capital_savor',
        name: 'Capital One SavorOne',
        issuer: 'Capital One',
        network: 'Mastercard',
        tier: 'Standard',
        annualFee: 0,
        baseRewardsRate: 1,
        imageUrl: '/cards/capital-savor.png',
      },
      {
        id: 'card_discover_it',
        name: 'Discover it Cash Back',
        issuer: 'Discover',
        network: 'Discover',
        tier: 'Standard',
        annualFee: 0,
        baseRewardsRate: 1,
        imageUrl: '/cards/discover-it.png',
      },
    ];

    cards.forEach(card => this.cards.set(card.id, card));

    // Seed card offers
    const offers: { cardId: string; offers: CardOffer[] }[] = [
      {
        cardId: 'card_chase_sapphire',
        offers: [
          {
            id: 'offer_chase_dining',
            cardId: 'card_chase_sapphire',
            category: 'dining',
            rewardsRate: 3,
            rewardsType: 'points',
            description: '3x points on dining',
            startDate: new Date('2024-01-01'),
            requiresActivation: false,
          },
          {
            id: 'offer_chase_travel',
            cardId: 'card_chase_sapphire',
            category: 'travel',
            rewardsRate: 2,
            rewardsType: 'points',
            description: '2x points on travel',
            startDate: new Date('2024-01-01'),
            requiresActivation: false,
          },
        ],
      },
      {
        cardId: 'card_amex_gold',
        offers: [
          {
            id: 'offer_amex_dining',
            cardId: 'card_amex_gold',
            category: 'dining',
            rewardsRate: 4,
            rewardsType: 'points',
            description: '4x points at restaurants',
            startDate: new Date('2024-01-01'),
            requiresActivation: false,
          },
          {
            id: 'offer_amex_grocery',
            cardId: 'card_amex_gold',
            category: 'groceries',
            rewardsRate: 4,
            rewardsType: 'points',
            description: '4x points at supermarkets',
            startDate: new Date('2024-01-01'),
            requiresActivation: false,
          },
        ],
      },
      {
        cardId: 'card_citi_custom',
        offers: [
          {
            id: 'offer_citi_custom',
            cardId: 'card_citi_custom',
            rewardsRate: 5,
            rewardsType: 'cashback',
            description: '5% cash back on top eligible purchase category',
            startDate: new Date('2024-01-01'),
            requiresActivation: false,
          },
        ],
      },
      {
        cardId: 'card_capital_savor',
        offers: [
          {
            id: 'offer_capital_dining',
            cardId: 'card_capital_savor',
            category: 'dining',
            rewardsRate: 3,
            rewardsType: 'cashback',
            description: '3% cash back on dining',
            startDate: new Date('2024-01-01'),
            requiresActivation: false,
          },
          {
            id: 'offer_capital_entertainment',
            cardId: 'card_capital_savor',
            category: 'entertainment',
            rewardsRate: 3,
            rewardsType: 'cashback',
            description: '3% cash back on entertainment',
            startDate: new Date('2024-01-01'),
            requiresActivation: false,
          },
        ],
      },
      {
        cardId: 'card_discover_it',
        offers: [
          {
            id: 'offer_discover_rotating',
            cardId: 'card_discover_it',
            rewardsRate: 5,
            rewardsType: 'cashback',
            description: '5% cash back on rotating categories',
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-12-31'),
            requiresActivation: true,
          },
        ],
      },
    ];

    offers.forEach(({ cardId, offers: cardOffers }) => {
      this.offers.set(cardId, cardOffers);
    });

    // Seed merchants
    const merchants: Merchant[] = [
      {
        id: 'merchant_starbucks',
        name: 'Starbucks',
        category: 'dining',
        location: {
          lat: 37.7749,
          lng: -122.4194,
          address: '123 Market St, San Francisco, CA',
        },
      },
      {
        id: 'merchant_wholefoods',
        name: 'Whole Foods',
        category: 'groceries',
        location: {
          lat: 37.7849,
          lng: -122.4094,
          address: '456 Bay St, San Francisco, CA',
        },
      },
      {
        id: 'merchant_chevron',
        name: 'Chevron Gas Station',
        category: 'gas',
        location: {
          lat: 37.7649,
          lng: -122.4294,
          address: '789 Main St, San Francisco, CA',
        },
      },
    ];

    merchants.forEach(merchant => this.merchants.set(merchant.id, merchant));
  }
}

export const db = new InMemoryDB();
