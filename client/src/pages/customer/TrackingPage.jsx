import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LeafletMap from "../../components/map/LeafletMap";
import Loader from "../../components/common/Loader";
import Button from "../../components/common/Button";
import api from "../../api/axios";
import { connectSocket, getSocket } from "../../lib/socket";

const STATUS_LABELS = {
  pending: "Searching for nearby help...",
  matched: "Mechanic matched — waiting for them to start",
  on_the_way: "Mechanic is on the way",
  arrived: "Mechanic has arrived",
  in_progress: "Service in progress",
  completed: "Service completed",
};

const TrackingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [providerLocation, setProviderLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const { data } = await api.get(`/requests/${id}`);
        setRequest(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();

    let socket = getSocket();
    if (!socket) socket = connectSocket();

    socket.on("request-matched", (payload) => {
      if (payload.requestId === id) {
        setRequest((prev) => ({ ...prev, status: "matched" }));
        fetchRequest(); // refetch to get populated provider details
      }
    });

    socket.on("status-update", (payload) => {
      if (payload.requestId === id) {
        setRequest((prev) => ({ ...prev, status: payload.status }));
        if (payload.status === "completed") {
          navigate(`/customer/payment/${id}`);
        }
      }
    });

    socket.on("provider-location-update", (payload) => {
        if (payload.requestId === id) {
        setProviderLocation({
          latitude: payload.latitude,
          longitude: payload.longitude,
        });
      }
    });

    return () => {
      socket.off("request-matched");
      socket.off("status-update");
      socket.off("provider-location-update");
    };
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-100">
        <Loader size="lg" text="Loading your request..." />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-100">
        <p className="text-ink-500">Request not found.</p>
      </div>
    );
  }

  const customerLoc = {
    latitude: request.location.coordinates[1],
    longitude: request.location.coordinates[0],
  };

  return (
    <div className="min-h-screen bg-ink-100 px-4 py-8">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-xl2 shadow-sm p-6 mb-4">
          <div className="flex items-center gap-2 mb-1">
            {request.status === "pending" && (
              <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
            )}
            {request.status !== "pending" && request.status !== "completed" && (
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            )}
            <h2 className="font-semibold text-ink-900">
              {STATUS_LABELS[request.status]}
            </h2>
          </div>
          <p className="text-sm text-ink-500">{request.subIssue}</p>

          {request.provider && (
            <div className="mt-4 pt-4 border-t border-ink-100 flex items-center justify-between">
              <div>
                <p className="font-medium text-ink-900">
                  {request.provider.user.name}
                </p>
                <p className="text-sm text-ink-500">
                  {request.provider.user.phone}
                </p>
              </div>
              <a
                href={`tel:${request.provider.user.phone}`}
                className="px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600"
              >
                Call
              </a>
            </div>
          )}
        </div>

        <LeafletMap
          customerLocation={customerLoc}
          providerLocation={providerLocation}
          height="360px"
        />

        {request.status === "pending" && (
          <div className="mt-4 text-center">
            <Loader text="Notifying nearby providers..." />
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackingPage;
