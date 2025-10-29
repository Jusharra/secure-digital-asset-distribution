import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { FileText, Search, Filter } from 'lucide-react';

interface PrepaidCard {
  id: string;
  serial_code: string;
  display_id: string;
  public_key: string;
  redeemed: boolean;
  asset: {
    id: string;
    title: string;
    description: string;
    type: string;
    price: number;
    cover_image_url: string | null;
    creator: {
      email: string;
    };
  };
}

export function MarketplacePage() {
  const [cards, setCards] = useState<PrepaidCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCards();
  }, []);

  async function fetchCards() {
    try {
      const { data, error } = await supabase
        .from('prepaid_cards')
        .select(`
          *,
          asset:asset_id (
            *,
            creator:creator_id (
              email
            )
          )
        `)
        .eq('redeemed', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCards(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cards');
    } finally {
      setLoading(false);
    }
  }

  const filteredCards = cards.filter(card => {
    const matchesSearch = 
      card.asset.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.asset.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || card.asset.type === typeFilter;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Marketplace</h1>
        <p className="mt-2 text-sm text-gray-600">
          Discover and purchase digital assets
        </p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-gray-300 rounded-md py-2 pl-3 pr-10 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Types</option>
              <option value="ebook">E-Books</option>
              <option value="audio">Audio</option>
              <option value="video">Video</option>
              <option value="software">Software</option>
              <option value="service">Services</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCards.map((card) => (
          <div key={card.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            {card.asset.cover_image_url ? (
              <img
                src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/cover_images/${card.asset.cover_image_url}`}
                alt={card.asset.title}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                <FileText className="h-12 w-12 text-gray-400" />
              </div>
            )}
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-gray-900">{card.asset.title}</h2>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  card.asset.type === 'ebook' ? 'bg-blue-100 text-blue-800' :
                  card.asset.type === 'audio' ? 'bg-green-100 text-green-800' :
                  card.asset.type === 'video' ? 'bg-purple-100 text-purple-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {card.asset.type}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                {card.asset.description?.slice(0, 100)}
                {card.asset.description?.length > 100 ? '...' : ''}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-indigo-600">
                  ${card.asset.price?.toFixed(2)}
                </span>
                <button
                  onClick={() => navigate(`/purchase/${card.id}`)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCards.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No cards available</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || typeFilter !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Check back later for new assets'}
          </p>
        </div>
      )}
    </div>
  );
}