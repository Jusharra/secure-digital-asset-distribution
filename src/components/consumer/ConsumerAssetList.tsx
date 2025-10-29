import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { Download, Gift, Share2, Play, Lock, Info, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Asset {
  id: string;
  title: string;
  description: string;
  type: string;
  price: number;
  cover_image_url: string | null;
  display_id: string;
  created_at: string;
  creator: {
    email: string;
  };
  encryption_keys: {
    public_key: string;
    downloads_remaining: number;
  }[];
}

function AssetCard({ asset }: { asset: Asset }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleDownload = async () => {
    try {
      // Implement download logic
      toast.success('Download started');
    } catch (error) {
      toast.error('Failed to download asset');
    }
  };

  return (
    <motion.div
      className="relative w-full aspect-[2/1] cursor-pointer perspective-1000"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="w-full h-full relative preserve-3d transition-all duration-500"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
      >
        {/* Card Front */}
        <div className="absolute w-full h-full backface-hidden">
          <div className="w-full h-full bg-white rounded-xl shadow-lg overflow-hidden">
            {asset.cover_image_url ? (
              <img
                src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/cover_images/${asset.cover_image_url}`}
                alt={asset.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <h3 className="text-white text-xl font-bold">{asset.title}</h3>
              </div>
            )}
            <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 rounded-full text-xs font-semibold">
              {asset.type}
            </div>
          </div>
        </div>

        {/* Card Back */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180">
          <div className="w-full h-full bg-white rounded-xl shadow-lg p-4">
            <h3 className="font-bold text-gray-900 mb-1">{asset.title}</h3>
            <p className="text-sm text-gray-600 mb-2">{asset.description}</p>
            <div className="space-y-1 text-xs text-gray-500">
              <p>Purchased: {new Date(asset.created_at).toLocaleDateString()}</p>
              <p>Creator: {asset.creator.email}</p>
            </div>
            <div className="absolute bottom-4 left-4 right-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload();
                }}
                className="w-full bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
              >
                <Download className="h-4 w-4 inline mr-1" />
                Download
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ConsumerAssetList() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get all redeemed cards for this user
      const { data: redeemedCards, error: cardsError } = await supabase
        .from('prepaid_cards')
        .select(`
          asset_id,
          asset:asset_id (
            *,
            creator:creator_id(email),
            encryption_keys(public_key, downloads_remaining)
          )
        `)
        .eq('redeemed_by', user.id)
        .eq('redeemed', true);

      if (cardsError) throw cardsError;

      // Extract unique assets from redeemed cards
      const uniqueAssets = redeemedCards
        ?.map(card => card.asset)
        .filter((asset): asset is Asset => asset !== null);

      setAssets(uniqueAssets || []);
    } catch (error) {
      console.error('Error loading assets:', error);
      toast.error('Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {assets.map((asset) => (
        <AssetCard key={asset.id} asset={asset} />
      ))}

      {assets.length === 0 && (
        <div className="text-center py-12">
          <Lock className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No assets yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Redeem a Command Card to access your first asset
          </p>
        </div>
      )}
    </div>
  );
}