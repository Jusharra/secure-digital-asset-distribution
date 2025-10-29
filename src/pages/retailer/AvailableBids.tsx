import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Package, AlertCircle } from 'lucide-react';

interface DistributionBid {
  id: string;
  asset: {
    id: string;
    title: string;
    type: string;
    price: number;
  };
  quantity: number;
  region: string;
  bid_type: 'profit_share' | 'flat_fee';
  profit_percent: number | null;
  status: 'open' | 'accepted' | 'fulfilled';
  created_at: string;
}

export function AvailableBids() {
  const [bids, setBids] = useState<DistributionBid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBids();
  }, []);

  const fetchBids = async () => {
    try {
      const { data, error } = await supabase
        .from('distribution_bids')
        .select(`
          id,
          quantity,
          region,
          bid_type,
          profit_percent,
          status,
          created_at,
          asset:digital_assets (
            id,
            title,
            type,
            price
          )
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBids(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bids');
    } finally {
      setLoading(false);
    }
  };

  const acceptBid = async (bidId: string) => {
    try {
      const { error } = await supabase
        .from('distribution_assignments')
        .insert({
          bid_id: bidId,
          retailer_id: (await supabase.auth.getUser()).data.user?.id,
          status: 'pending'
        });

      if (error) throw error;

      await supabase
        .from('distribution_bids')
        .update({ status: 'accepted' })
        .eq('id', bidId);

      await fetchBids();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept bid');
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
      <div className="bg-red-50 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading bids</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (bids.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No bids available</h3>
        <p className="mt-1 text-sm text-gray-500">
          Check back later for new distribution opportunities.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {bids.map((bid) => (
            <li key={bid.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-medium text-gray-900 truncate">
                      {bid.asset.title}
                    </h4>
                    <p className="mt-1 flex items-center text-sm text-gray-500">
                      <span className="truncate">{bid.asset.type}</span>
                    </p>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <button
                      onClick={() => acceptBid(bid.id)}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Accept Bid
                    </button>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Quantity</dt>
                    <dd className="mt-1 text-sm text-gray-900">{bid.quantity} units</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Region</dt>
                    <dd className="mt-1 text-sm text-gray-900">{bid.region}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Terms</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {bid.bid_type === 'profit_share' 
                        ? `${bid.profit_percent}% profit share`
                        : 'Flat fee'}
                    </dd>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}