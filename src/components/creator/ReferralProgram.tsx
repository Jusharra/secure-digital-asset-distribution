import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Gift, Copy, Users, TrendingUp } from 'lucide-react';

interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  earnings: number;
  referralCode: string;
}

export function ReferralProgram() {
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    activeReferrals: 0,
    earnings: 0,
    referralCode: ''
  });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadReferralStats();
  }, []);

  const loadReferralStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get referral count
      const { count } = await supabase
        .from('referrals')
        .select('*', { count: 'exact' })
        .eq('referrer_id', user.id);

      // Generate referral code from user ID
      const referralCode = user.id.split('-')[0].toUpperCase();

      setStats({
        totalReferrals: count || 0,
        activeReferrals: Math.floor((count || 0) * 0.8), // Simulated active referrals
        earnings: (count || 0) * 5, // $5 per referral
        referralCode
      });
    } catch (error) {
      console.error('Error loading referral stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}/signup?ref=${stats.referralCode}`;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Referrals
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {stats.totalReferrals}
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
                    Active Referrals
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {stats.activeReferrals}
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
                <Gift className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Referral Earnings
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    ${stats.earnings.toFixed(2)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Referral Link */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Your Referral Link
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Share this link to earn rewards when new creators join.</p>
          </div>
          <div className="mt-5 flex items-center">
            <input
              type="text"
              readOnly
              value={`${window.location.origin}/signup?ref=${stats.referralCode}`}
              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 text-gray-900 sm:text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={copyReferralLink}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Copy className="h-5 w-5 mr-2" />
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>

      {/* Program Details */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Program Details
          </h3>
          <div className="mt-2 prose prose-sm text-gray-500">
            <ul className="list-disc pl-5 space-y-2">
              <li>Earn $5 for each new creator who joins using your referral link</li>
              <li>Referral earnings are added to your regular payout</li>
              <li>Track your referrals and earnings in real-time</li>
              <li>No limit on the number of creators you can refer</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}