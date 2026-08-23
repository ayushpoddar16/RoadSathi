import { useState, useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { connectSocket, getSocket } from "../../lib/socket";
import api from "../../api/axios";

const ProviderLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);

  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    let socket = getSocket();
    if (!socket) socket = connectSocket();

    // fetch current online status on first load
    api.get("/providers/me").then(({ data }) => setIsOnline(data.isOnline));
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    if (isOnline) {
      socket.emit("provider-online");
    } else {
      socket.emit("provider-offline");
    }
  }, [isOnline]);

  useEffect(() => {
    if (!isOnline) return;
    const socket = getSocket();

    const sendLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          socket.emit("update-location", {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          console.log(
            "Sent location:",
            position.coords.latitude,
            position.coords.longitude,
          ); // ADD THIS
        },
        (err) => console.error("Geolocation failed:", err.message),
        { enableHighAccuracy: true },
      );
    };

    sendLocation();
    const interval = setInterval(sendLocation, 5000);
    return () => clearInterval(interval);
  }, [isOnline]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div>
      <nav className="bg-white border-b border-ink-100 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <span className="font-bold text-brand-500">RoadSathi</span>
          <div className="flex items-center gap-4 text-sm">
            <Link
              to="/provider"
              className={
                location.pathname === "/provider"
                  ? "text-brand-500 font-medium"
                  : "text-ink-500"
              }
            >
              Dashboard
            </Link>
            <Link
              to="/provider/requests"
              className={
                location.pathname.includes("requests")
                  ? "text-brand-500 font-medium"
                  : "text-ink-500"
              }
            >
              Requests
            </Link>
            <Link
              to="/provider/history"
              className={
                location.pathname.includes("history")
                  ? "text-brand-500 font-medium"
                  : "text-ink-500"
              }
            >
              History
            </Link>
            <button
              onClick={() => setIsOnline(!isOnline)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                isOnline ? "bg-success text-white" : "bg-ink-300 text-ink-700"
              }`}
            >
              {isOnline ? "● Online" : "○ Offline"}
            </button>
            <button
              onClick={handleLogout}
              className="text-ink-500 hover:text-danger"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      <Outlet />
    </div>
  );
};

export default ProviderLayout;
