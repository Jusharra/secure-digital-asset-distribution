import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, Music, Video, Box, Wrench, Upload, Shield, Share2, BarChart } from 'lucide-react';

export function DigitalAssetsPage() {
  const navigate = useNavigate();

  const assetTypes = [
    { icon: Book, title: 'eBooks', tooltip: 'PDF, EPUB, Text' },
    { icon: Music, title: 'Audio', tooltip: 'Music, Podcasts' },
    { icon: Video, title: 'Video', tooltip: 'Courses, Streams' },
    { icon: Box, title: 'Software', tooltip: 'Installers, Tools' },
    { icon: Wrench, title: 'Services', tooltip: 'Bookable or redeemable offerings' }
  ];

  const benefits = [
    { title: 'Monetize Your Work Globally', icon: Share2 },
    { title: '100% Control of Pricing & Access', icon: Shield },
    { title: 'Command Cards Offer Physical Sales', icon: Box },
    { title: 'Analytics to Track Performance', icon: BarChart },
    { title: 'Profit Sharing with Retailers', icon: Share2 }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold sm:text-5xl md:text-6xl">
              Monetize and Protect Your Digital Assets
            </h1>
            <p className="mt-6 text-xl max-w-3xl mx-auto">
              From eBooks to music, services to software — upload once, distribute forever with security and control.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <button
                onClick={() => navigate('/dashboard/creator/upload')}
                className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-400"
              >
                Create Your First Asset
              </button>
              <button
                onClick={() => navigate('/marketplace')}
                className="px-8 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-indigo-600"
              >
                View Marketplace Examples
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Asset Types Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Supported Asset Types</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {assetTypes.map((type, index) => {
              const Icon = type.icon;
              return (
                <div
                  key={index}
                  className="relative group bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  title={type.tooltip}
                >
                  <div className="flex flex-col items-center">
                    <Icon className="h-12 w-12 text-indigo-600 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">{type.title}</h3>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded">
                    {type.tooltip}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Creator Flow Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <Upload className="h-12 w-12 text-indigo-600 mb-4" />
                <h3 className="text-xl font-semibold mb-4">Upload + Describe Your Asset</h3>
                <ul className="text-gray-600 space-y-2">
                  <li>Title, description, pricing</li>
                  <li>Attach cover image or use AI image generator</li>
                </ul>
              </div>
              <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                <div className="w-12 h-0.5 bg-indigo-600"></div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <Shield className="h-12 w-12 text-indigo-600 mb-4" />
                <h3 className="text-xl font-semibold mb-4">Secure It with Encryption</h3>
                <ul className="text-gray-600 space-y-2">
                  <li>System assigns unique display_id + public key</li>
                  <li>Keys ensure only verified consumers can redeem</li>
                </ul>
              </div>
              <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                <div className="w-12 h-0.5 bg-indigo-600"></div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <Share2 className="h-12 w-12 text-indigo-600 mb-4" />
                <h3 className="text-xl font-semibold mb-4">Distribute Your Way</h3>
                <ul className="text-gray-600 space-y-2">
                  <li>Sell on platform or generate access cards</li>
                  <li>Track redemptions, revenue, and share stats</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Benefits for Creators</h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                  <Icon className="h-8 w-8 text-indigo-600 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">{benefit.title}</h3>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold mb-8">Ready to Launch Your Collection?</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate('/auth/signup')}
              className="px-8 py-3 bg-white text-indigo-700 text-base font-medium rounded-md hover:bg-gray-100"
            >
              Get Started as a Creator
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="px-8 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-indigo-600"
            >
              Book a Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}