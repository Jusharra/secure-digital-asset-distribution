import React, { useState } from 'react';
import { Wand2, Image, Download, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AIDesignAssistantProps {
  onImageGenerated?: (url: string) => void;
}

export function AIDesignAssistant({ onImageGenerated }: AIDesignAssistantProps) {
  const [prompt, setPrompt] = useState('');
  const [format, setFormat] = useState<'card' | 'cover'>('cover');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a description');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Call the edge function to generate the image
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-image`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          format,
          style: format === 'card' ? 'digital-card' : 'cover-image'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const { imageUrl } = await response.json();
      setGeneratedImage(imageUrl);
      
      if (onImageGenerated) {
        onImageGenerated(imageUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate image');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!generatedImage) return;

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Save to Supabase Storage
      const fileName = `${format}-${Date.now()}.png`;
      const { error: uploadError } = await supabase.storage
        .from('generated-images')
        .upload(fileName, generatedImage);

      if (uploadError) throw uploadError;

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center mb-6">
        <Wand2 className="h-6 w-6 text-indigo-600 mr-2" />
        <h3 className="text-lg font-medium text-gray-900">AI Design Assistant</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Design Type
          </label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as 'card' | 'cover')}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="cover">Asset Cover Image</option>
            <option value="card">Prepaid Card Design</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Describe your design
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            placeholder="e.g., futuristic purple neon with a hologram vibe"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
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

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="-ml-1 mr-2 h-5 w-5" />
                Generate
              </>
            )}
          </button>
        </div>

        {generatedImage && (
          <div className="mt-6">
            <div className="relative rounded-lg overflow-hidden">
              <img
                src={generatedImage}
                alt="Generated design"
                className="w-full h-auto"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={handleSave}
                    className="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Image className="h-4 w-4 mr-1" />
                    Save
                  </button>
                  <a
                    href={generatedImage}
                    download="generated-design.png"
                    className="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}