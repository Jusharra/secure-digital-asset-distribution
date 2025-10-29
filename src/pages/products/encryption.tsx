import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Key, Shield, Lock, FileCheck, Code } from 'lucide-react';

export function EncryptionPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold sm:text-5xl md:text-6xl">
              Encryption Built for Digital Asset Control
            </h1>
            <p className="mt-6 text-xl max-w-3xl mx-auto">
              Every asset on our platform is protected by military-grade encryption — with public/private key pairing for access control, tracking, and verification.
            </p>
            <div className="mt-10">
              <button
                onClick={() => navigate('/dashboard/creator')}
                className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50"
              >
                Create a Secure Asset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How Our Encryption Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Key className="h-12 w-12 text-indigo-600 mb-4" />
              <h3 className="text-xl font-semibold mb-4">🔑 Key Pair Assignment</h3>
              <p className="text-gray-600">
                Every asset is assigned a unique public/private key pair upon submission. Public keys are shared with consumers, while private keys stay locked in our secure system.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Lock className="h-12 w-12 text-indigo-600 mb-4" />
              <h3 className="text-xl font-semibold mb-4">📛 Display ID Binding</h3>
              <p className="text-gray-600">
                Each public key is tied to a Display ID that links to a specific asset. This prevents key reuse or unauthorized duplication.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <FileCheck className="h-12 w-12 text-indigo-600 mb-4" />
              <h3 className="text-xl font-semibold mb-4">🔐 Validation at Redemption</h3>
              <p className="text-gray-600">
                When a consumer redeems a command card, the public key and Display ID are verified against the stored private key before access is granted.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Why This Matters Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why This Matters</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Shield className="h-8 w-8 text-indigo-600 mb-4" />
              <h3 className="text-lg font-medium mb-2">Prevents Unauthorized Access</h3>
              <p className="text-gray-600">
                Military-grade encryption ensures only paid customers can access your content.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Lock className="h-8 w-8 text-indigo-600 mb-4" />
              <h3 className="text-lg font-medium mb-2">Secure Transfer Logic</h3>
              <p className="text-gray-600">
                Built-in support for secure resale and gift transfers between users.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <FileCheck className="h-8 w-8 text-indigo-600 mb-4" />
              <h3 className="text-lg font-medium mb-2">Global Standards</h3>
              <p className="text-gray-600">
                Complies with international content protection and data security standards.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Developer Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <div className="flex items-start">
              <Code className="h-8 w-8 text-indigo-600 flex-shrink-0" />
              <div className="ml-4">
                <h3 className="text-lg font-bold mb-2">Developer-Grade Transparency</h3>
                <p className="text-gray-600 mb-4">
                  Our encryption workflow is fully compatible with Supabase and can be extended via RPC functions or integrated APIs. Keys are never exposed to the client and can't be reversed.
                </p>
                <button
                  onClick={() => navigate('/docs/encryption')}
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  View the encryption docs →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold mb-8">Ready to Secure Your First Asset?</h2>
          <button
            onClick={() => navigate('/dashboard/creator')}
            className="px-8 py-3 bg-white text-indigo-700 text-base font-medium rounded-md hover:bg-gray-100"
          >
            Start Encrypting
          </button>
        </div>
      </div>
    </div>
  );
}