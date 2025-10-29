import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { DollarSign, TrendingUp, CreditCard, Calendar } from 'lucide-react';

interface EarningsSummary {
  totalEarnings: number;
  monthlyEarnings: number;
  pendingPayouts: number;
  lastPayout: number;
}

export function EarningsPanel() {
  const [earnings, setEarnings] = useState<EarningsSummary>({
    totalEarnings: 0,
    monthlyEarnings: 0,
    pendingPayouts: 0,
    lastPayout: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEarnings();
  }, []);

  const loadEarnings = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Get all assets for this creator
      const { data: assets, error: assetsError } = await supabase
        .from('digital_assets')
        .select('id')
        .eq('creator_id', user.id);

      if (assetsError) throw assetsError;

      if (!assets || assets.length === 0) {
        setEarnings({
          totalEarnings: 0,
          monthlyEarnings: 0,
          pendingPayouts: 0,
          lastPayout: 0
        });
        return;
      }

      const assetIds = assets.map(asset => asset.id);

      // Get total redeemed cards
      const { count: totalRedeemed } = await supabase
        .from('prepaid_cards')
        .select('*', { count: 'exact', head: true })
        .eq('redeemed', true)
        .in('asset_id', assetIds);

      // Get monthly redeemed cards
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: monthlyRedeemed } = await supabase
        .from('prepaid_cards')
        .select('*', { count: 'exact', head: true })
        .eq('redeemed', true)
        .gte('redeemed_at', startOfMonth.toISOString())
        .in('asset_id', assetIds);

      const totalEarnings = (totalRedeemed || 0) * 5; // $5 per redemption
      const monthlyEarnings = (monthlyRedeemed || 0) * 5;

      setEarnings({
        totalEarnings,
        monthlyEarnings,
        pendingPayouts: totalEarnings * 0.2, // 20% pending
        lastPayout: totalEarnings * 0.8 // 80% already paid out
      });
    } catch (err) {
      console.error('Error loading earnings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load earnings');
      setEarnings({
        totalEarnings: 0,
        monthlyEarnings: 0,
        pendingPayouts: 0,
        lastPayout: 0
      });
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

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading earnings</h3>
            <p className="mt-2 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Earnings Summary */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Earnings
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    ${earnings.totalEarnings.toFixed(2)}
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
                    Monthly Earnings
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    ${earnings.monthlyEarnings.toFixed(2)}
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
                    Pending Payout
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    ${earnings.pendingPayouts.toFixed(2)}
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
                <Calendar className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Last Payout
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    ${earnings.lastPayout.toFixed(2)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payout Information */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Payout Information
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>
              Payouts are processed monthly for earnings over $50. Next payout date:
              {' '}
              {new Date(new Date().setDate(1)).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>
          <div className="mt-5">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Update Payment Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}