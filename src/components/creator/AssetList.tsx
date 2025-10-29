import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { Download, Gift, Share2, Play, Lock, Info, X, Check, Globe, Calendar, Tag, Key } from 'lucide-react';
import toast from 'react-hot-toast';
import QRCode from 'qrcode';

interface Asset {
  id: string;
  title: string;
  description: string;
  type: string;
  price: number;
  cover_image_url: string | null;
  display_id: string;
  published: boolean;
  category: string;
  duration: string;
  location: string;
  platform: string;
  version: string;
  created_at: string;
  creator_id: string;
  creator: {
    email: string;
  };
  encryption_keys: {
    public_key: string;
    downloads_remaining: number;
  }[];
}

interface AssetDetailsModalProps {
  asset: Asset;
  onClose: () => void;
  onUpdate: () => void;
  userRole: string | null;
  userId: string | null;
}

function AssetDetailsModal({ asset, onClose, onUpdate, userRole, userId }: AssetDetailsModalProps) {
  const [title, setTitle] = useState(asset.title);
  const [description, setDescription] = useState(asset.description);
  const [price, setPrice] = useState(asset.price.toString());
  const [category, setCategory] = useState(asset.category || '');
  const [duration, setDuration] = useState(asset.duration || '');
  const [location, setLocation] = useState(asset.location || '');
  const [platform, setPlatform] = useState(asset.platform || '');
  const [version, setVersion] = useState(asset.version || '');
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string>('');

  const canEdit = userRole === 'admin' || (userRole === 'creator' && asset.creator_id === userId);

  useEffect(() => {
    generateQRCode();
  }, []);

  const generateQRCode = async () => {
    try {
      const shareUrl = `${window.location.origin}/assets/${asset.display_id}`;
      const qrDataUrl = await QRCode.toDataURL(shareUrl);
      setQrCode(qrDataUrl);
    } catch (err) {
      console.error('Failed to generate QR code:', err);
    }
  };

  const handleUpdate = async () => {
    if (!canEdit) {
      toast.error('You do not have permission to update this asset');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('digital_assets')
        .update({
          title,
          description,
          price: parseFloat(price),
          category,
          duration,
          location,
          platform,
          version,
          updated_at: new Date().toISOString()
        })
        .eq('id', asset.id);

      if (error) throw error;
      toast.success('Asset updated successfully');
      onUpdate();
    } catch (err) {
      toast.error('Failed to update asset');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!canEdit) {
      toast.error('You do not have permission to publish this asset');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('digital_assets')
        .update({
          published: !asset.published,
          updated_at: new Date().toISOString()
        })
        .eq('id', asset.id);

      if (error) throw error;
      toast.success(asset.published ? 'Asset unpublished' : 'Asset published');
      onUpdate();
    } catch (err) {
      toast.error('Failed to update publication status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-3xl w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Asset Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={!canEdit}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={!canEdit}
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  disabled={!canEdit}
                  step="0.01"
                  min="0"
                  className="w-full pl-7 border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={!canEdit}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                disabled={!canEdit}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={!canEdit}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
              <input
                type="text"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                disabled={!canEdit}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                disabled={!canEdit}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
              />
            </div>
          </div>
        </div>

        {/* Asset Information */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Asset Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <Tag className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-600">ID: {asset.display_id}</span>
              </div>
              <div className="flex items-center text-sm">
                <Key className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-600">Keys: {asset.encryption_keys?.length || 0}</span>
              </div>
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-600">Created: {new Date(asset.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center text-sm">
                <Globe className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-600">Status: {asset.published ? 'Published' : 'Draft'}</span>
              </div>
            </div>
            <div className="flex justify-center items-center">
              {qrCode && (
                <img 
                  src={qrCode} 
                  alt="Asset QR Code"
                  className="w-32 h-32"
                />
              )}
            </div>
          </div>
        </div>

        {canEdit && (
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={handlePublish}
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {asset.published ? 'Unpublish' : 'Publish'}
            </button>
            <button
              onClick={handleUpdate}
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Update
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function AssetCard({ asset, userRole, userId }: { asset: Asset; userRole: string | null; userId: string | null }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/assets/${asset.display_id}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy share link');
    }
  };

  const handleDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDetails(true);
  };

  return (
    <>
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
              <div className="absolute bottom-2 right-2 px-2 py-1 bg-white/90 rounded-full text-xs">
                ${asset.price.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Card Back */}
          <div className="absolute w-full h-full backface-hidden rotate-y-180">
            <div className="w-full h-full bg-white rounded-xl shadow-lg p-4">
              <h3 className="font-bold text-gray-900 mb-1">{asset.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{asset.description}</p>
              <div className="space-y-1 text-xs text-gray-500">
                <p>ID: {asset.display_id}</p>
                <p className="font-mono">Key: {asset.encryption_keys?.[0]?.public_key}</p>
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare();
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200"
                >
                  <Share2 className="h-4 w-4 inline mr-1" />
                  Share
                </button>
                <button
                  onClick={handleDetails}
                  className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
                >
                  <Info className="h-4 w-4 inline mr-1" />
                  Details
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {showDetails && (
        <AssetDetailsModal
          asset={asset}
          onClose={() => setShowDetails(false)}
          onUpdate={() => {
            setShowDetails(false);
            window.location.reload();
          }}
          userRole={userRole}
          userId={userId}
        />
      )}
    </>
  );
}

export default function AssetList() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadUserInfo();
    loadAssets();
  }, []);

  const loadUserInfo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);

      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      setUserRole(userData?.role || null);
    } catch (err) {
      console.error('Error loading user info:', err);
    }
  };

  const loadAssets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('digital_assets')
        .select(`
          *,
          creator:creator_id(email),
          encryption_keys(public_key, downloads_remaining)
        `)
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssets(data || []);
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
        <AssetCard 
          key={asset.id} 
          asset={asset} 
          userRole={userRole}
          userId={userId}
        />
      ))}

      {assets.length === 0 && (
        <div className="text-center py-12">
          <Lock className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No assets yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Create your first digital asset to get started
          </p>
        </div>
      )}
    </div>
  );
}