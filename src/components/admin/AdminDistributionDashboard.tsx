import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, AlertCircle, CheckCircle, XCircle, Filter } from 'lucide-react';

interface Bid {
  id: string;
  creator_id: string;
  asset_id: string;
  quantity: number;
  region: string;
  bid_type: 'profit_share' | 'flat_fee';
  profit_percent?: number;
  flat_fee?: number;
  status: 'pending' | 'approved' | 'rejected' | 'fulfilled';
  created_at: string;
  digital_assets: {
    title: string;
    type: string;
  };
  users: {
    email: string;
  };
}

interface Assignment {
  id: string;
  bid_id: string;
  retailer_id: string;
  quantity: number;
  status: 'pending' | 'active' | 'completed';
  assigned_at: string;
  distribution_bids: Bid;
  retailer: {
    email: string;
  };
}

export function AdminDistributionDashboard() {
  const [activeTab, setActiveTab] = useState<'bids' | 'assigned' | 'fulfilled'>('bids');
  const [bids, setBids] = useState<Bid[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (activeTab === 'bids') {
        const { data, error } = await supabase
          .from('distribution_bids')
          .select(`
            *,
            digital_assets (title, type),
            users (email)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setBids(data || []);
      } else {
        const { data, error } = await supabase
          .from('distribution_assignments')
          .select(`
            *,
            distribution_bids!inner(*,
              digital_assets (title, type),
              users (email)
            ),
            retailer:users!distribution_assignments_retailer_id_fkey(email)
          `)
          .eq('status', activeTab === 'assigned' ? 'active' : 'completed')
          .order('assigned_at', { ascending: false });

        if (error) throw error;
        setAssignments(data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleBidAction = async (bidId: string, action: 'approve' | 'reject') => {
    try {
      const { error } = await supabase
        .from('distribution_bids')
        .update({ status: action === 'approve' ? 'approved' : 'rejected' })
        .eq('id', bidId);

      if (error) throw error;
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update bid');
    }
  };

  const handleAssignment = async (bidId: string, retailerId: string, quantity: number) => {
    try {
      const { error } = await supabase
        .from('distribution_assignments')
        .insert({
          bid_id: bidId,
          retailer_id: retailerId,
          quantity,
          status: 'active',
          assigned_at: new Date().toISOString()
        });

      if (error) throw error;
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create assignment');
    }
  };

  const filteredBids = statusFilter === 'all' 
    ? bids 
    : bids.filter(bid => bid.status === statusFilter);

  const filteredAssignments = statusFilter === 'all'
    ? assignments
    : assignments.filter(assignment => assignment.status === statusFilter);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex space-x-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('bids')}
          className={`py-4 px-6 text-sm font-medium ${
            activeTab === 'bids'
              ? 'border-b-2 border-indigo-500 text-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          All Bids
        </button>
        <button
          onClick={() => setActiveTab('assigned')}
          className={`py-4 px-6 text-sm font-medium ${
            activeTab === 'assigned'
              ? 'border-b-2 border-indigo-500 text-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Assigned Batches
        </button>
        <button
          onClick={() => setActiveTab('fulfilled')}
          className={`py-4 px-6 text-sm font-medium ${
            activeTab === 'fulfilled'
              ? 'border-b-2 border-indigo-500 text-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Fulfilled
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <Filter className="h-5 w-5 text-gray-400" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">All Status</option>
          {activeTab === 'bids' ? (
            <>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="fulfilled">Fulfilled</option>
            </>
          ) : (
            <>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </>
          )}
        </select>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'bids' ? (
        <div className="grid gap-6">
          {filteredBids.map((bid) => (
            <div key={bid.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {bid.digital_assets.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Creator: {bid.users.email}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  bid.status === 'approved' ? 'bg-green-100 text-green-800' :
                  bid.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  bid.status === 'fulfilled' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {bid.status}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Quantity</dt>
                  <dd className="mt-1 text-sm text-gray-900">{bid.quantity} cards</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Region</dt>
                  <dd className="mt-1 text-sm text-gray-900">{bid.region}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Bid Type</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {bid.bid_type === 'profit_share' ? 'Profit Share' : 'Flat Fee'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    {bid.bid_type === 'profit_share' ? 'Profit %' : 'Fee'}
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {bid.bid_type === 'profit_share'
                      ? `${bid.profit_percent}%`
                      : `$${bid.flat_fee}`}
                  </dd>
                </div>
              </div>

              {bid.status === 'pending' && (
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => handleBidAction(bid.id, 'reject')}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleBidAction(bid.id, 'approve')}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </button>
                </div>
              )}
            </div>
          ))}

          {filteredBids.length === 0 && (
            <div className="text-center py-12">
              <h3 className="mt-2 text-sm font-medium text-gray-900">No bids found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {statusFilter === 'all'
                  ? 'No distribution bids have been submitted yet'
                  : `No bids with status "${statusFilter}"`}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredAssignments.map((assignment) => (
            <div key={assignment.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {assignment.distribution_bids.digital_assets.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Creator: {assignment.distribution_bids.users.email}
                  </p>
                  <p className="text-sm text-gray-500">
                    Retailer: {assignment.retailer.email}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  assignment.status === 'completed' ? 'bg-green-100 text-green-800' :
                  assignment.status === 'active' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {assignment.status}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Quantity</dt>
                  <dd className="mt-1 text-sm text-gray-900">{assignment.quantity} cards</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Assigned At</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(assignment.assigned_at).toLocaleDateString()}
                  </dd>
                </div>
              </div>
            </div>
          ))}

          {filteredAssignments.length === 0 && (
            <div className="text-center py-12">
              <h3 className="mt-2 text-sm font-medium text-gray-900">No assignments found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {statusFilter === 'all'
                  ? 'No batches have been assigned yet'
                  : `No assignments with status "${statusFilter}"`}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}