import React from 'react';
import { InsightsDashboard } from '../../components/admin/InsightsDashboard';

export function AdminDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Monitor system activity and performance
        </p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <InsightsDashboard />
      </div>
    </div>
  );
}