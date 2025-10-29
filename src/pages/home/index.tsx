import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Key, Share2, Package, Search, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Asset {
  id: string;
  title: string;
  description: string;
  type: string;
  price: number;
  cover_image_url: string | null;
}

export function HomePage() {
  const navigate = useNavigate();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      const { data, error } = await supabase
        .from('digital_assets')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6); // Limit to 6 featured items

      if (error) throw error;
      setAssets(data || []);
    } catch (err) {
      console.error('Error loading assets:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold sm:text-5xl md:text-6xl">
              Secure Digital Asset Distribution
            </h1>
            <p className="mt-6 text-xl max-w-3xl mx-auto">
              Create, protect, and distribute your digital assets with encryption-backed command cards.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <button
                onClick={() => navigate('/dashboard/creator')}
                className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-gray-50"
              >
                Start Creating
              </button>
              <button
                onClick={() => navigate('/marketplace')}
                className="px-8 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-indigo-50 hover:text-indigo-700"
              >
                Browse All Assets
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Shield className="h-12 w-12 text-indigo-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Military-Grade Security</h3>
              <p className="text-gray-600">
                Protect your digital assets with advanced encryption technology.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Key className="h-12 w-12 text-indigo-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Command Card System</h3>
              <p className="text-gray-600">
                Unique key pairs ensure secure access and prevent unauthorized sharing.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Share2 className="h-12 w-12 text-indigo-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Global Distribution</h3>
              <p className="text-gray-600">
                Connect with retailers worldwide to expand your reach.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Package className="h-12 w-12 text-indigo-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Multiple Asset Types</h3>
              <p className="text-gray-600">
                Support for eBooks, audio, video, software, and services.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Marketplace Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Assets</h2>
            <button
              onClick={() => navigate('/marketplace')}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View All →
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {assets.map((asset) => (
                <div key={asset.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  {asset.cover_image_url && (
                    <img
                      src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/cover_images/${asset.cover_image_url}`}
                      alt={asset.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{asset.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        asset.type === 'ebook' ? 'bg-blue-100 text-blue-800' :
                        asset.type === 'audio' ? 'bg-green-100 text-green-800' :
                        asset.type === 'video' ? 'bg-purple-100 text-purple-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {asset.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      {asset.description?.slice(0, 100)}
                      {asset.description?.length > 100 ? '...' : ''}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-indigo-600">
                        ${asset.price?.toFixed(2)}
                      </span>
                      <button
                        onClick={() => navigate(`/purchase/${asset.id}`)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-8">Ready to Get Started?</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate('/solutions/creators')}
              className="px-8 py-3 bg-indigo-600 text-white text-base font-medium rounded-md hover:bg-indigo-700"
            >
              For Creators
            </button>
            <button
              onClick={() => navigate('/solutions/retailers')}
              className="px-8 py-3 border border-indigo-600 text-indigo-600 text-base font-medium rounded-md hover:bg-indigo-50"
            >
              For Retailers
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}