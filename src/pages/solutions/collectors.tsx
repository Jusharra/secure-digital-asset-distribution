import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, Key, FileText, Share2, Package, Users, Download, ChevronRight } from 'lucide-react';

export function CollectorsPage() {
  const navigate = useNavigate();

  const benefits = [
    { icon: Gift, title: 'Get digital gifts via Command Cards' },
    { icon: Key, title: 'Redeem to access exclusive content' },
    { icon: FileText, title: 'Save assets to your account for later use' },
    { icon: Share2, title: 'Gift content to others with one click' }
  ];

  const steps = [
    'Buy or receive a Command Card',
    'Go to Redeem Page',
    'Enter serial code + public key + display ID',
    'Access content forever from your dashboard',
    'Share or gift to friends'
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-green-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold sm:text-5xl md:text-6xl">
              Redeem Command Cards. Access Premium Content.
            </h1>
            <p className="mt-6 text-xl max-w-3xl mx-auto">
              Buy or receive a Command Card? Redeem it to unlock books, music, software, services, and more.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <button
                onClick={() => navigate('/marketplace')}
                className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-teal-700 bg-white hover:bg-gray-50"
              >
                Browse the Marketplace
              </button>
              <button
                onClick={() => navigate('/dashboard/consumer')}
                className="px-8 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-teal-500"
              >
                Redeem a Card
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">What You Can Do</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                  <Icon className="h-12 w-12 text-teal-600 mb-4" />
                  <h3 className="text-xl font-medium mb-2">{benefit.title}</h3>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid gap-8 md:grid-cols-5">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white p-6 rounded-lg shadow-sm h-full">
                  <div className="flex items-center justify-center w-8 h-8 bg-teal-600 text-white rounded-full mb-4">
                    {index + 1}
                  </div>
                  <p className="text-gray-600">{step}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                    <ChevronRight className="h-6 w-6 text-teal-600" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonial */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <Users className="h-12 w-12 text-teal-600 mx-auto mb-6" />
            <blockquote className="text-2xl font-medium text-gray-900 mb-4">
              "My cousin gifted me a podcast series and beat pack — I just typed in the card code and owned it!"
            </blockquote>
            <p className="text-gray-500">— Command Card User</p>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold mb-8">Ready to Start Collecting?</h2>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate('/dashboard/consumer')}
              className="px-8 py-3 bg-white text-teal-700 text-base font-medium rounded-md hover:bg-gray-50"
            >
              Redeem Your Card
            </button>
            <button
              onClick={() => navigate('/auth/signup')}
              className="px-8 py-3 border border-white text-white text-base font-medium rounded-md hover:bg-teal-600"
            >
              Create an Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}