import { useEffect, useState } from "react";
import axios from "axios";
import Complete from "./Complete"; // ✅ import Completed section

const API = import.meta.env.VITE_API_URL;


function getCurrentRiderFromStorage() {
  const keys = ["rider", "currentRider", "currentUser", "user", "authUser"];
  for (const key of keys) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw);
      const id = parsed._id || parsed.id || parsed.userId || parsed.riderId;
      const name =
        parsed.name || parsed.fullName || parsed.riderName || parsed.username;
      if (id && name) return { id: String(id), name };
    } catch {
      if (key === "rider") return { id: raw, name: "Rider" };
    }
  }
  return null;
}

export default function BucketList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("bucket"); // ✅ toggle state
  const currentRider = getCurrentRiderFromStorage();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentRider) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(`${API}/orders`);
        const data = Array.isArray(res.data)
          ? res.data
          : res.data.data || res.data.orders || [];

        const riderBucketOrders = data
          .filter(
            (o) =>
              o.inBucket === true &&
              o.assignedTo?.riderName === currentRider.name
          )
          .map((o) => ({
            ...o,
            orderStatus: o.orderStatus || o.status || "Packed / Processing",
          }));

        setOrders(riderBucketOrders);
      } catch (err) {
        console.error("Failed to fetch bucketlist:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentRider]);

  const updateOrderStatus = async (orderId, status) => {
    try {
      const res = await axios.post(`${API}/delivery/orders/${orderId}/status`, {
        status,
        riderName: currentRider.name,
      });
      return res.data.order;
    } catch (err) {
      console.error(`Failed to update order ${orderId} status:`, err);
      return null;
    }
  };

  const handleRemove = async (order) => {
    try {
      await axios.post(`${API}/orders/bucket/${order._id}/toggle`, {
        riderId: currentRider.id,
        riderName: currentRider.name,
      });

      setOrders((prev) => prev.filter((o) => o._id !== order._id));
    } catch (err) {
      console.error("Failed to remove from bucket:", err);
    }
  };

  const handleToggleOutForDelivery = async (order) => {
    const newStatus =
      order.orderStatus === "Out for Delivery"
        ? "Packed / Processing"
        : "Out for Delivery";

    const updatedOrder = await updateOrderStatus(order._id, newStatus);
    if (updatedOrder) {
      setOrders((prev) =>
        prev.map((o) =>
          o._id === order._id ? { ...o, orderStatus: newStatus } : o
        )
      );
    }
  };

  const handleDelivered = async (order) => {
    try {
      const res = await axios.post(
        `${API}/delivery/orders/${order._id}/status`,
        {
          status: "Delivered",
          riderName: currentRider.name,
        }
      );

      const updatedOrder = res.data.order;
      setOrders((prev) =>
        prev.map((o) => (o._id === order._id ? updatedOrder : o))
      );

      alert("Delivery successful!");
    } catch (err) {
      console.error(`Failed to deliver order ${order._id}:`, err);
    }
  };

  if (loading) return <p className="p-6">Loading bucketlist...</p>;

  if (!currentRider) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">Bucket List</h1>
        <p>Please login as a rider to view your bucketlist.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* --- Toggle Buttons --- */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("bucket")}
          className={`px-4 py-2 rounded-md ${
            activeTab === "bucket" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Bucket List – {currentRider.name}
        </button>

        <button
          onClick={() => setActiveTab("completed")}
          className={`px-4 py-2 rounded-md ${
            activeTab === "completed"
              ? "bg-green-600 text-white"
              : "bg-gray-200"
          }`}
        >
          ✅ Completed Orders
        </button>
      </div>

      {/* --- Section 1: BucketList --- */}
      {activeTab === "bucket" && (
        <>
          <h1 className="text-xl font-bold mb-4">
            Bucket List - {currentRider.name}
          </h1>
          {orders.length === 0 ? (
            <p>No orders in your bucketlist.</p>
          ) : (
            <ul className="space-y-4">
              {orders.map((order) => (
                <li
                  key={order._id}
                  className="border p-4 rounded bg-white shadow-sm"
                >
                  <p>
                    <strong>Order ID:</strong> {order._id}
                  </p>
                  <p>
                    <strong>Customer:</strong>{" "}
                    {order.user?.name || order.customerName || "N/A"}
                  </p>
                  <p>
                    <strong>Address:</strong>{" "}
                    {order.address || order.shippingAddress?.full || "N/A"}
                  </p>
                  <p>
                    <strong>Status:</strong> {order.orderStatus}
                  </p>
                  <p>
                    <strong>Created At:</strong>{" "}
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                  <p>
                    <strong>Payment Method:</strong>{" "}
                    {order.paymentMethod || "N/A"}
                  </p>
                  <p>
                    <strong>In Bucket:</strong> {order.inBucket ? "Yes" : "No"}
                  </p>
                  <p>
                    <strong>Assigned To:</strong>{" "}
                    {order.assignedTo?.riderName || "Not Assigned"}
                  </p>
                  <p>
                    <strong>Total Amount:</strong> ₹{order.totalAmount}
                  </p>
                  <p>
                    <strong>Return Status:</strong>{" "}
                    {order.returnStatus || "N/A"}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => handleRemove(order)}
                      className="px-3 py-1 bg-gray-500 text-white rounded"
                    >
                      Remove from Bucket
                    </button>

                    <button
                      onClick={() => handleToggleOutForDelivery(order)}
                      className={`px-3 py-1 rounded text-white ${
                        order.orderStatus === "Out for Delivery"
                          ? "bg-yellow-600"
                          : "bg-blue-600"
                      }`}
                    >
                      {order.orderStatus === "Out for Delivery"
                        ? "Revert to Packed"
                        : "Out for Delivery"}
                    </button>

                    <button
                      onClick={() => handleDelivered(order)}
                      className="px-3 py-1 bg-green-600 text-white rounded"
                    >
                      Delivered
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {/* --- Section 2: Completed Orders --- */}
      {activeTab === "completed" && (
        <div className="mt-6">
          <Complete />
        </div>
      )}
    </div>
  );
}
