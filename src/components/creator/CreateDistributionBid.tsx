import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Share2, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Asset {
  id: string;
  title: string;
  type: string;
  price: number;
}

interface BidFormData {
  assetId: string;
  quantity: number;
  region: string;
  bidType: 'profit_share' | 'flat_fee';
  profitPercent: number;
  flatFee: number;
}

export default function CreateDistributionBid({ onClose }: { onClose: () => void }) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<BidFormData>({
    assetId: '',
    quantity: 100,
    region: '',
    bidType: 'profit_share',
    profitPercent: 20,
    flatFee: 0
  });

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('digital_assets')
        .select('id, title, type, price')
        .eq('creator_id', user.id)
        .eq('published', true);

      if (error) throw error;
      setAssets(data || []);
    } catch (err) {
      toast.error('Failed to load assets');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('distribution_bids')
        .insert({
          creator_id: user.id,
          asset_id: formData.assetId,
          quantity: formData.quantity,
          region: formData.region,
          bid_type: formData.bidType,
          profit_percent: formData.bidType === 'profit_share' ? formData.profitPercent : null,
          flat_fee: formData.bidType === 'flat_fee' ? formData.flatFee : null,
          status: 'pending'
        });

      if (error) throw error;
      toast.success('Distribution bid created successfully');
      onClose();
    } catch (err) {
      toast.error('Failed to create bid');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Create Distribution Bid</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Asset
            </label>
            <select
              value={formData.assetId}
              onChange={(e) => setFormData(prev => ({ ...prev, assetId: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            >
              <option value="">Choose an asset...</option>
              {assets.map(asset => (
                <option key={asset.id} value={asset.id}>
                  {asset.title} ({asset.type}) - ${asset.price}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity
            </label>
            <input
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Region
            </label>
            <input
              type="text"
              value={formData.region}
              onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
              placeholder="e.g., North America, Europe, Global"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bid Type
            </label>
            <select
              value={formData.bidType}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                bidType: e.target.value as 'profit_share' | 'flat_fee'
              }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="profit_share">Profit Share</option>
              <option value="flat_fee">Flat Fee</option>
            </select>
          </div>

          {formData.bidType === 'profit_share' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profit Share Percentage
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.profitPercent}
                onChange={(e) => setFormData(prev => ({ ...prev, profitPercent: parseInt(e.target.value) }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Flat Fee Amount
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.flatFee}
                  onChange={(e) => setFormData(prev => ({ ...prev, flatFee: parseFloat(e.target.value) }))}
                  className="block w-full rounded-md border-gray-300 pl-7 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />}
              Create Bid
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}