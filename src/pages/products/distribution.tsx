import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, HandshakeIcon, Key, Share2, Store, Users, BarChart, MapPin } from 'lucide-react';

export function DistributionPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-green-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold sm:text-5xl md:text-6xl">
              Command Card Distribution, Made Scalable
            </h1>
            <p className="mt-6 text-xl max-w-3xl mx-auto">
              Connect creators with retailers to deliver physical and digital Command Cards to local communities and global audiences.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <button
                onClick={() => navigate('/dashboard/admin')}
                className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-teal-700 bg-white hover:bg-gray-50"
              >
                Manage Distribution
              </button>
              <button
                onClick={() => navigate('/dashboard/retailer')}
                className="px-8 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-teal-500"
              >
                Become a Retailer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* How Distribution Works */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How Distribution Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Package className="h-12 w-12 text-teal-600 mb-4" />
              <h3 className="text-xl font-semibold mb-4">Creators Submit Bids</h3>
              <p className="text-gray-600">
                Creators can request retailers to distribute Command Cards by location, event, or storefront — with custom profit-sharing terms.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Store className="h-12 w-12 text-teal-600 mb-4" />
              <h3 className="text-xl font-semibold mb-4">Retailers Accept & Display</h3>
              <p className="text-gray-600">
                Retailers accept bids, receive physical Command Cards, and display them for local customers to purchase and redeem.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Key className="h-12 w-12 text-teal-600 mb-4" />
              <h3 className="text-xl font-semibold mb-4">Activation & Redemption</h3>
              <p className="text-gray-600">
                Retailers activate Command Cards in their dashboard, enabling consumers to redeem them instantly for access to digital assets.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Distribution Works</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <MapPin className="h-8 w-8 text-teal-600 mb-4" />
              <h3 className="text-lg font-medium mb-2">Local Market Reach</h3>
              <p className="text-gray-600">Connect digital assets with real-world reach through local retailers.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Share2 className="h-8 w-8 text-teal-600 mb-4" />
              <h3 className="text-lg font-medium mb-2">Profit Sharing</h3>
              <p className="text-gray-600">Retailers add markup or earn profit share on activation.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <BarChart className="h-8 w-8 text-teal-600 mb-4" />
              <h3 className="text-lg font-medium mb-2">Real-Time Analytics</h3>
              <p className="text-gray-600">Track every redemption and payout in real time.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Partner CTA */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <Users className="h-12 w-12 text-teal-600 mx-auto mb-6" />
            <h3 className="text-2xl font-bold mb-4">Want to Join as a Distribution Partner?</h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Apply to distribute Command Cards or help creators reach new markets. Physical and digital-only options available.
            </p>
            <button
              onClick={() => navigate('/dashboard/retailer')}
              className="px-8 py-3 bg-teal-600 text-white text-base font-medium rounded-md hover:bg-teal-700"
            >
              Apply as a Retailer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}