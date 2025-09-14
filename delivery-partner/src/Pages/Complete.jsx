import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

export default function Complete() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompletedOrders = async () => {
      try {
        const res = await axios.get(`${API}/orders`);
        const data = Array.isArray(res.data)
          ? res.data
          : res.data.data || res.data.orders || [];

        // ✅ only completed orders
        const completedOrders = data.filter(
          (o) => o.assignedTo?.completed === true
        );

        setOrders(completedOrders);
      } catch (err) {
        console.error("Failed to fetch completed orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedOrders();
  }, []);

  if (loading) return <p className="p-6">Loading completed orders...</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">✅ Completed Orders</h1>
      {orders.length === 0 ? (
        <p>No completed orders yet.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li
              key={order._id}
              className="border p-4 rounded bg-green-50 shadow-sm" // ✅ light green background
            >
              <p>
                <strong>Order ID:</strong> {order._id}
              </p>
              <p>
                <strong>Customer:</strong>{" "}
                {order.user?.name || order.customerName || "N/A"}
              </p>
              <p>
                <strong>Status:</strong> {order.orderStatus || "Delivered"}
              </p>
              <p>
                <strong>Total Amount:</strong> ₹{order.totalAmount}
              </p>
              {order.assignedTo?.deliveredAt && (
                <p>
                  <strong>Delivered At:</strong>{" "}
                  {new Date(order.assignedTo.deliveredAt).toLocaleString()}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
