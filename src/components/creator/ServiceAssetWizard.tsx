import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { AIDesignAssistant } from './AIDesignAssistant';
import { AssetFileManager } from './AssetFileManager';
import { Upload, Image as ImageIcon, X, Loader2 } from 'lucide-react';

interface ServiceFormData {
  title: string;
  description: string;
  price: string;
  category: string;
  duration: string;
  location: string;
  startDate: string;
  endDate: string;
  coverImage: File | null;
  generatedImageUrl: string;
}

export default function ServiceAssetWizard() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ServiceFormData>({
    title: '',
    description: '',
    price: '',
    category: '',
    duration: '',
    location: '',
    startDate: '',
    endDate: '',
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
      // Validate required fields
      if (!formData.title || !formData.description || !formData.price || 
          !formData.category || !formData.duration || !formData.location || 
          !formData.startDate || !formData.endDate) {
        throw new Error('Please fill in all required fields');
      }

      // Validate date range
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      if (endDate < startDate) {
        throw new Error('End date must be after start date');
      }

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

      // Create the asset with required metadata
      const { data: asset, error: insertError } = await supabase
        .from('digital_assets')
        .insert({
          creator_id: user.id,
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          type: 'service',
          cover_image_url: coverImagePath || formData.generatedImageUrl,
          metadata: {
            category: formData.category,
            duration: formData.duration,
            location: formData.location,
            availability: {
              startDate: formData.startDate,
              endDate: formData.endDate
            }
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
      setError(err instanceof Error ? err.message : 'Failed to create service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-8 flex items-center">
        <Upload className="h-6 w-6 text-indigo-600 mr-2" />
        <h2 className="text-xl font-semibold">Create Service Asset</h2>
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
              placeholder="Service title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Describe your service"
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
                <option value="wellness">Wellness</option>
                <option value="education">Education</option>
                <option value="repair">Repair</option>
                <option value="transportation">Transportation</option>
                <option value="events">Events</option>
                <option value="virtual-services">Virtual Services</option>
                <option value="consulting">Consulting</option>
                <option value="fitness">Fitness</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Duration</label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="e.g., 1 hour"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Service location"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
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
            <h3 className="text-lg font-semibold mb-4">Review Service Asset</h3>
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
                  <dt className="text-sm font-medium text-gray-500">Duration</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formData.duration}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Location</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formData.location}</dd>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formData.startDate}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">End Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formData.endDate}</dd>
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
                <Loader2 className="h-5 w-5 text-red-400" />
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
              Create Service
            </button>
          </div>
        </div>
      )}

      {step === 3 && createdAssetId && (
        <div className="space-y-6">
          <div className="bg-green-50 p-4 rounded-md">
            <p className="text-sm text-green-800">
              Service created successfully! Now upload your service materials, contracts, and channel-specific files.
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
                  duration: '',
                  location: '',
                  startDate: '',
                  endDate: '',
                  coverImage: null,
                  generatedImageUrl: ''
                });
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Create Another Service
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export { ServiceAssetWizard }