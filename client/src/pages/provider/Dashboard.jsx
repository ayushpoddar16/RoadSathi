import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import api from "../../api/axios";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";

const SERVICE_OPTIONS = [
  "fuel",
  "mechanical",
  "electrical",
  "towing",
  "service",
];
const VEHICLE_OPTIONS = [
  "2-wheeler",
  "3-wheeler",
  "4-wheeler",
  "multi-wheeler",
];

const Dashboard = () => {
  const user = useAuthStore((state) => state.user);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [serviceTypes, setServiceTypes] = useState([]);
  const [vehicleTypesSupported, setVehicleTypesSupported] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get("/providers/me");
        setProfile(data);
        setServiceTypes(data.serviceTypes || []);
        setVehicleTypesSupported(data.vehicleTypesSupported || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const toggleService = (type) => {
    setServiceTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const toggleVehicle = (type) => {
    setVehicleTypesSupported((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const saveProfile = async () => {
    setSaving(true);
    setSaveMessage("");
    try {
      await api.put("/providers/me", { serviceTypes, vehicleTypesSupported });
      setSaveMessage("Preferences saved ✓");
      setTimeout(() => setSaveMessage(""), 2500);
    } catch (err) {
      console.error(err);
      setSaveMessage("Failed to save");
      setTimeout(() => setSaveMessage(""), 2500);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-100">
        <Loader size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-100 px-4 py-8">
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-ink-900">Hi, {user?.name}</h1>
          <p className="text-sm text-ink-500">
            Rating: {profile?.rating?.average?.toFixed(1) || "New"} ⭐ (
            {profile?.rating?.count || 0} jobs)
          </p>
        </div>

        {!profile?.isApproved && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-warning/10 text-warning text-sm">
            Your account is pending admin approval. You won't receive requests
            until approved.
          </div>
        )}

        <div className="bg-white rounded-xl2 shadow-sm p-6">
          <h2 className="font-semibold text-ink-900 mb-3">
            Services you offer
          </h2>
          <div className="flex flex-wrap gap-2 mb-6">
            {SERVICE_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => toggleService(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors capitalize ${
                  serviceTypes.includes(s)
                    ? "bg-brand-500 text-white border-brand-500"
                    : "border-ink-300 text-ink-700 hover:border-brand-400"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <h2 className="font-semibold text-ink-900 mb-3">
            Vehicle types you handle
          </h2>
          <div className="flex flex-wrap gap-2 mb-6">
            {VEHICLE_OPTIONS.map((v) => (
              <button
                key={v}
                onClick={() => toggleVehicle(v)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  vehicleTypesSupported.includes(v)
                    ? "bg-brand-500 text-white border-brand-500"
                    : "border-ink-300 text-ink-700 hover:border-brand-400"
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          <div className="flex flex-col items-center gap-2">
            <Button
              variant="primary"
              className="w-full"
              loading={saving}
              onClick={saveProfile}
            >
              Save Preferences
            </Button>
            {saveMessage && (
              <span
                className={`text-sm font-medium ${
                  saveMessage.includes("Failed")
                    ? "text-danger"
                    : "text-success"
                }`}
              >
                {saveMessage}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
