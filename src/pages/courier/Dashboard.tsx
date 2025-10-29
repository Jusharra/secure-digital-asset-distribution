import React from 'react';
import { DeliveryList } from '../../components/courier/DeliveryList';

export function CourierDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">My Deliveries</h1>
        <p className="mt-2 text-sm text-gray-600">
          View and manage your assigned deliveries
        </p>
      </div>

      <DeliveryList />
    </div>
  );
}