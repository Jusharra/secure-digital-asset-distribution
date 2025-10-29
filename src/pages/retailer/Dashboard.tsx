import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { CreditCard, DollarSign, Package, TrendingUp } from 'lucide-react';

interface DashboardStats {
  totalCards: number;
  activatedCards: number;
  totalRevenue: number;
  acceptedBids: number;
}

export function RetailerDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCards: 0,
    activatedCards: 0,
    totalRevenue: 0,
    acceptedBids: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get total and activated cards
      const { data: cards, error: cardsError } = await supabase
        .from('prepaid_cards')
        .select('id, redeemed, asset:asset_id(price)')
        .eq('retailer_id', user.id);

      if (cardsError) throw cardsError;

      const totalCards = cards?.length || 0;
      const activatedCards = cards?.filter(card => card.redeemed).length || 0;

      // Calculate total revenue
      const totalRevenue = cards?.reduce((sum, card) => {
        if (card.redeemed && card.asset?.price) {
          return sum + card.asset.price;
        }
        return sum;
      }, 0) || 0;

      // Get accepted bids count
      const { count: bidsCount, error: bidsError } = await supabase
        .from('distribution_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('retailer_id', user.id);

      if (bidsError) throw bidsError;

      setStats({
        totalCards,
        activatedCards,
        totalRevenue,
        acceptedBids: bidsCount || 0
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Retailer Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Monitor your card distribution and revenue metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Cards
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {stats.totalCards}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CreditCard className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Cards Activated
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {stats.activatedCards}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Revenue
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    ${stats.totalRevenue.toFixed(2)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Bids Accepted
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {stats.acceptedBids}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-8 bg-red-50 p-4 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}