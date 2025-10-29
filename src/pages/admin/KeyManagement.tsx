import React, { useState } from 'react';
import { Key, Hash, DollarSign, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export function KeyManagement() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    quantity: 1,
    prefix: 'GEN',
    basePrice: '5.00'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [generatedIds, setGeneratedIds] = useState<string[]>([]);
  const [generatedKeys, setGeneratedKeys] = useState<KeyPair[]>([]);

  const handleGenerateIds = async () => {
    try {
      setLoading(true);
      setError(null);

      // Generate display IDs
      const ids = Array.from({ length: formData.quantity }).map(() => 
        `${formData.prefix}-${Math.floor(100000 + Math.random() * 900000)}`
      );

      // Insert into id_bank
      const { error: bankError } = await supabase
        .from('id_bank')
        .insert(ids.map(code => ({ code })));

      if (bankError) throw bankError;
      setGeneratedIds(ids);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate IDs');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateKeys = async () => {
    try {
      setLoading(true);
      setError(null);

      // Generate key pairs
      const keyPairs = Array.from({ length: formData.quantity }).map(() => ({
        publicKey: `PUB-${uuidv4()}`,
        privateKey: `PRIV-${uuidv4()}`
      }));

      // Store public keys
      const { error: keysError } = await supabase
        .from('encryption_keys')
        .insert(keyPairs.map(pair => ({
          public_key: pair.publicKey,
          price: parseFloat(formData.basePrice),
          claimed: false
        })));

      if (keysError) throw keysError;

      setGeneratedKeys(keyPairs);
      setStep(3);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate keys');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-8">Key Management</h1>

      {/* Progress Steps */}
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
          <span className={step >= 1 ? 'text-indigo-600' : 'text-gray-500'}>Generate IDs</span>
          <span className={step >= 2 ? 'text-indigo-600' : 'text-gray-500'}>Set Price</span>
          <span className={step >= 3 ? 'text-indigo-600' : 'text-gray-500'}>Generate Keys</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Quantity</label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">ID Prefix</label>
              <input
                type="text"
                value={formData.prefix}
                onChange={(e) => setFormData(prev => ({ ...prev, prefix: e.target.value.toUpperCase() }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="e.g., GEN"
              />
            </div>

            <button
              onClick={handleGenerateIds}
              disabled={loading}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              {loading ? (
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
              ) : (
                <Hash className="h-4 w-4 mr-2" />
              )}
              Generate IDs
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Base Price Per Key</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  value={formData.basePrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, basePrice: e.target.value }))}
                  className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Generated IDs</h4>
              <div className="space-y-1">
                {generatedIds.map(id => (
                  <div key={id} className="text-sm text-gray-600 font-mono">{id}</div>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerateKeys}
              disabled={loading}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              {loading ? (
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
              ) : (
                <Key className="h-4 w-4 mr-2" />
              )}
              Generate Keys
            </button>
          </div>
        )}

        {step === 3 && success && (
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-green-800 mb-2">Success!</h4>
              <p className="text-sm text-green-700">
                Generated {formData.quantity} key pairs at ${formData.basePrice} each
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Generated Key Pairs</h4>
              <div className="space-y-4">
                {generatedKeys.map((pair, index) => (
                  <div key={index} className="space-y-1">
                    <div className="text-sm text-gray-600 font-mono">Public: {pair.publicKey}</div>
                    <div className="text-sm text-gray-600 font-mono">Private: {pair.privateKey}</div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setStep(1);
                setFormData({
                  quantity: 1,
                  prefix: 'GEN',
                  basePrice: '5.00'
                });
                setGeneratedIds([]);
                setGeneratedKeys([]);
                setSuccess(false);
              }}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Generate More Keys
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}