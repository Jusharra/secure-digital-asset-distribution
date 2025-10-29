import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Share2, Copy, Gift } from 'lucide-react';

export function Referrals() {
  const [referrals, setReferrals] = useState([]);
  const [referralLink, setReferralLink] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadReferrals();
    updateReferralLink();
  }, []);

  async function updateReferralLink() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setReferralLink(`${window.location.origin}/signup?ref=${user.id}`);
    }
  }

  async function loadReferrals() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id);
      
      setReferrals(data || []);
    } catch (error) {
      console.error('Error loading referrals:', error);
    }
  }

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Referrals</h1>
        <p className="mt-2 text-sm text-gray-600">
          Share your referral link and earn rewards
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Your Referral Link
            </h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>Share this link to earn rewards when new users join.</p>
            </div>
            <div className="mt-5 flex items-center">
              <input
                type="text"
                readOnly
                value={referralLink}
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

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Referral History
            </h3>
            {referrals.length > 0 ? (
              <ul className="mt-4 space-y-4">
                {referrals.map((referral: any) => (
                  <li
                    key={referral.id}
                    className="bg-gray-50 p-4 rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Referred User: {referral.referred_user_id}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(referral.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-green-600 font-medium">+$5.00</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-12">
                <Share2 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No referrals yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Share your referral link to start earning rewards
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}