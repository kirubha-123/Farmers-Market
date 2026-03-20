import { useEffect, useState } from 'react';
import { api } from '../api';

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString();
}

function OrdersPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const res = await api.get('/orders/my-orders', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setOrders(res.data);
        } else {
          // Fallback legacy local storage support
          const stored = localStorage.getItem('orders');
          if (stored) setOrders(JSON.parse(stored));
        }
      } catch (err) {
        console.error('Failed to load orders API:', err);
        const stored = localStorage.getItem('orders');
        if (stored) setOrders(JSON.parse(stored));
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-emerald-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-xl font-semibold text-emerald-900 mb-1">
          My Orders
        </h1>
        <p className="text-xs text-emerald-900/70 mb-4">
          Track and manage your orders
        </p>

        {orders.length === 0 ? (
          <p className="text-sm text-emerald-900/70">
            No orders yet. Place an order from your cart.
          </p>
        ) : (
          <div className="space-y-4">
            {orders.map((order, idx) => {
              if (!order) return null;
              const idStr = order._id ? String(order._id) : (order.id ? String(order.id) : 'N/A');
              return (
                <div
                  key={order._id || order.id || idx}
                  className="bg-white rounded-2xl border border-emerald-100 p-4 flex justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-emerald-900">
                        Order #{idStr !== 'N/A' ? idStr.slice(-4) : 'N/A'}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                        {order.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-900/70">
                      {formatDate(order.createdAt)}
                    </p>

                    <div className="mt-3 text-[11px] text-emerald-900/80">
                      <p className="font-semibold mb-1">Items</p>
                      {order.items?.map((it, i) => (
                        <p key={it._id || i}>
                          {it.quantityKg || it.qty || 0} kg × {it.name}
                        </p>
                      ))}
                      <p className="font-semibold mt-2">Delivery to:</p>
                      <p>{order.deliveryAddress || order.address || 'Not Provided'}</p>
                    </div>
                  </div>

                  <div className="text-right text-sm font-semibold text-emerald-900">
                    ₹{(order.totalAmount || order.total || 0).toLocaleString()}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrdersPage;
