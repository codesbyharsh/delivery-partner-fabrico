import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LocationSharing from "../components/LocationSharing";

// Import pages
import Orders from "./Orders";
import BucketList from "./BucketList";
import Complete from "./Complete";
import Return from "./Return";

const API = "http://localhost:5000/api";

export default function Dashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [locationLogs, setLocationLogs] = useState([]);
  const [sharingActive, setSharingActive] = useState(false);
  const [activeTab, setActiveTab] = useState("orders"); // Track which section is active
  const [refreshKey, setRefreshKey] = useState(0); // ✅ refresh trigger

  useEffect(() => {
    if (!currentUser?.id || !sharingActive) return;

    let cancelled = false;

    const fetchLocation = async () => {
      try {
        const res = await axios.get(`${API}/rider/${currentUser.id}/location`);
        if (!cancelled && res.data?.location) {
          const { lat, lng, updatedAt } = res.data.location;
          const time = updatedAt
            ? new Date(updatedAt).toLocaleTimeString()
            : new Date().toLocaleTimeString();
          setLocationLogs((prev) => {
            const next = [
              `📍 ${lat.toFixed(6)}, ${lng.toFixed(6)} at ${time}`,
              ...prev,
            ];
            return next.slice(0, 50);
          });
        }
      } catch (err) {
        console.error("Failed to fetch location:", err);
      }
    };

    fetchLocation();
    const interval = setInterval(fetchLocation, 5000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [currentUser?.id, sharingActive]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1); // ✅ forces re-render of active tab
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xl font-bold"> {currentUser?.name}</span>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
             Refresh
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Location Sharing */}
      <LocationSharing user={currentUser} onSharingChange={setSharingActive} />

      {/* Location Logs */}
      {sharingActive && (
        <div
          style={{
            marginTop: "18px",
            padding: "10px",
            border: "1px solid #e2e8f0",
            background: "#ffffff",
            maxHeight: "220px",
            overflowY: "auto",
            borderRadius: "8px",
          }}
        >
          <h4 style={{ margin: "0 0 8px 0" }}>📡 Location Logs</h4>
          {locationLogs.length === 0 ? (
            <p style={{ color: "#6b7280" }}>No location updates yet.</p>
          ) : (
            <ul style={{ paddingLeft: "18px", margin: 0 }}>
              {locationLogs.map((log, i) => (
                <li
                  key={i}
                  style={{ marginBottom: "6px", fontFamily: "monospace" }}
                >
                  {log}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex gap-4 mt-6 border-b pb-2">
        <button
          className={`${
            activeTab === "orders" ? "font-bold text-blue-600" : "text-gray-600"
          }`}
          onClick={() => setActiveTab("orders")}
        >
          Orders
        </button>
        <button
          className={`${
            activeTab === "bucket" ? "font-bold text-blue-600" : "text-gray-600"
          }`}
          onClick={() => setActiveTab("bucket")}
        >
          Bucket List
        </button>
        <button
          className={`${
            activeTab === "return" ? "font-bold text-blue-600" : "text-gray-600"
          }`}
          onClick={() => setActiveTab("return")}
        >
          Returns
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === "orders" && <Orders key={refreshKey} />}
        {activeTab === "bucket" && <BucketList key={refreshKey} />}
        {activeTab === "return" && <Return key={refreshKey} />}
      </div>
    </div>
  );
}
