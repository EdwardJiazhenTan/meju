"use client";

import { useState } from "react";

interface OrderDetails {
  id: number;
  user_name: string;
  people_count: number;
  notes?: string;
  status: string;
  created_at: string;
}

interface OrderGroup {
  dish_name: string;
  orders: OrderDetails[];
  total_people: number;
  total_orders: number;
}

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderGroup: OrderGroup | null;
  date: string;
  mealType: string;
}

export default function OrderDetailsModal({
  isOpen,
  onClose,
  orderGroup,
  date,
  mealType,
}: OrderDetailsModalProps) {
  const [updatingOrder, setUpdatingOrder] = useState<number | null>(null);

  if (!isOpen || !orderGroup) return null;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      case 'confirmed': return 'text-blue-700 bg-blue-100 border-blue-300';
      case 'completed': return 'text-green-700 bg-green-100 border-green-300';
      default: return 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    setUpdatingOrder(orderId);
    try {
      const response = await fetch('/api/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: orderId,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      // Update the local order group data
      const updatedOrders = orderGroup.orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      );

      // This is a bit of a hack since we can't easily update the parent state
      // In a real app, you'd want to lift state up or use a state management solution
      window.location.reload(); // Simple refresh for now

    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    } finally {
      setUpdatingOrder(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">{orderGroup.dish_name}</h2>
              <p className="text-blue-100 mt-1">
                {mealType.charAt(0).toUpperCase() + mealType.slice(1)} on {new Date(date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 px-6 py-4 border-b">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{orderGroup.total_orders}</div>
              <div className="text-sm text-gray-600">Total Orders</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{orderGroup.total_people}</div>
              <div className="text-sm text-gray-600">Total People</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {orderGroup.orders.filter(o => o.status === 'confirmed').length}
              </div>
              <div className="text-sm text-gray-600">Confirmed</div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-4">
            {orderGroup.orders.map((order) => (
              <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900">
                      {order.user_name}
                    </h4>
                    <p className="text-gray-600">
                      {order.people_count} {order.people_count === 1 ? 'person' : 'people'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <div className="text-xs text-gray-500">
                      Order #{order.id}
                    </div>
                  </div>
                </div>

                {order.notes && (
                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-700">Notes: </span>
                    <span className="text-sm text-gray-600">{order.notes}</span>
                  </div>
                )}

                <div className="text-xs text-gray-500 mb-3">
                  Ordered: {new Date(order.created_at).toLocaleString()}
                </div>

                {/* Status Update Buttons */}
                <div className="flex gap-2">
                  {order.status !== 'confirmed' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'confirmed')}
                      disabled={updatingOrder === order.id}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {updatingOrder === order.id ? 'Updating...' : 'Confirm'}
                    </button>
                  )}
                  {order.status !== 'completed' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'completed')}
                      disabled={updatingOrder === order.id}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {updatingOrder === order.id ? 'Updating...' : 'Complete'}
                    </button>
                  )}
                  {order.status !== 'pending' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'pending')}
                      disabled={updatingOrder === order.id}
                      className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 transition-colors disabled:opacity-50"
                    >
                      {updatingOrder === order.id ? 'Updating...' : 'Mark Pending'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
