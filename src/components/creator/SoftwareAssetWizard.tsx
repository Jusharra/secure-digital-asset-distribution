import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { AIDesignAssistant } from './AIDesignAssistant';
import { AssetFileManager } from './AssetFileManager';
import { Box, Image as ImageIcon, Upload, X, Loader2, AlertCircle } from 'lucide-react';

interface SoftwareFormData {
  title: string;
  description: string;
  price: string;
  category: string;
  version: string;
  platform: string;
  coverImage: File | null;
  generatedImageUrl: string;
}

export function SoftwareAssetWizard() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<SoftwareFormData>({
    title: '',
    description: '',
    price: '',
    category: '',
    version: '',
    platform: '',
    coverImage: null,
    generatedImageUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [createdAssetId, setCreatedAssetId] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files?.[0]?.type.startsWith('image/')) {
      setFormData(prev => ({ ...prev, coverImage: e.dataTransfer.files[0] }));
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Upload cover image if exists
      let coverImagePath = null;
      if (formData.coverImage) {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(7);
        const fileExt = formData.coverImage.name.split('.').pop();
        const uniqueFileName = `${timestamp}-${randomString}.${fileExt}`;
        coverImagePath = `${user.id}/covers/${uniqueFileName}`;
        
        const { error: coverError } = await supabase.storage
          .from('cover_images')
          .upload(coverImagePath, formData.coverImage);

        if (coverError) throw coverError;
      }

      // Create the asset
      const { data: asset, error: insertError } = await supabase
        .from('digital_assets')
        .insert({
          creator_id: user.id,
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          type: 'software',
          cover_image_url: coverImagePath || formData.generatedImageUrl,
          metadata: {
            version: formData.version,
            platform: formData.platform,
            category: formData.category
          }
        })
        .select()
        .single();

      if (insertError) throw insertError;
      if (!asset) throw new Error('Failed to create asset');

      setCreatedAssetId(asset.id);
      setError(null);
      setStep(3); // Move to file management step
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create software');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-8 flex items-center">
        <Box className="h-6 w-6 text-indigo-600 mr-2" />
        <h2 className="text-xl font-semibold">Create Software Asset</h2>
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
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Software title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Describe your software"
              required
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
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              >
                <option value="">Select a category</option>
                <option value="tools">Tools</option>
                <option value="productivity">Productivity</option>
                <option value="devops">DevOps</option>
                <option value="utilities">Utilities</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Version</label>
              <input
                type="text"
                value={formData.version}
                onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="e.g., v1.0.2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Platform</label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData(prev => ({ ...prev, platform: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              >
                <option value="">Select platform</option>
                <option value="windows">Windows</option>
                <option value="macos">macOS</option>
                <option value="linux">Linux</option>
                <option value="cross-platform">Cross-platform</option>
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
              onDrop={handleDrop}
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
            <h3 className="text-lg font-semibold mb-4">Review Software Asset</h3>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Version</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formData.version}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Platform</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formData.platform}</dd>
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

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
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
              Create Software
            </button>
          </div>
        </div>
      )}

      {step === 3 && createdAssetId && (
        <div className="space-y-6">
          <div className="bg-green-50 p-4 rounded-md">
            <p className="text-sm text-green-800">
              Software created successfully! Now upload your source files, installers, and channel-specific files.
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
                  version: '',
                  platform: '',
                  coverImage: null,
                  generatedImageUrl: ''
                });
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Create Another Software
            </button>
          </div>
        </div>
      )}
    </div>
  );
}