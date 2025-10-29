import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Download, Search, CreditCard } from 'lucide-react';

interface PrepaidCard {
  id: string;
  serial_code: string;
  redeemed: boolean;
  redeemed_at: string | null;
  redeemed_by: string | null;
  created_at: string;
  retailer_email: string;
  asset: {
    title: string;
    type: string;
  };
  consumer_email: string | null;
}

interface CardStats {
  total: number;
  redeemed: number;
  available: number;
  redemptionRate: number;
}

export function CardList() {
  const [cards, setCards] = useState<PrepaidCard[]>([]);
  const [stats, setStats] = useState<CardStats>({
    total: 0,
    redeemed: 0,
    available: 0,
    redemptionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'redeemed' | 'unredeemed'>('all');

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const { data, error } = await supabase
        .from('prepaid_cards')
        .select(`
          id,
          serial_code,
          redeemed,
          redeemed_at,
          redeemed_by,
          created_at,
          retailer_email:users!prepaid_cards_retailer_id_fkey(email),
          asset:asset_id(title, type),
          consumer_email:users!prepaid_cards_redeemed_by_fkey(email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const cardData = data?.map(card => ({
        ...card,
        retailer_email: card.retailer_email?.[0]?.email || '',
        consumer_email: card.consumer_email?.[0]?.email || null
      })) || [];

      setCards(cardData);

      // Calculate stats
      const total = cardData.length;
      const redeemed = cardData.filter(card => card.redeemed).length;
      setStats({
        total,
        redeemed,
        available: total - redeemed,
        redemptionRate: total > 0 ? (redeemed / total) * 100 : 0
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cards');
    } finally {
      setLoading(false);
    }
  };

  const exportCards = () => {
    const csvContent = cards
      .map(card => `${card.serial_code},${card.asset.title},${card.retailer_email},${card.redeemed ? 'Yes' : 'No'},${card.redeemed_at ? new Date(card.redeemed_at).toLocaleDateString() : ''},${card.consumer_email || ''}`)
      .join('\n');

    const blob = new Blob([`Code,Asset,Retailer,Redeemed,Redeemed At,Redeemed By\n${csvContent}`], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prepaid-cards.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const filteredCards = cards.filter(card => {
    const matchesSearch = 
      card.serial_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.asset.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.retailer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (card.consumer_email || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'redeemed' && card.redeemed) ||
      (statusFilter === 'unredeemed' && !card.redeemed);

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CreditCard className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Cards
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {stats.total}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CreditCard className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Redeemed Cards
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {stats.redeemed}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CreditCard className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Available Cards
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {stats.available}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CreditCard className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Redemption Rate
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {stats.redemptionRate.toFixed(1)}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-6">
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

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="border border-gray-300 rounded-md py-2 pl-3 pr-10 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Cards</option>
            <option value="redeemed">Redeemed</option>
            <option value="unredeemed">Unredeemed</option>
          </select>
        </div>

        <button
          onClick={exportCards}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <Download className="h-5 w-5 mr-2" />
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Serial Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Asset
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Retailer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Redeemed By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Redeemed At
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCards.map((card) => (
              <tr key={card.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {card.serial_code}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{card.asset.title}</div>
                  <div className="text-sm text-gray-500">{card.asset.type}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {card.retailer_email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    card.redeemed
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {card.redeemed ? 'Redeemed' : 'Available'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {card.consumer_email || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {card.redeemed_at
                    ? new Date(card.redeemed_at).toLocaleDateString()
                    : '-'}
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
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
}