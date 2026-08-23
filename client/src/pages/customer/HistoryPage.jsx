import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

const STATUS_COLORS = {
  completed: 'bg-success/10 text-success',
  cancelled: 'bg-danger/10 text-danger',
  pending: 'bg-warning/10 text-warning',
};

const HistoryPage = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get('/requests/history');
        setRequests(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleDelete = async (e, requestId) => {
  e.stopPropagation();
  try {
    await api.delete(`/requests/${requestId}`);
    setRequests((prev) => prev.filter((r) => r._id !== requestId));
  } catch (err) {
    console.error(err.response?.data?.message || 'Failed to delete');
  }
};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-100">
        <Loader size="lg" text="Loading history..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-100 px-4 py-8">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-ink-900 mb-6">Your requests</h1>

        {requests.length === 0 ? (
          <EmptyState
            icon="🛣️"
            title="No requests yet"
            description="Once you request help, it'll show up here."
          />
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <div
                key={req._id}
                onClick={() => navigate(`/customer/tracking/${req._id}`)}
                className="w-full text-left bg-white rounded-xl2 shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-ink-900">{req.subIssue}</p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        STATUS_COLORS[req.status] || 'bg-ink-100 text-ink-500'
                      }`}
                    >
                      {req.status.replace('_', ' ')}
                    </span>
                    <button
                      onClick={(e) => handleDelete(e, req._id)}
                      className="text-danger text-xs hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="text-sm text-ink-500">
                  {req.vehicleType} • {new Date(req.createdAt).toLocaleDateString()}
                </p>
                {req.payment?.status === 'paid' && (
                  <p className="text-sm text-ink-700 mt-1">Paid: ₹{req.payment.amount}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;