import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Share2, AlertCircle } from 'lucide-react';
import CreateDistributionBid from '../../components/creator/CreateDistributionBid';

interface Bid {
  id: string;
  asset_id: string;
  quantity: number;
  region: string;
  bid_type: 'profit_share' | 'flat_fee';
  profit_percent: number | null;
  flat_fee: number | null;
  status: 'pending' | 'open' | 'accepted' | 'fulfilled';
  created_at: string;
  asset: {
    title: string;
    type: string;
  };
}

export function Distribution() {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateBid, setShowCreateBid] = useState(false);

  useEffect(() => {
    loadBids();
  }, []);

  const loadBids = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('distribution_bids')
        .select(`
          id,
          asset_id,
          quantity,
          region,
          bid_type,
          profit_percent,
          flat_fee,
          status,
          created_at,
          asset:asset_id (
            title,
            type
          )
        `)
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBids(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bids');
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Distribution</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your distribution bids and retailer assignments
          </p>
        </div>
        <button
          onClick={() => setShowCreateBid(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Share2 className="h-5 w-5 mr-2" />
          Create Distribution Bid
        </button>
      </div>

      {error && (
        <div className="mb-8 bg-red-50 p-4 rounded-md">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {bids.map((bid) => (
            <li key={bid.id} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {bid.asset.title}
                  </h3>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <span className="mr-2">{bid.region}</span>
                    <span className="mx-2">•</span>
                    <span>{bid.quantity} units</span>
                    <span className="mx-2">•</span>
                    <span>
                      {bid.bid_type === 'profit_share' && bid.profit_percent 
                        ? `${bid.profit_percent}% profit share`
                        : `$${bid.flat_fee} flat fee`
                      }
                    </span>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  bid.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  bid.status === 'open' ? 'bg-green-100 text-green-800' :
                  bid.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {bid.status}
                </span>
              </div>
            </li>
          ))}

          {bids.length === 0 && (
            <li className="px-4 py-8 text-center text-gray-500">
              No distribution bids yet. Create one to start working with retailers.
            </li>
          )}
        </ul>
      </div>

      {showCreateBid && (
        <CreateDistributionBid onClose={() => {
          setShowCreateBid(false);
          loadBids();
        }} />
      )}
    </div>
  );
}