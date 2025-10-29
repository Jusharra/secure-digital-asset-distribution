import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { AuthForm } from '../../components/AuthForm';
import { AlertCircle } from 'lucide-react';

interface Asset {
  id: string;
  title: string;
  description: string;
  type: string;
  price: number;
  cover_image_url: string | null;
}

export function PurchasePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadAsset();
    checkUser();
  }, [id]);

  async function loadAsset() {
    try {
      if (!id) return;
      
      const { data, error } = await supabase
        .from('digital_assets')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setAsset(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load asset');
    }
  }

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  }

  async function handlePurchase() {
    try {
      setError(null);

      if (!asset || !user) return;

      // Create order record
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          asset_id: asset.id,
          amount: asset.price,
          payment_status: 'pending',
          currency: 'usd'
        });

      if (orderError) throw orderError;

      // Redirect to purchases page
      navigate('/dashboard/consumer/purchases');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process purchase');
    }
  }

  if (!asset) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Asset not found</h2>
        <p className="mt-2 text-gray-600">The asset you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Asset Preview */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          {asset.cover_image_url && (
            <img
              src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/cover_images/${asset.cover_image_url}`}
              alt={asset.title}
              className="w-full h-64 object-cover"
            />
          )}
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{asset.title}</h1>
            <p className="text-gray-600 mb-4">{asset.description}</p>
            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                asset.type === 'ebook' ? 'bg-blue-100 text-blue-800' :
                asset.type === 'audio' ? 'bg-green-100 text-green-800' :
                asset.type === 'video' ? 'bg-purple-100 text-purple-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {asset.type}
              </span>
              <span className="text-2xl font-bold text-indigo-600">
                ${asset.price.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Authentication / Purchase Section */}
        {!user ? (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Create an account to continue
            </h2>
            <AuthForm />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <button
              onClick={handlePurchase}
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Buy Access
            </button>

            {error && (
              <div className="mt-4 rounded-md bg-red-50 p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}