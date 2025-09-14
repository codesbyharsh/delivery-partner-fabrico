import { useState, useEffect, useRef } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;


export default function LocationSharing({ user, onSharingChange }) {
  const [sharing, setSharing] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const sendCurrentPosition = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          await axios.post(`${API}/rider/${user.id}/location`, {
            lat: latitude,
            lng: longitude,
          });
        } catch (err) {
          console.error("Failed to send location:", err);
        }
      },
      (err) => console.error("Geolocation error:", err),
      { enableHighAccuracy: true }
    );
  };

  const startSharing = () => {
    if (!user?.id) {
      alert("Please login first");
      return;
    }
    setSharing(true);
    onSharingChange(true); // ✅ tell parent
    sendCurrentPosition();
    intervalRef.current = setInterval(sendCurrentPosition, 5000);
  };

  const stopSharing = () => {
    setSharing(false);
    onSharingChange(false); // ✅ tell parent
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  return (
    <div className="my-4">
      {sharing ? (
        <button
          onClick={stopSharing}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Stop Sharing Location
        </button>
      ) : (
        <button
          onClick={startSharing}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Start Sharing Location
        </button>
      )}
    </div>
  );
}
