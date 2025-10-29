import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { CreditCard, Key, Hash, Download, Check, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RedeemedAsset {
  id: string;
  title: string;
  type: string;
  cover_image_url: string | null;
  master_file_url: string;
}

export function ConsumerDashboard() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    serial_code: '',
    display_id: '',
    public_key: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [redeemedAsset, setRedeemedAsset] = useState<RedeemedAsset | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value.toUpperCase()
    }));
  };

  async function downloadAsset(url: string, fileName: string) {
    try {
      const { data, error } = await supabase.storage
        .from('master_files')
        .download(url);

      if (error) throw error;

      const blob = new Blob([data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setMessage({
        type: 'error',
        text: 'Failed to download file'
      });
    }
  }

  async function redeemAsset() {
    try {
      setLoading(true);
      setMessage(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Please sign in to redeem assets');

      // Validate serial code and get asset details
      const { data: card, error: cardError } = await supabase
        .from('prepaid_cards')
        .select(`
          *, 
          asset:asset_id (
            id,
            title,
            type,
            cover_image_url,
            master_file_url
          )
        `)
        .eq('serial_code', formData.serial_code)
        .single();

      if (cardError || !card) {
        throw new Error('Invalid serial code');
      }

      if (card.redeemed) {
        throw new Error('This code has already been redeemed');
      }

      // Validate display ID
      const { data: displayId, error: displayError } = await supabase
        .from('id_bank')
        .select('*')
        .eq('code', formData.display_id)
        .single();

      if (displayError || !displayId) {
        throw new Error('Invalid display ID');
      }

      if (displayId.claimed) {
        throw new Error('This display ID has already been claimed');
      }

      // Validate public key
      const { data: key, error: keyError } = await supabase
        .from('encryption_keys')
        .select('*')
        .eq('public_key', formData.public_key)
        .single();

      if (keyError || !key) {
        throw new Error('Invalid public key');
      }

      if (key.claimed) {
        throw new Error('This public key has already been claimed');
      }

      // Update prepaid card
      const { error: updateCardError } = await supabase
        .from('prepaid_cards')
        .update({
          redeemed: true,
          redeemed_by: user.id,
          redeemed_at: new Date().toISOString()
        })
        .eq('id', card.id);

      if (updateCardError) throw updateCardError;

      // Update display ID
      const { error: updateIdError } = await supabase
        .from('id_bank')
        .update({ claimed: true })
        .eq('code', formData.display_id);

      if (updateIdError) throw updateIdError;

      // Update encryption key
      const { error: updateKeyError } = await supabase
        .from('encryption_keys')
        .update({
          claimed: true,
          assigned_to: user.id
        })
        .eq('public_key', formData.public_key);

      if (updateKeyError) throw updateKeyError;

      // Log access
      const { error: logError } = await supabase
        .from('asset_access_logs')
        .insert({
          user_id: user.id,
          asset_id: card.asset_id,
          method: 'card'
        });

      if (logError) throw logError;

      setRedeemedAsset(card.asset);
      setFormData({
        serial_code: '',
        display_id: '',
        public_key: ''
      });

    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to redeem asset'
      });
    } finally {
      setLoading(false);
    }
  }

  if (redeemedAsset) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Asset Redeemed Successfully!</h2>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900">{redeemedAsset.title}</h3>
            {redeemedAsset.cover_image_url && (
              <img
                src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/cover_images/${redeemedAsset.cover_image_url}`}
                alt={redeemedAsset.title}
                className="mt-4 mx-auto max-w-md rounded-lg shadow-md"
              />
            )}
          </div>

          <div className="space-y-4">
            <button
              onClick={() => downloadAsset(redeemedAsset.master_file_url, redeemedAsset.title)}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Download className="h-5 w-5 mr-2" />
              Download Asset
            </button>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
              <button
                onClick={() => navigate('/dashboard/consumer/assets')}
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                View My Assets
              </button>
              
              <button
                onClick={() => navigate('/dashboard/consumer/purchases')}
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Wallet className="h-4 w-4 mr-2" />
                View Receipt
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Consumer Dashboard</h1>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Redeem Asset</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Serial Code
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="serial_code"
                value={formData.serial_code}
                onChange={handleInputChange}
                placeholder="Enter serial code"
                className="pl-10 w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display ID
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="display_id"
                value={formData.display_id}
                onChange={handleInputChange}
                placeholder="Enter display ID"
                className="pl-10 w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Public Key
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="public_key"
                value={formData.public_key}
                onChange={handleInputChange}
                placeholder="Enter public key"
                className="pl-10 w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            onClick={redeemAsset}
            disabled={loading || !formData.serial_code || !formData.display_id || !formData.public_key}
            className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Redeeming...' : 'Redeem Asset'}
          </button>

          {message && (
            <div className={`p-4 rounded-md ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}