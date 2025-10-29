import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { CreditCard, Search, AlertCircle, CheckCircle, X } from 'lucide-react';

interface Card {
  id: string;
  serial_code: string;
  display_id: string;
  public_key: string;
  redeemed: boolean;
  redeemed_at: string | null;
  asset: {
    title: string;
    type: string;
  };
}

export function ActivateCards() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('prepaid_cards')
        .select(`
          id,
          serial_code,
          display_id,
          public_key,
          redeemed,
          redeemed_at,
          asset:asset_id (
            title,
            type
          )
        `)
        .eq('retailer_id', user.id)
        .eq('redeemed', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCards(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cards');
    } finally {
      setLoading(false);
    }
  };

  const toggleCardSelection = (cardId: string) => {
    setSelectedCards(prev => 
      prev.includes(cardId)
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  };

  const selectAll = () => {
    setSelectedCards(cards.map(card => card.id));
  };

  const clearSelection = () => {
    setSelectedCards([]);
  };

  const activateSelected = async () => {
    if (selectedCards.length === 0) return;

    try {
      setActivating(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('prepaid_cards')
        .update({
          redeemed: true,
          redeemed_at: new Date().toISOString(),
          redeemed_by: user.id
        })
        .in('id', selectedCards);

      if (error) throw error;

      await loadCards();
      setSelectedCards([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to activate cards');
    } finally {
      setActivating(false);
    }
  };

  const filteredCards = cards.filter(card =>
    card.serial_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.display_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.asset.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h1 className="text-2xl font-semibold text-gray-900">Activate Cards</h1>
        <p className="mt-2 text-sm text-gray-600">
          Activate prepaid cards for distribution
        </p>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search cards..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              {selectedCards.length > 0 && (
                <>
                  <button
                    onClick={clearSelection}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear Selection
                  </button>
                  <button
                    onClick={activateSelected}
                    disabled={activating}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Activate Selected
                  </button>
                </>
              )}
              {selectedCards.length === 0 && (
                <button
                  onClick={selectAll}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Select All
                </button>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="p-6 bg-red-50">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <p className="ml-3 text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedCards.length === cards.length}
                    onChange={() => 
                      selectedCards.length === cards.length
                        ? clearSelection()
                        : selectAll()
                    }
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asset
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Serial Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Display ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Public Key
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCards.map((card) => (
                <tr key={card.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedCards.includes(card.id)}
                      onChange={() => toggleCardSelection(card.id)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {card.asset.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      {card.asset.type}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    {card.serial_code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    {card.display_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                    {card.public_key}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredCards.length === 0 && (
            <div className="text-center py-12">
              <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No cards found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm
                  ? 'Try adjusting your search criteria'
                  : 'All cards have been activated'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}