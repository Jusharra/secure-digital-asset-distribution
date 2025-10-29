import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MyAssets } from './MyAssets';
import { AssetUploadWizard } from '../../components/creator/AssetUploadWizard';
import { EarningsPanel } from '../../components/creator/EarningsPanel';
import { ReferralProgram } from '../../components/creator/ReferralProgram';
import { PurchaseKeyForm } from '../../components/creator/PurchaseKeyForm';
import { Distribution } from './Distribution';
import { supabase } from '../../lib/supabase';
import { FileText, DollarSign, CreditCard } from 'lucide-react';

interface Asset {
  id: string;
  title: string;
  description: string;
  type: string;
  price: number;
  source_file_url: string | null;
  master_file_url: string | null;
  cover_image_url: string | null;
  created_at: string;
  display_id: string;
  encryption_keys: {
    public_key: string;
  }[];
}

export function CreatorDashboard() {
  const [metrics, setMetrics] = useState({
    totalAssets: 0,
    totalRedemptions: 0,
    totalRevenue: 0
  });
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: createdAssets } = await supabase
        .from('digital_assets')
        .select('*')
        .eq('creator_id', user.id);

      const { data: redeemedCards } = await supabase
        .from('prepaid_cards')
        .select('*')
        .in('asset_id', createdAssets?.map(a => a.id) || [])
        .eq('redeemed', true);

      const totalAssets = createdAssets?.length || 0;
      const totalRedemptions = redeemedCards?.length || 0;
      const totalRevenue = totalRedemptions * 10; // $10 per redemption

      setMetrics({ totalAssets, totalRedemptions, totalRevenue });
      setAssets(createdAssets || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  }

  const DashboardOverview = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Creator Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Overview of your digital assets and performance
        </p>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Assets Created
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {metrics.totalAssets}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CreditCard className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Redemptions
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {metrics.totalRedemptions}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Estimated Revenue
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    ${metrics.totalRevenue}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Asset Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            My Digital Assets
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assets.map((asset: any) => (
                <tr key={asset.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {asset.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {asset.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {asset.status || 'active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(asset.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {assets.length === 0 && !loading && (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No assets yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first digital asset.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route path="assets" element={<MyAssets />} />
        <Route path="upload" element={
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-gray-900">Upload Asset</h1>
              <p className="mt-2 text-sm text-gray-600">
                Create and publish a new digital asset
              </p>
            </div>
            <div className="max-w-4xl mx-auto">
              <AssetUploadWizard onComplete={() => {}} />
            </div>
          </div>
        } />
        <Route path="distribution" element={<Distribution />} />
        <Route path="purchase-key" element={
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-gray-900">Purchase Key Pair</h1>
              <p className="mt-2 text-sm text-gray-600">
                Purchase a key pair for your next digital asset
              </p>
            </div>
            <div className="max-w-4xl mx-auto">
              <PurchaseKeyForm />
            </div>
          </div>
        } />
        <Route path="earnings" element={
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-gray-900">Earnings</h1>
              <p className="mt-2 text-sm text-gray-600">
                Track your revenue and payouts
              </p>
            </div>
            <EarningsPanel />
          </div>
        } />
        <Route path="referrals" element={
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-gray-900">Referral Program</h1>
              <p className="mt-2 text-sm text-gray-600">
                Earn rewards by inviting other creators
              </p>
            </div>
            <ReferralProgram />
          </div>
        } />
        <Route path="dashboard" element={<DashboardOverview />} />
        <Route path="" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </div>
  );
}