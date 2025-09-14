import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

export default function Return() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("returns"); // toggle state

  useEffect(() => {
    const fetchReturnOrders = async () => {
      try {
        const res = await axios.get(`${API}/orders`);
        const data = Array.isArray(res.data)
          ? res.data
          : res.data.data || res.data.orders || [];

        // ✅ Filter only orders with any return activity
        const returnOrders = data.filter((o) => o.returnStatus);

        setOrders(returnOrders);
      } catch (err) {
        console.error("Failed to fetch return orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReturnOrders();
  }, []);

  const updateReturnStatus = async (orderId, status) => {
    try {
      const res = await axios.post(`${API}/orders/${orderId}/return-status`, {
        returnStatus: status,
      });
      const updatedOrder = res.data.order;
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? updatedOrder : o))
      );
    } catch (err) {
      console.error(`Failed to update return status for order ${orderId}:`, err);
    }
  };

  if (loading) return <p className="p-6">Loading return orders...</p>;

  const activeReturns = orders.filter((o) => o.returnStatus !== "Return Completed");
  const completedReturns = orders.filter((o) => o.returnStatus === "Return Completed");

  return (
    <div className="p-6">
      {/* --- Toggle Buttons --- */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("returns")}
          className={`px-4 py-2 rounded-md ${
            activeTab === "returns" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          ↩️ Return Orders
        </button>

        <button
          onClick={() => setActiveTab("completed")}
          className={`px-4 py-2 rounded-md ${
            activeTab === "completed"
              ? "bg-green-600 text-white"
              : "bg-gray-200"
          }`}
        >
          ✅ Completed Returns
        </button>
      </div>

      {/* --- Section 1: Active Returns --- */}
      {activeTab === "returns" && (
        <>
          <h1 className="text-xl font-bold mb-4"> Return Orders</h1>
          {activeReturns.length === 0 ? (
            <p>No active return orders at the moment.</p>
          ) : (
            <ul className="space-y-4">
              {activeReturns.map((order) => (
                <li
                  key={order._id}
                  className="border p-4 rounded bg-white shadow-sm"
                >
                  <p><strong>Order ID:</strong> {order._id}</p>
                  <p><strong>Customer:</strong> {order.user?.name || order.customerName || "N/A"}</p>
                  <p><strong>Address:</strong> {order.address || order.shippingAddress?.full || "N/A"}</p>
                  <p><strong>Status:</strong> {order.orderStatus || "N/A"}</p>
                  <p><strong>Created At:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                  <p><strong>Payment Method:</strong> {order.paymentMethod || "N/A"}</p>
                  <p><strong>In Bucket:</strong> {order.inBucket ? "Yes" : "No"}</p>
                  <p><strong>Assigned To:</strong> {order.assignedTo?.riderName || "Not Assigned"}</p>
                  <p><strong>Total Amount:</strong> ₹{order.totalAmount}</p>
                  <p><strong>Return Status:</strong> {order.returnStatus}</p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {["Return Picked Up", "Return in Transit", "Return Completed"].map(
                      (status) => (
                        <button
                          key={status}
                          onClick={() => updateReturnStatus(order._id, status)}
                          className={`px-3 py-1 rounded text-white ${
                            order.returnStatus === status
                              ? "bg-green-600"
                              : "bg-blue-600"
                          }`}
                        >
                          {status}
                        </button>
                      )
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {/* --- Section 2: Completed Returns --- */}
      {activeTab === "completed" && (
        <div className="mt-6">
          <h2 className="text-lg font-bold mb-4">✅ Completed Returns</h2>
          {completedReturns.length === 0 ? (
            <p>No completed return orders yet.</p>
          ) : (
            <ul className="space-y-4">
              {completedReturns.map((order) => (
                <li
                  key={order._id}
                  className="border p-4 rounded bg-green-50 shadow-sm"
                >
                  <p><strong>Order ID:</strong> {order._id}</p>
                  <p><strong>Customer:</strong> {order.user?.name || order.customerName || "N/A"}</p>
                  <p><strong>Address:</strong> {order.address || order.shippingAddress?.full || "N/A"}</p>
                  <p><strong>Status:</strong> {order.orderStatus || "N/A"}</p>
                  <p><strong>Created At:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                  <p><strong>Payment Method:</strong> {order.paymentMethod || "N/A"}</p>
                  <p><strong>In Bucket:</strong> {order.inBucket ? "Yes" : "No"}</p>
                  <p><strong>Assigned To:</strong> {order.assignedTo?.riderName || "Not Assigned"}</p>
                  <p><strong>Total Amount:</strong> ₹{order.totalAmount}</p>
                  <p className="text-green-700 font-semibold">
                    Return Status: Return Completed
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
