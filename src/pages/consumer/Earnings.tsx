import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Wallet, Loader2 } from 'lucide-react';

export function Earnings() {
  const [earnings, setEarnings] = useState(0);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawalStatus, setWithdrawalStatus] = useState('');
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);

  useEffect(() => {
    loadEarnings();
    loadWithdrawalHistory();
  }, []);

  async function loadEarnings() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { count } = await supabase
        .from('referrals')
        .select('*', { count: 'exact', head: true })
        .eq('referrer_id', user.id);
      
      setEarnings(count * 5); // $5 per referral
    } catch (error) {
      console.error('Error loading earnings:', error);
    }
  }

  async function loadWithdrawalHistory() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setWithdrawalHistory(data || []);
    } catch (error) {
      console.error('Error loading withdrawal history:', error);
    }
  }

  const requestWithdrawal = async () => {
    if (earnings <= 0) {
      setWithdrawalStatus('No earnings available to withdraw');
      return;
    }

    try {
      setWithdrawing(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('withdrawal_requests').insert({
        user_id: user.id,
        amount_requested: earnings,
        status: 'pending'
      });

      if (error) throw error;
      setWithdrawalStatus('Withdrawal request submitted successfully');
      await loadWithdrawalHistory();
    } catch (err) {
      setWithdrawalStatus(err instanceof Error ? err.message : 'Failed to submit withdrawal request');
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Earnings</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage your earnings and withdrawals
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Wallet className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Available Balance
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      ${earnings.toFixed(2)}
                    </dd>
                  </dl>
                </div>
              </div>
              <button
                onClick={requestWithdrawal}
                disabled={withdrawing || earnings <= 0}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {withdrawing && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />}
                Withdraw Earnings
              </button>
            </div>
            {withdrawalStatus && (
              <p className={`mt-2 text-sm ${
                withdrawalStatus.includes('success') 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {withdrawalStatus}
              </p>
            )}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Withdrawal History
            </h3>
            {withdrawalHistory.length > 0 ? (
              <div className="mt-4 space-y-4">
                {withdrawalHistory.map((withdrawal: any) => (
                  <div
                    key={withdrawal.id}
                    className="bg-gray-50 p-4 rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        ${withdrawal.amount_requested.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(withdrawal.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      withdrawal.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : withdrawal.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {withdrawal.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Wallet className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No withdrawal history</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Start earning by referring users to make withdrawals
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}