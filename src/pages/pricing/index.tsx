import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Headphones, Video, Package, Image, CreditCard, DollarSign, Users } from 'lucide-react';

export function PricingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold sm:text-5xl md:text-6xl">
              Simple, Transparent Pricing
            </h1>
            <p className="mt-6 text-xl max-w-3xl mx-auto">
              Pay only for what you use — whether you're a creator, retailer, or collector. No subscriptions required.
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Tiers */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Creators */}
            <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-100">
              <div className="text-center">
                <FileText className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">For Creators</h2>
                <p className="text-gray-600 mb-6">Launch digital assets and earn from every redemption.</p>
                <div className="mb-8">
                  <ul className="text-sm text-gray-700 space-y-3">
                    <li className="flex items-center">
                      <DollarSign className="h-5 w-5 text-green-500 mr-2" />
                      $2 per encryption key
                    </li>
                    <li className="flex items-center">
                      <CreditCard className="h-5 w-5 text-green-500 mr-2" />
                      10% platform fee on each sale
                    </li>
                    <li className="flex items-center">
                      <FileText className="h-5 w-5 text-green-500 mr-2" />
                      Free asset publishing and editing
                    </li>
                    <li className="flex items-center">
                      <Users className="h-5 w-5 text-green-500 mr-2" />
                      Optional: retailer distribution bids
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => navigate('/dashboard/creator')}
                  className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Start Creating
                </button>
              </div>
            </div>

            {/* Retailers */}
            <div className="bg-white p-8 rounded-lg shadow-lg border-2 border-indigo-500 transform scale-105">
              <div className="absolute top-0 right-0 -translate-y-1/2 px-4 py-1 bg-indigo-500 text-white text-sm font-medium rounded-full">
                Most Popular
              </div>
              <div className="text-center">
                <Package className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">For Retailers</h2>
                <p className="text-gray-600 mb-6">Activate and distribute Command Cards with profit sharing.</p>
                <div className="mb-8">
                  <ul className="text-sm text-gray-700 space-y-3">
                    <li className="flex items-center">
                      <DollarSign className="h-5 w-5 text-green-500 mr-2" />
                      Free to join and accept bids
                    </li>
                    <li className="flex items-center">
                      <CreditCard className="h-5 w-5 text-green-500 mr-2" />
                      Earn up to 30% per redemption
                    </li>
                    <li className="flex items-center">
                      <Package className="h-5 w-5 text-green-500 mr-2" />
                      No upfront inventory costs
                    </li>
                    <li className="flex items-center">
                      <FileText className="h-5 w-5 text-green-500 mr-2" />
                      Real-time earnings dashboard
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => navigate('/dashboard/retailer')}
                  className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Join as Retailer
                </button>
              </div>
            </div>

            {/* Collectors */}
            <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-100">
              <div className="text-center">
                <Users className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">For Collectors</h2>
                <p className="text-gray-600 mb-6">Buy once, own forever. No subscriptions or fees.</p>
                <div className="mb-8">
                  <ul className="text-sm text-gray-700 space-y-3">
                    <li className="flex items-center">
                      <CreditCard className="h-5 w-5 text-green-500 mr-2" />
                      Pay once for each Command Card
                    </li>
                    <li className="flex items-center">
                      <FileText className="h-5 w-5 text-green-500 mr-2" />
                      Lifetime access to content
                    </li>
                    <li className="flex items-center">
                      <Users className="h-5 w-5 text-green-500 mr-2" />
                      Optional gifting & transfer tools
                    </li>
                    <li className="flex items-center">
                      <Package className="h-5 w-5 text-green-500 mr-2" />
                      Free personal dashboard
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => navigate('/marketplace')}
                  className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Browse Marketplace
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-2">Do creators pay upfront to sell?</h3>
              <p className="text-gray-600">
                No. You only purchase keys as needed and pay a small fee per redemption. Publishing assets is free.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-2">Can I try the platform before committing?</h3>
              <p className="text-gray-600">
                Yes. You can create a free account and browse available tools before launching any assets or sales.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-2">How are retailer profits calculated?</h3>
              <p className="text-gray-600">
                Creators set a bid type and percentage. Retailers earn a fixed or percentage-based profit on every card redeemed.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-2">Are collectors locked into monthly fees?</h3>
              <p className="text-gray-600">
                Never. Each Command Card is a one-time purchase with lifetime access to your content.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold mb-8">One Platform. One Price. No Surprises.</h2>
          <button
            onClick={() => navigate('/marketplace')}
            className="px-8 py-3 bg-white text-indigo-700 text-base font-medium rounded-md hover:bg-gray-50"
          >
            Get Started Now
          </button>
        </div>
      </div>
    </div>
  );
}