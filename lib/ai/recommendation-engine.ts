import { CreditCard, CardOffer, CardRecommendation, RecommendationRequest } from '@/types';
import { db } from '@/lib/db';

interface ScoringFactors {
  rewardsRate: number;
  annualFeeFactor: number;
  categoryMatch: number;
  baseRewards: number;
}

export class RecommendationEngine {
  /**
   * Get the best card recommendation for a user at a specific merchant
   */
  async getRecommendation(
    request: RecommendationRequest
  ): Promise<CardRecommendation[]> {
    // Get user's cards
    const userCards = db.getUserCards(request.userId);
    
    if (userCards.length === 0) {
      return [];
    }

    // Get merchant details
    const merchant = db.getMerchantById(request.merchantId);
    if (!merchant) {
      return [];
    }

    // Score and rank each card
    const recommendations: CardRecommendation[] = [];

    for (const card of userCards) {
      const offers = db.getActiveOffersForCard(card.id);
      const recommendation = this.scoreCard(card, offers, merchant.category, request.transactionAmount);
      recommendations.push(recommendation);
    }

    // Sort by score (highest first)
    recommendations.sort((a, b) => b.score - a.score);

    return recommendations;
  }

  /**
   * Score a card based on multiple factors
   */
  private scoreCard(
    card: CreditCard,
    offers: CardOffer[],
    merchantCategory: string,
    transactionAmount?: number
  ): CardRecommendation {
    const amount = transactionAmount ?? 100;
    let bestOffer: CardOffer | undefined;
    let maxRewardsRate = card.baseRewardsRate;
    let reason = `Base ${card.baseRewardsRate}% rewards`;

    // Check for category-specific offers
    for (const offer of offers) {
      if (offer.category === merchantCategory && offer.rewardsRate > maxRewardsRate) {
        maxRewardsRate = offer.rewardsRate;
        bestOffer = offer;
        reason = offer.description;
      }
    }

    // Check for merchant-specific offers (higher priority)
    for (const offer of offers) {
      if (offer.merchantId && offer.rewardsRate > maxRewardsRate) {
        maxRewardsRate = offer.rewardsRate;
        bestOffer = offer;
        reason = offer.description;
      }
    }

    // Calculate expected reward
    const expectedReward = (amount * maxRewardsRate) / 100;

    // Calculate score using multiple factors
    const factors: ScoringFactors = {
      rewardsRate: maxRewardsRate,
      annualFeeFactor: this.calculateAnnualFeeFactor(card.annualFee, amount),
      categoryMatch: bestOffer ? 1.2 : 1.0,
      baseRewards: card.baseRewardsRate,
    };

    const score = this.calculateScore(factors);

    return {
      card,
      offer: bestOffer,
      expectedReward,
      rewardsRate: maxRewardsRate,
      reason,
      score,
    };
  }

  /**
   * Calculate annual fee factor (negative impact on score)
   */
  private calculateAnnualFeeFactor(annualFee: number, transactionAmount: number): number {
    if (annualFee === 0) return 1.0;
    
    // Amortize annual fee over assumed annual spending
    const assumedAnnualSpending = transactionAmount * 52; // weekly transaction
    const feeImpact = annualFee / assumedAnnualSpending;
    
    return Math.max(0, 1 - feeImpact);
  }

  /**
   * Calculate final score based on multiple factors
   */
  private calculateScore(factors: ScoringFactors): number {
    const weights = {
      rewardsRate: 0.5,
      annualFeeFactor: 0.2,
      categoryMatch: 0.2,
      baseRewards: 0.1,
    };

    const score =
      factors.rewardsRate * weights.rewardsRate +
      factors.annualFeeFactor * 10 * weights.annualFeeFactor +
      factors.categoryMatch * 10 * weights.categoryMatch +
      factors.baseRewards * weights.baseRewards;

    return score;
  }

  /**
   * Analyze user spending patterns (placeholder for ML enhancement)
   */
  async analyzeSpendingPatterns(userId: string): Promise<{
    topCategories: string[];
    averageTransaction: number;
    monthlySpending: number;
  }> {
    // This is a placeholder for future ML implementation
    // In production, this would analyze transaction history
    return {
      topCategories: ['dining', 'groceries', 'gas'],
      averageTransaction: 75,
      monthlySpending: 2500,
    };
  }

  /**
   * Suggest cards user should add to portfolio
   */
  async suggestCards(userId: string): Promise<CreditCard[]> {
    const userCards = db.getUserCards(userId);
    const allCards = db.getAllCards();
    
    // Get spending patterns
    const patterns = await this.analyzeSpendingPatterns(userId);
    
    // Filter out cards user already has
    const userCardIds = new Set(userCards.map(c => c.id));
    const availableCards = allCards.filter(c => !userCardIds.has(c.id));
    
    // Score available cards based on user's spending patterns
    const scoredCards = availableCards.map(card => {
      const offers = db.getActiveOffersForCard(card.id);
      let score = card.baseRewardsRate;
      
      // Bonus for cards with offers in user's top categories
      for (const offer of offers) {
        if (offer.category && patterns.topCategories.includes(offer.category)) {
          score += offer.rewardsRate * 2;
        }
      }
      
      // Penalty for high annual fees
      score -= card.annualFee / 1000;
      
      return { card, score };
    });
    
    // Sort by score and return top suggestions
    scoredCards.sort((a, b) => b.score - a.score);
    return scoredCards.slice(0, 3).map(s => s.card);
  }
}

export const recommendationEngine = new RecommendationEngine();
