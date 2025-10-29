import React, { useState } from 'react';
import { EbookAssetWizard } from './EbookAssetWizard';
import { AudioAssetWizard } from './AudioAssetWizard';
import { VideoAssetWizard } from './VideoAssetWizard';
import { SoftwareAssetWizard } from './SoftwareAssetWizard';
import { ServiceAssetWizard } from './ServiceAssetWizard';
import { FileText, Headphones, Video, Package, Image } from 'lucide-react';

interface AssetUploadWizardProps {
  onComplete: () => void;
}

export function AssetUploadWizard({ onComplete }: AssetUploadWizardProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const assetTypes = [
    { id: 'ebook', name: 'E-Book', icon: FileText, component: EbookAssetWizard },
    { id: 'audio', name: 'Audio', icon: Headphones, component: AudioAssetWizard },
    { id: 'video', name: 'Video', icon: Video, component: VideoAssetWizard },
    { id: 'software', name: 'Software', icon: Package, component: SoftwareAssetWizard },
    { id: 'service', name: 'Service', icon: Image, component: ServiceAssetWizard }
  ];

  const selectedAssetType = assetTypes.find(type => type.id === selectedType);

  return (
    <div className="space-y-8">
      {!selectedType ? (
        <div>
          <h2 className="text-xl font-semibold mb-6">Choose Asset Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {assetTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className="p-6 border rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors
                    flex flex-col items-center justify-center space-y-3
                    group focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <Icon className="w-8 h-8 text-indigo-500 group-hover:text-indigo-600" />
                  <span className="font-medium text-gray-900 group-hover:text-indigo-600">
                    {type.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Create {selectedAssetType?.name} Asset</h2>
            <button
              onClick={() => setSelectedType(null)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Choose Different Type
            </button>
          </div>
          {selectedAssetType && React.createElement(selectedAssetType.component, {
            onComplete: () => {
              setSelectedType(null);
              onComplete();
            }
          })}
        </div>
      )}
    </div>
  );
}