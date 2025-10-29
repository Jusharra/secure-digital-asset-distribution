import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { DeliveryForm } from '../../components/sender/DeliveryForm';

export function SenderDashboard() {
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Deliveries</h1>
          <p className="mt-2 text-sm text-gray-600">
            Create and manage your secure deliveries
          </p>
        </div>
        <button
          onClick={() => setShowDeliveryForm(!showDeliveryForm)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Delivery
        </button>
      </div>

      {showDeliveryForm && (
        <div className="mb-8">
          <DeliveryForm />
        </div>
      )}
    </div>
  );
}