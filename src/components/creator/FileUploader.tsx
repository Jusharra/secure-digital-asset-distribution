import React, { useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Upload, X, Loader2, AlertCircle } from 'lucide-react';

interface FileUploaderProps {
  assetId: string;
  fileType: 'source' | 'master' | 'channel';
  onUploadComplete?: (fileData: any) => void;
}

export function FileUploader({ assetId, fileType, onUploadComplete }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleUpload = async () => {
    if (!file) return;

    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Upload file to storage
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${fileType}/${timestamp}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(`${fileType}_files`)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create asset_files record
      const { data: fileData, error: dbError } = await supabase
        .from('asset_files')
        .insert({
          asset_id: assetId,
          file_type: fileType,
          file_path: filePath,
          file_name: file.name,
          file_size: file.size,
          file_format: fileExt,
          metadata: {
            contentType: file.type,
            lastModified: file.lastModified
          }
        })
        .select()
        .single();

      if (dbError) throw dbError;

      if (onUploadComplete) {
        onUploadComplete(fileData);
      }

      setFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div 
        className={`relative border-2 border-dashed rounded-lg p-6 ${
          dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {!file ? (
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4 flex text-sm text-gray-600 justify-center">
              <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                <span>Upload a file</span>
                <input
                  type="file"
                  className="sr-only"
                  onChange={e => setFile(e.target.files?.[0] || null)}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">
              {fileType === 'source' && 'Original source files (any format)'}
              {fileType === 'master' && 'Final master files ready for distribution'}
              {fileType === 'channel' && 'Channel-specific format files'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Upload className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-500">{file.name}</span>
              </div>
              <button
                onClick={() => setFile(null)}
                className="p-1 bg-red-100 rounded-full text-red-600 hover:bg-red-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-gray-500">
              Size: {Math.round(file.size / 1024 / 1024)}MB
            </p>
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

      {file && (
        <button
          onClick={handleUpload}
          disabled={loading}
          className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />}
          Upload File
        </button>
      )}
    </div>
  );
}