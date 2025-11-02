// User types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface UserCard {
  id: string;
  userId: string;
  cardId: string;
  nickname?: string;
  addedAt: Date;
}

// Card types
export interface CreditCard {
  id: string;
  name: string;
  issuer: string;
  network: 'Visa' | 'Mastercard' | 'Amex' | 'Discover';
  tier: 'Standard' | 'Gold' | 'Platinum' | 'Premium';
  annualFee: number;
  baseRewardsRate: number;
  imageUrl?: string;
}

export interface CardOffer {
  id: string;
  cardId: string;
  merchantId?: string;
  category?: string;
  rewardsRate: number;
  rewardsType: 'cashback' | 'points' | 'miles';
  description: string;
  startDate: Date;
  endDate?: Date;
  requiresActivation: boolean;
  minimumSpend?: number;
}

// Merchant types
export interface Merchant {
  id: string;
  name: string;
  category: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  placeId?: string;
}

// Recommendation types
export interface CardRecommendation {
  card: CreditCard;
  offer?: CardOffer;
  expectedReward: number;
  rewardsRate: number;
  reason: string;
  score: number;
}

export interface RecommendationRequest {
  userId: string;
  merchantId: string;
  transactionAmount?: number;
  location: {
    lat: number;
    lng: number;
  };
}

// Location types
export interface UserLocation {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'recommendation' | 'offer' | 'alert';
  read: boolean;
  createdAt: Date;
  data?: any;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
