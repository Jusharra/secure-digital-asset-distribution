import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, DollarSign, Store, BarChart, Package, Users, ShoppingBag, MapPin } from 'lucide-react';

export function RetailersPage() {
  const navigate = useNavigate();

  const benefits = [
    { icon: CreditCard, title: 'Sell physical/digital Command Cards' },
    { icon: DollarSign, title: 'Set your own margins or take a revenue share' },
    { icon: Store, title: 'Attract foot traffic with redeemable content' },
    { icon: BarChart, title: 'Activation controls from your dashboard' },
    { icon: Package, title: 'Instant profit tracking and payout' }
  ];

  const steps = [
    'Accept a bid from a creator',
    'Receive Command Cards (physical or code list)',
    'Activate cards in your portal',
    'Distribute or display',
    'Earn when redeemed'
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold sm:text-5xl md:text-6xl">
              Earn From Digital Sales Without Creating Content
            </h1>
            <p className="mt-6 text-xl max-w-3xl mx-auto">
              Become a reseller. Activate Command Cards. Share profits with creators and get paid on every redemption.
            </p>
            <div className="mt-10">
              <button
                onClick={() => navigate('/dashboard/retailer')}
                className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50"
              >
                Apply as Retailer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Why It Works Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold mb-12">Why Retailers Love It</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                  <Icon className="h-12 w-12 text-indigo-600 mb-4" />
                  <h3 className="text-xl font-medium mb-2">{benefit.title}</h3>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold mb-12">How It Works</h2>
          <div className="grid md:grid-cols-5 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-center w-8 h-8 bg-indigo-600 text-white rounded-full mb-4">
                  {index + 1}
                </div>
                <p className="text-gray-700">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonial Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <Users className="h-12 w-12 text-indigo-600 mx-auto mb-6" />
            <blockquote className="text-2xl font-medium text-gray-900 mb-4">
              "It's like selling Netflix gift cards, but from local creators — and we get a cut."
            </blockquote>
            <p className="text-gray-500">— Local Retail Partner</p>
          </div>
        </div>
      </div>

      {/* Benefits Grid */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <MapPin className="h-8 w-8 text-indigo-600 mb-4" />
              <h3 className="text-lg font-medium mb-2">Local Market Access</h3>
              <p className="text-gray-600">Connect digital content with physical retail presence.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <ShoppingBag className="h-8 w-8 text-indigo-600 mb-4" />
              <h3 className="text-lg font-medium mb-2">Zero Inventory Risk</h3>
              <p className="text-gray-600">Only activate cards when they're sold.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <BarChart className="h-8 w-8 text-indigo-600 mb-4" />
              <h3 className="text-lg font-medium mb-2">Real-Time Analytics</h3>
              <p className="text-gray-600">Track sales and revenue in real-time.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl font-bold mb-8">Want to Join as a Retailer?</h2>
          <button
            onClick={() => navigate('/dashboard/retailer')}
            className="px-8 py-3 bg-white text-indigo-700 text-base font-medium rounded-md hover:bg-gray-50"
          >
            Become a Reseller
          </button>
        </div>
      </div>
    </div>
  );
}