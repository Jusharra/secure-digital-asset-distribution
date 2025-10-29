import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { TrendingUp, Users, CreditCard } from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalAssets: number;
  totalCards: number;
  redemptionRate: number;
  activeCreators: number;
  activeRetailers: number;
  activeConsumers: number;
}

interface AccessTrend {
  date: string;
  count: number;
}

export function InsightsDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalAssets: 0,
    totalCards: 0,
    redemptionRate: 0,
    activeCreators: 0,
    activeRetailers: 0,
    activeConsumers: 0
  });
  const [accessTrends, setAccessTrends] = useState<AccessTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
    fetchAccessTrends();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch total users by role
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('role');

      if (usersError) throw usersError;

      // Fetch total assets
      const { count: assetsCount, error: assetsError } = await supabase
        .from('digital_assets')
        .select('id', { count: 'exact' });

      if (assetsError) throw assetsError;

      // Fetch prepaid cards stats
      const { data: cards, error: cardsError } = await supabase
        .from('prepaid_cards')
        .select('redeemed');

      if (cardsError) throw cardsError;

      const roleStats = users?.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const redeemedCards = cards?.filter(card => card.redeemed).length || 0;
      const redemptionRate = cards?.length ? (redeemedCards / cards.length) * 100 : 0;

      setStats({
        totalUsers: users?.length || 0,
        totalAssets: assetsCount || 0,
        totalCards: cards?.length || 0,
        redemptionRate,
        activeCreators: roleStats?.creator || 0,
        activeRetailers: roleStats?.retailer || 0,
        activeConsumers: roleStats?.consumer || 0
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
    }
  };

  const fetchAccessTrends = async () => {
    try {
      const { data, error } = await supabase
        .from('asset_access_logs')
        .select('timestamp')
        .order('timestamp', { ascending: true });

      if (error) throw error;

      // Group access logs by date
      const trends = (data || []).reduce((acc, log) => {
        const date = new Date(log.timestamp).toLocaleDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      setAccessTrends(
        Object.entries(trends).map(([date, count]) => ({ date, count }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch access trends');
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
    <div className="p-6">
      {error && (
        <div className="bg-red-50 p-4 rounded-md mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Users
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats.totalUsers}
                    </div>
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
                    Total Assets
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats.totalAssets}
                    </div>
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
                    Card Redemption Rate
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats.redemptionRate.toFixed(1)}%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Active Users by Role</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <h4 className="text-sm font-medium text-gray-500">Creators</h4>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                {stats.activeCreators}
              </p>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <h4 className="text-sm font-medium text-gray-500">Retailers</h4>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                {stats.activeRetailers}
              </p>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <h4 className="text-sm font-medium text-gray-500">Consumers</h4>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                {stats.activeConsumers}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Asset Access Trends</h3>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="h-64">
            {/* Here you would typically integrate a charting library like Chart.js or Recharts */}
            <div className="flex h-full items-end space-x-2">
              {accessTrends.map((trend) => (
                <div
                  key={trend.date}
                  className="flex-1 bg-indigo-100 hover:bg-indigo-200 transition-colors rounded-t"
                  style={{ height: `${(trend.count / Math.max(...accessTrends.map(t => t.count))) * 100}%` }}
                >
                  <div className="transform -rotate-45 text-xs text-gray-600 mt-2 ml-2">
                    {trend.count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}