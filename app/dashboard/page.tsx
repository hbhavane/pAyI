'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, CardRecommendation, Merchant, UserLocation } from '@/types';
import { formatCurrency } from '@/lib/utils';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [allCards, setAllCards] = useState<CreditCard[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [recommendations, setRecommendations] = useState<CardRecommendation[]>([]);
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [selectedMerchant, setSelectedMerchant] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingCard, setAddingCard] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/');
      return;
    }

    setUser(JSON.parse(userData));
    loadData(token);
    requestLocation();
  }, []);

  const loadData = async (token: string) => {
    try {
      // Load user cards
      const cardsRes = await fetch('/api/cards/user', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const cardsData = await cardsRes.json();
      if (cardsData.success) {
        setCards(cardsData.data);
      }

      // Load all cards
      const allCardsRes = await fetch('/api/cards/all');
      const allCardsData = await allCardsRes.json();
      if (allCardsData.success) {
        setAllCards(allCardsData.data);
      }

      // Load merchants
      const merchantsRes = await fetch('/api/merchants');
      const merchantsData = await merchantsRes.json();
      if (merchantsData.success) {
        setMerchants(merchantsData.data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          });
        },
        (error) => {
          console.error('Location error:', error);
          // Use default SF location for demo
          setLocation({
            lat: 37.7749,
            lng: -122.4194,
            accuracy: 100,
            timestamp: Date.now(),
          });
        }
      );
    } else {
      // Use default SF location for demo
      setLocation({
        lat: 37.7749,
        lng: -122.4194,
        accuracy: 100,
        timestamp: Date.now(),
      });
    }
  };

  const getRecommendation = async (merchantId: string) => {
    const token = localStorage.getItem('token');
    if (!token || !location) return;

    setSelectedMerchant(merchantId);

    try {
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          merchantId,
          location: { lat: location.lat, lng: location.lng },
          transactionAmount: 100,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setRecommendations(data.data);
      }
    } catch (error) {
      console.error('Failed to get recommendations:', error);
    }
  };

  const addCard = async (cardId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setAddingCard(true);

    try {
      const res = await fetch('/api/cards/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cardId }),
      });

      const data = await res.json();
      if (data.success) {
        loadData(token);
      }
    } catch (error) {
      console.error('Failed to add card:', error);
    } finally {
      setAddingCard(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary-700">pAyI</h1>
              <p className="text-sm text-gray-600">Welcome back, {user?.name}</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* My Cards */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>My Credit Cards</CardTitle>
                <CardDescription>
                  {cards.length === 0
                    ? 'Add your credit cards to get personalized recommendations'
                    : `You have ${cards.length} card${cards.length !== 1 ? 's' : ''} in your portfolio`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {cards.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <p className="text-gray-600 mb-4">No cards added yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cards.map((card) => (
                      <div
                        key={card.id}
                        className="p-4 rounded-lg border-2 border-gray-200 bg-gradient-to-br from-primary-500 to-primary-700 text-white"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-semibold">{card.name}</p>
                            <p className="text-sm opacity-90">{card.issuer}</p>
                          </div>
                          <span className="text-xs bg-white/20 px-2 py-1 rounded">{card.network}</span>
                        </div>
                        <div className="mt-4">
                          <p className="text-xs opacity-75">Base Rewards</p>
                          <p className="text-lg font-bold">{card.baseRewardsRate}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Merchants */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Nearby Merchants</CardTitle>
                <CardDescription>
                  Select a merchant to get the best card recommendation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {merchants.map((merchant) => (
                    <div
                      key={merchant.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        selectedMerchant === merchant.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => getRecommendation(merchant.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{merchant.name}</p>
                          <p className="text-sm text-gray-600">{merchant.category}</p>
                          <p className="text-xs text-gray-500">{merchant.location.address}</p>
                        </div>
                        <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recommendations */}
            {recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Best Card</CardTitle>
                  <CardDescription>Recommended for this purchase</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recommendations.map((rec, idx) => (
                      <div
                        key={rec.card.id}
                        className={`p-4 rounded-lg ${
                          idx === 0
                            ? 'bg-gradient-to-br from-green-500 to-green-600 text-white'
                            : 'bg-gray-50 border border-gray-200'
                        }`}
                      >
                        {idx === 0 && (
                          <div className="flex items-center gap-2 mb-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="font-semibold text-sm">BEST CHOICE</span>
                          </div>
                        )}
                        <p className={`font-semibold ${idx === 0 ? '' : 'text-gray-900'}`}>
                          {rec.card.name}
                        </p>
                        <p className={`text-sm mt-1 ${idx === 0 ? 'text-white/90' : 'text-gray-600'}`}>
                          {rec.reason}
                        </p>
                        <div className="mt-3 pt-3 border-t border-white/20">
                          <div className="flex justify-between items-center">
                            <span className={`text-sm ${idx === 0 ? 'text-white/80' : 'text-gray-600'}`}>
                              Expected reward:
                            </span>
                            <span className={`font-bold text-lg ${idx === 0 ? '' : 'text-green-600'}`}>
                              {formatCurrency(rec.expectedReward)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className={`text-sm ${idx === 0 ? 'text-white/80' : 'text-gray-600'}`}>
                              Rewards rate:
                            </span>
                            <span className={`font-semibold ${idx === 0 ? '' : 'text-gray-900'}`}>
                              {rec.rewardsRate}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Add Cards */}
            <Card>
              <CardHeader>
                <CardTitle>Add Cards</CardTitle>
                <CardDescription>Expand your portfolio</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {allCards
                    .filter((card) => !cards.find((c) => c.id === card.id))
                    .map((card) => (
                      <div
                        key={card.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-primary-300 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">{card.name}</p>
                          <p className="text-xs text-gray-600">{card.issuer}</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => addCard(card.id)}
                          disabled={addingCard}
                        >
                          Add
                        </Button>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
