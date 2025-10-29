import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Handshake, Users, Globe, Shield, Award, ChevronRight } from 'lucide-react';

export function PartnersPage() {
  const navigate = useNavigate();

  const partnerTypes = [
    {
      title: 'Technology Partners',
      description: 'Integrate your solutions with our platform',
      icon: Shield,
      benefits: [
        'API access and documentation',
        'Technical support and resources',
        'Co-marketing opportunities'
      ]
    },
    {
      title: 'Distribution Partners',
      description: 'Help creators reach new markets',
      icon: Globe,
      benefits: [
        'Revenue sharing model',
        'Territory exclusivity options',
        'Marketing support'
      ]
    },
    {
      title: 'Solution Partners',
      description: 'Build services around our platform',
      icon: Award,
      benefits: [
        'Partner certification program',
        'Lead sharing opportunities',
        'Partner portal access'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold sm:text-5xl md:text-6xl">
              Partner With Us
            </h1>
            <p className="mt-6 text-xl max-w-3xl mx-auto">
              Join our ecosystem and help shape the future of digital asset distribution.
            </p>
            <div className="mt-10">
              <button
                onClick={() => navigate('/contact')}
                className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-gray-50"
              >
                Become a Partner
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Partner Types */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Partnership Programs</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {partnerTypes.map((type, index) => {
              const Icon = type.icon;
              return (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <Icon className="h-12 w-12 text-indigo-600 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{type.title}</h3>
                  <p className="text-gray-600 mb-4">{type.description}</p>
                  <ul className="space-y-2">
                    {type.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-center text-sm text-gray-600">
                        <ChevronRight className="h-4 w-4 text-indigo-600 mr-2" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Testimonial */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <Users className="h-12 w-12 text-indigo-600 mx-auto mb-6" />
            <blockquote className="text-2xl font-medium text-gray-900 mb-4">
              "Partnering with SecureAssets has opened new revenue streams and helped us serve our clients better."
            </blockquote>
            <p className="text-gray-500">— Technology Partner</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold mb-8">Ready to Partner With Us?</h2>
          <button
            onClick={() => navigate('/contact')}
            className="px-8 py-3 bg-white text-indigo-700 text-base font-medium rounded-md hover:bg-gray-50"
          >
            Contact Our Partnership Team
          </button>
        </div>
      </div>
    </div>
  );
}