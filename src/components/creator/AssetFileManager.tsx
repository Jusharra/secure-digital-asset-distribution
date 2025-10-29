import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { FileUploader } from './FileUploader';
import { Download, Trash2, AlertCircle, Loader2 } from 'lucide-react';

interface AssetFile {
  id: string;
  file_type: 'source' | 'master' | 'channel';
  file_name: string;
  file_size: number;
  file_format: string;
  file_path: string;
  created_at: string;
}

interface AssetFileManagerProps {
  assetId: string;
}

export function AssetFileManager({ assetId }: AssetFileManagerProps) {
  const [files, setFiles] = useState<AssetFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'source' | 'master' | 'channel'>('source');

  useEffect(() => {
    loadFiles();
  }, [assetId]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('asset_files')
        .select('*')
        .eq('asset_id', assetId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileId: string, filePath: string) => {
    try {
      const { error: storageError } = await supabase.storage
        .from(`${activeTab}_files`)
        .remove([filePath]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('asset_files')
        .delete()
        .eq('id', fileId);

      if (dbError) throw dbError;

      await loadFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete file');
    }
  };

  const downloadFile = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from(`${activeTab}_files`)
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download file');
    }
  };

  const filteredFiles = files.filter(file => file.file_type === activeTab);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {(['source', 'master', 'channel'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} Files
            </button>
          ))}
        </nav>
      </div>

      {/* File Uploader */}
      <FileUploader
        assetId={assetId}
        fileType={activeTab}
        onUploadComplete={loadFiles}
      />

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

      {/* File List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredFiles.map((file) => (
            <li key={file.id} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <span className="text-xs font-medium text-indigo-600 uppercase">
                        {file.file_format}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {file.file_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {Math.round(file.file_size / 1024 / 1024)}MB • Uploaded {new Date(file.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => downloadFile(file.file_path, file.file_name)}
                    className="p-2 text-gray-400 hover:text-gray-500"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(file.id, file.file_path)}
                    className="p-2 text-red-400 hover:text-red-500"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </li>
          ))}

          {filteredFiles.length === 0 && (
            <li className="px-4 py-8 sm:px-6 text-center text-gray-500">
              No {activeTab} files uploaded yet
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}