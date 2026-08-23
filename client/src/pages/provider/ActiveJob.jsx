import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LeafletMap from "../../components/map/LeafletMap";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import api from "../../api/axios";
import { connectSocket, getSocket } from "../../lib/socket";

const STATUS_FLOW = [
  "matched",
  "on_the_way",
  "arrived",
  "in_progress",
  "completed",
];

const STATUS_ACTIONS = {
  matched: { next: "on_the_way", label: "Start Heading There" },
  on_the_way: { next: "arrived", label: "Mark as Arrived" },
  arrived: { next: "in_progress", label: "Start Service" },
  in_progress: { next: "completed", label: "Mark as Completed" },
};

const ActiveJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

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

    socket.on("status-update", (payload) => {
      if (payload.requestId === id) {
        setRequest((prev) => ({ ...prev, status: payload.status }));
      }
    });

    return () => socket.off("status-update");
  }, [id]);

  const handleUpdateStatus = () => {
    const nextStatus = STATUS_ACTIONS[request.status]?.next;
    if (!nextStatus) return;

    setUpdating(true);
    const socket = getSocket();
    socket.emit("update-status", { requestId: id, status: nextStatus });

    setRequest((prev) => ({ ...prev, status: nextStatus })); // optimistic update

    if (nextStatus === "completed") {
      setTimeout(() => navigate("/provider"), 1500);
    }
    setUpdating(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-100">
        <Loader size="lg" text="Loading job..." />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-100">
        <p className="text-ink-500">Job not found.</p>
      </div>
    );
  }

  const customerLoc = {
    latitude: request.location.coordinates[1],
    longitude: request.location.coordinates[0],
  };

  const action = STATUS_ACTIONS[request.status];

  return (
    <div className="min-h-screen bg-ink-100 px-4 py-8">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-xl2 shadow-sm p-6 mb-4">
          <p className="text-xs font-medium text-brand-500 uppercase tracking-wide mb-1">
            {request.status.replace("_", " ")}
          </p>
          <h2 className="font-semibold text-ink-900 text-lg mb-1">
            {request.subIssue}
          </h2>
          <p className="text-sm text-ink-500 mb-4">{request.vehicleType}</p>

          <div className="pt-4 border-t border-ink-100 flex items-center justify-between">
            <div>
              <p className="font-medium text-ink-900">
                {request.customer.name}
              </p>
              <p className="text-sm text-ink-500">{request.customer.phone}</p>
            </div>
            <a
              href={`tel:${request.customer.phone}`}
              className="px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600"
            >
              Call
            </a>
          </div>
        </div>

        <LeafletMap customerLocation={customerLoc} height="300px" />

        {action && request.status !== "completed" && (
          <Button
            variant="primary"
            className="w-full mt-4"
            loading={updating}
            onClick={handleUpdateStatus}
          >
            {action.label}
          </Button>
        )}

        {request.status === "completed" && (
          <div className="mt-4 text-center px-4 py-3 rounded-lg bg-success/10 text-success text-sm">
            Job completed — great work!
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveJob;
