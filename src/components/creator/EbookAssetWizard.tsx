import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { AIDesignAssistant } from './AIDesignAssistant';
import { AssetFileManager } from './AssetFileManager';
import { FileText, Image as ImageIcon, Upload, X, Loader2 } from 'lucide-react';

interface EbookFormData {
  title: string;
  description: string;
  price: string;
  category: string;
  file: File | null;
  coverImage: File | null;
  generatedImageUrl: string;
}

export function EbookAssetWizard() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<EbookFormData>({
    title: '',
    description: '',
    price: '',
    category: '',
    file: null,
    coverImage: null,
    generatedImageUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [createdAssetId, setCreatedAssetId] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent, type: 'file' | 'cover') => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      if (type === 'file') {
        setFormData(prev => ({ ...prev, file: e.dataTransfer.files[0] }));
      } else if (type === 'cover' && e.dataTransfer.files[0].type.startsWith('image/')) {
        setFormData(prev => ({ ...prev, coverImage: e.dataTransfer.files[0] }));
      }
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setStatus('Creating ebook asset...');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Upload cover image if exists
      let coverImagePath = null;
      if (formData.coverImage) {
        const coverPath = `${user.id}/covers/${Date.now()}-${formData.coverImage.name}`;
        const { error: coverError } = await supabase.storage
          .from('cover_images')
          .upload(coverPath, formData.coverImage);

        if (coverError) throw coverError;
        coverImagePath = coverPath;
      }

      // Create the asset
      const { data: asset, error: assetError } = await supabase
        .from('digital_assets')
        .insert({
          creator_id: user.id,
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          type: 'ebook',
          cover_image_url: coverImagePath || formData.generatedImageUrl,
          metadata: {
            version: '1.0',
            format: 'pdf',
            category: formData.category
          }
        })
        .select()
        .single();

      if (assetError) throw assetError;
      if (!asset) throw new Error('Failed to create asset');

      setCreatedAssetId(asset.id);
      setStatus('✅ Basic asset info created successfully! Now manage your files.');
      setStep(3); // Move to file management step
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Failed to create asset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-8 flex items-center">
        <FileText className="h-6 w-6 text-indigo-600 mr-2" />
        <h2 className="text-xl font-semibold">Create eBook Asset</h2>
      </div>

      {/* Step indicators */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-200 -z-10" />
          {[1, 2, 3].map((stepNumber) => (
            <div
              key={stepNumber}
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= stepNumber ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}
            >
              {stepNumber}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span>Basic Info</span>
          <span>Review</span>
          <span>File Management</span>
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-6">
          {/* Basic info form fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="eBook title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Describe your eBook"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Price</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Select a category</option>
                <option value="fiction">Fiction</option>
                <option value="non-fiction">Non-Fiction</option>
                <option value="educational">Educational</option>
                <option value="technical">Technical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Cover Image</label>
            <div 
              className={`mt-1 relative border-2 border-dashed rounded-lg p-6 ${
                dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={(e) => handleDrop(e, 'cover')}
            >
              {!formData.coverImage ? (
                <div className="text-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4 flex text-sm text-gray-600 justify-center">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                      <span>Upload a file</span>
                      <input
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={e => setFormData(prev => ({ ...prev, coverImage: e.target.files?.[0] || null }))}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={URL.createObjectURL(formData.coverImage)}
                    alt="Cover Preview"
                    className="max-w-full h-auto rounded-lg"
                  />
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, coverImage: null }))}
                    className="absolute top-2 right-2 p-1 bg-red-100 rounded-full text-red-600 hover:bg-red-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700">
              Or generate a cover with AI
            </h3>
            <AIDesignAssistant onImageGenerated={(url) => setFormData(prev => ({ ...prev, generatedImageUrl: url }))} />
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setStep(2)}
              disabled={!formData.title || !formData.description || !formData.price || !formData.category}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Review
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Review eBook Asset</h3>
            <dl className="grid grid-cols-1 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Title</dt>
                <dd className="mt-1 text-sm text-gray-900">{formData.title}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900">{formData.description}</dd>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Price</dt>
                  <dd className="mt-1 text-sm text-gray-900">${formData.price}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Category</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formData.category}</dd>
                </div>
              </div>
            </dl>

            {(formData.coverImage || formData.generatedImageUrl) && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Cover Image</h4>
                <img
                  src={formData.coverImage ? URL.createObjectURL(formData.coverImage) : formData.generatedImageUrl}
                  alt="Cover Preview"
                  className="w-48 rounded-lg border"
                />
              </div>
            )}
          </div>

          {status && (
            <div className={`rounded-md p-4 ${
              status.includes('✅')
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-800'
            }`}>
              {status}
            </div>
          )}

          <div className="flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />}
              Create Asset
            </button>
          </div>
        </div>
      )}

      {step === 3 && createdAssetId && (
        <div className="space-y-6">
          <div className="bg-green-50 p-4 rounded-md">
            <p className="text-sm text-green-800">
              Asset created successfully! Now upload your source files, master files, and channel-specific files.
            </p>
          </div>

          <AssetFileManager assetId={createdAssetId} />

          <div className="flex justify-end">
            <button
              onClick={() => {
                setCreatedAssetId(null);
                setStep(1);
                setFormData({
                  title: '',
                  description: '',
                  price: '',
                  category: '',
                  file: null,
                  coverImage: null,
                  generatedImageUrl: ''
                });
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Create Another Asset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}