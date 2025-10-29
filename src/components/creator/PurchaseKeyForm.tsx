import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Key, Hash, DollarSign, Users } from 'lucide-react';

interface PurchaseKeyFormProps {
  onSuccess?: () => void;
}

interface PricingTier {
  quantity: number;
  pricePerKey: number;
  savings: number;
  mostPopular?: boolean;
}

const pricingTiers: PricingTier[] = [
  { quantity: 10, pricePerKey: 4.50, savings: 10 },
  { quantity: 25, pricePerKey: 4.00, savings: 20, mostPopular: true },
  { quantity: 50, pricePerKey: 3.50, savings: 30 },
  { quantity: 100, pricePerKey: 3.00, savings: 40 },
];

export function PurchaseKeyForm({ onSuccess }: PurchaseKeyFormProps) {
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);
  const [customQuantity, setCustomQuantity] = useState('');
  const [error, setError] = useState<string | null>(null);

  const calculatePrice = (quantity: number): number => {
    const tier = pricingTiers
      .slice()
      .reverse()
      .find(t => quantity >= t.quantity);
    return (tier?.pricePerKey || 5.00) * quantity;
  };

  const handlePurchase = async () => {
    try {
      setError(null);
      const quantity = selectedTier ? selectedTier.quantity : parseInt(customQuantity);
      const price = calculatePrice(quantity);

      // Create order record
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          amount: price,
          payment_status: 'pending',
          metadata: {
            type: 'key_purchase',
            quantity: quantity.toString(),
            price_per_key: (price / quantity).toString()
          }
        });

      if (orderError) throw orderError;

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process purchase');
    }
  };

  return (
    <div className="space-y-8">
      {/* Key Insights */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Key className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Keys
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {selectedTier?.quantity || customQuantity || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Tiers */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Select Key Bundle
          </h3>
          
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {pricingTiers.map((tier) => (
              <div
                key={tier.quantity}
                onClick={() => {
                  setSelectedTier(tier);
                  setCustomQuantity('');
                }}
                className={`relative cursor-pointer rounded-lg p-6 ${
                  selectedTier === tier
                    ? 'border-2 border-indigo-500 bg-indigo-50'
                    : 'border border-gray-200 hover:border-indigo-300'
                }`}
              >
                {tier.mostPopular && (
                  <div className="absolute top-0 right-0 -translate-y-1/2 px-3 py-1 bg-indigo-500 text-white text-xs font-medium rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="text-center">
                  <h4 className="text-xl font-semibold mb-2">{tier.quantity} Keys</h4>
                  <p className="text-gray-500">${tier.pricePerKey.toFixed(2)}/key</p>
                  <p className="text-indigo-600 font-medium mt-2">Save {tier.savings}%</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700">
              Or enter custom quantity
            </label>
            <div className="mt-1">
              <input
                type="number"
                min="1"
                value={customQuantity}
                onChange={(e) => {
                  setCustomQuantity(e.target.value);
                  setSelectedTier(null);
                }}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter quantity"
              />
            </div>
          </div>

          {(selectedTier || customQuantity) && (
            <div className="mt-6">
              <button
                onClick={handlePurchase}
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Purchase Keys
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 bg-red-50 text-red-700 p-4 rounded-lg">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}