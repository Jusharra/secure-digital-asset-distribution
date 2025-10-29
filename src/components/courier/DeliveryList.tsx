import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Package, CheckCircle, XCircle, Truck } from 'lucide-react';

interface Delivery {
  id: string;
  encrypted_label: string;
  status: 'pending' | 'picked_up' | 'in_transit' | 'delivered';
  created_at: string;
  assignment: {
    id: string;
    role: 'pickup' | 'delivery';
    status: 'assigned' | 'completed' | 'cancelled';
  };
}

export function DeliveryList() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      const { data, error } = await supabase
        .from('courier_assignments')
        .select(`
          id,
          role,
          status,
          delivery:delivery_queue (
            id,
            encrypted_label,
            status,
            created_at
          )
        `)
        .eq('courier_id', (await supabase.auth.getUser()).data.user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setDeliveries(data?.map(d => ({
        id: d.delivery.id,
        encrypted_label: d.delivery.encrypted_label,
        status: d.delivery.status,
        created_at: d.delivery.created_at,
        assignment: {
          id: d.id,
          role: d.role,
          status: d.status
        }
      })) || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch deliveries');
    } finally {
      setLoading(false);
    }
  };

  const updateDeliveryStatus = async (deliveryId: string, status: Delivery['status']) => {
    try {
      const { error } = await supabase
        .from('delivery_queue')
        .update({ status })
        .eq('id', deliveryId);

      if (error) throw error;

      await fetchDeliveries();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const updateAssignmentStatus = async (assignmentId: string, status: 'completed' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('courier_assignments')
        .update({ status })
        .eq('id', assignmentId);

      if (error) throw error;

      await fetchDeliveries();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update assignment');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {deliveries.map((delivery) => (
          <div
            key={delivery.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Package className="h-6 w-6 text-indigo-600" />
                  <span className="ml-2 text-sm font-medium text-gray-900">
                    {delivery.assignment.role === 'pickup' ? 'Pickup' : 'Delivery'}
                  </span>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    delivery.status === 'delivered'
                      ? 'bg-green-100 text-green-800'
                      : delivery.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {delivery.status}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Encrypted Label
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type="text"
                      readOnly
                      value={delivery.encrypted_label}
                      className="block w-full pr-10 sm:text-sm border-gray-300 rounded-md"
                      onClick={() => copyToClipboard(delivery.encrypted_label)}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        onClick={() => copyToClipboard(delivery.encrypted_label)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <span className="sr-only">Copy</span>
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                          <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  {delivery.assignment.status === 'assigned' && (
                    <>
                      <button
                        onClick={() => updateAssignmentStatus(delivery.assignment.id, 'completed')}
                        className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Complete
                      </button>
                      <button
                        onClick={() => updateAssignmentStatus(delivery.assignment.id, 'cancelled')}
                        className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancel
                      </button>
                    </>
                  )}

                  {delivery.status !== 'delivered' && delivery.assignment.status === 'assigned' && (
                    <button
                      onClick={() => updateDeliveryStatus(delivery.id, 
                        delivery.status === 'pending' ? 'picked_up' :
                        delivery.status === 'picked_up' ? 'in_transit' :
                        'delivered'
                      )}
                      className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Truck className="h-4 w-4 mr-2" />
                      {delivery.status === 'pending' ? 'Mark Picked Up' :
                       delivery.status === 'picked_up' ? 'Start Transit' :
                       'Mark Delivered'}
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 text-xs text-gray-500">
                Created: {new Date(delivery.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {deliveries.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No deliveries</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have any assigned deliveries at the moment.
          </p>
        </div>
      )}
    </div>
  );
}