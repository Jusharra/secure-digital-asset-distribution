import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface PurchaseButtonProps {
  assetId: string;
  price: number;
  onSuccess?: () => void;
  isGift?: boolean;
  recipientId?: string;
}

export function PurchaseButton({ 
  assetId, 
  price,
  onSuccess,
  isGift,
  recipientId 
}: PurchaseButtonProps) {
  const navigate = useNavigate();

  const handlePurchase = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth/login');
        return;
      }

      // Create order record
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          asset_id: assetId,
          amount: price,
          payment_status: 'pending',
          is_gift: isGift,
          user_id: recipientId || user.id
        });

      if (orderError) throw orderError;

      if (onSuccess) {
        onSuccess();
      }
      
      navigate('/dashboard/consumer/purchases');
    } catch (err) {
      console.error('Purchase error:', err);
    }
  };

  return (
    <button
      onClick={handlePurchase}
      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      Buy Access
    </button>
  );
}