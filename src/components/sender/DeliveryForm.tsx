import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Package, AlertCircle } from 'lucide-react';

interface Asset {
  id: string;
  title: string;
  type: string;
}

export function DeliveryForm() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState('');
  const [recipientKey, setRecipientKey] = useState('');
  const [label, setLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const { data, error } = await supabase
        .from('digital_assets')
        .select('id, title, type')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssets(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch assets');
    }
  };

  const encryptLabel = async (label: string, publicKey: string) => {
    // In a real application, implement proper encryption here
    // For demo purposes, we'll just base64 encode the label
    return btoa(label);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (!selectedAsset || !recipientKey || !label) {
        throw new Error('Please fill in all fields');
      }

      const encryptedLabel = await encryptLabel(label, recipientKey);

      const { error: deliveryError } = await supabase
        .from('delivery_queue')
        .insert([
          {
            sender_id: (await supabase.auth.getUser()).data.user?.id,
            asset_id: selectedAsset,
            encrypted_label: encryptedLabel,
            recipient_pubkey: recipientKey,
            status: 'pending'
          }
        ]);

      if (deliveryError) throw deliveryError;

      setSuccess(true);
      setSelectedAsset('');
      setRecipientKey('');
      setLabel('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create delivery');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-indigo-100 p-3 rounded-full">
            <Package className="h-8 w-8 text-indigo-600" />
          </div>
        </div>

        <h3 className="text-lg font-medium text-gray-900 text-center mb-8">
          Create New Delivery
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Select Asset
            </label>
            <select
              value={selectedAsset}
              onChange={(e) => setSelectedAsset(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">Select an asset...</option>
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.title} ({asset.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Recipient Public Key
            </label>
            <input
              type="text"
              value={recipientKey}
              onChange={(e) => setRecipientKey(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter recipient's public key"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Delivery Label
            </label>
            <textarea
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              rows={3}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter delivery label or instructions"
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <Package className="h-5 w-5 text-green-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    Delivery created successfully
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Delivery'}
          </button>
        </form>
      </div>
    </div>
  );
}