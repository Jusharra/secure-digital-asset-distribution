import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Lock, DollarSign, BarChart, Share2, ShoppingBag, Shield, Users, ChevronRight } from 'lucide-react';

export function CreatorsPage() {
  const navigate = useNavigate();

  const benefits = [
    { icon: Upload, title: 'Publish and sell any digital format' },
    { icon: Shield, title: 'Encryption-backed access and tracking' },
    { icon: ShoppingBag, title: 'Connect with retailers for real-world sales' },
    { icon: BarChart, title: 'Analytics for redemptions and revenue' },
    { icon: Share2, title: 'Full control over pricing, usage, and gifting' }
  ];

  const steps = [
    'Upload your content + metadata',
    'Buy encryption keys → system issues public/private pair',
    'Set price and publish to marketplace',
    'Create distribution bid for retailers',
    'Track redemptions + collect earnings'
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold sm:text-5xl md:text-6xl">
              Launch, Protect, and Profit from Your Digital Work
            </h1>
            <p className="mt-6 text-xl max-w-3xl mx-auto">
              You create. We help you turn it into secure, trackable income — online and offline.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <button
                onClick={() => navigate('/dashboard/creator')}
                className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-gray-50"
              >
                Upload Your First Asset
              </button>
              <button
                onClick={() => navigate('/dashboard/creator/profit-tools')}
                className="px-8 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-indigo-50 hover:text-indigo-700"
              >
                Explore Profit Tools
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Overview */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Creators Love It</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                  <Icon className="h-12 w-12 text-indigo-600 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* How It Works Steps */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid gap-8 md:grid-cols-5">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white p-6 rounded-lg shadow-sm h-full">
                  <div className="flex items-center justify-center w-8 h-8 bg-indigo-600 text-white rounded-full mb-4">
                    {index + 1}
                  </div>
                  <p className="text-gray-600">{step}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                    <ChevronRight className="h-6 w-6 text-indigo-600" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <Users className="h-12 w-12 text-indigo-600 mx-auto mb-6" />
            <blockquote className="text-2xl font-medium text-gray-900 mb-4">
              "I made more in 60 days selling command cards than in 6 months of content drops."
            </blockquote>
            <p className="text-gray-500">— Independent Creator</p>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold mb-8">Start Selling With Command Cards</h2>
          <button
            onClick={() => navigate('/dashboard/creator')}
            className="px-8 py-3 bg-white text-indigo-700 text-base font-medium rounded-md hover:bg-gray-50"
          >
            Become a Creator
          </button>
        </div>
      </div>
    </div>
  );
}