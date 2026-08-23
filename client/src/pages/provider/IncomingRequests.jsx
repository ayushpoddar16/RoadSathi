import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { connectSocket, getSocket } from '../../lib/socket';
import RequestCard from '../../components/provider/RequestCard';
import EmptyState from '../../components/common/EmptyState';

const IncomingRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [acceptingId, setAcceptingId] = useState(null);

  useEffect(() => {
    let socket = getSocket();
    if (!socket) socket = connectSocket();

    socket.on('new-request', (payload) => {
      setRequests((prev) => {
        if (prev.some((r) => r.requestId === payload.requestId)) return prev;
        return [payload, ...prev];
      });
    });

    socket.on('request-taken', ({ requestId }) => {
      setRequests((prev) => prev.filter((r) => r.requestId !== requestId));
    });

    socket.on('request-already-taken', ({ requestId }) => {
      setAcceptingId(null);
      setRequests((prev) => prev.filter((r) => r.requestId !== requestId));
    });

    socket.on('request-matched', (payload) => {
      // This provider's own acceptance was confirmed
      navigate(`/provider/job/${payload.requestId}`);
    });

    return () => {
      socket.off('new-request');
      socket.off('request-taken');
      socket.off('request-already-taken');
      socket.off('request-matched');
    };
  }, [navigate]);

  const handleAccept = (requestId) => {
    setAcceptingId(requestId);
    const socket = getSocket();
    socket.emit('accept-request', { requestId });
  };

  return (
    <div className="min-h-screen bg-ink-100 px-4 py-8">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-ink-900 mb-1">Nearby requests</h1>
        <p className="text-sm text-ink-500 mb-6">
          You'll see new requests here in real time while you're online.
        </p>

        {requests.length === 0 ? (
          <EmptyState
            icon="📡"
            title="No requests right now"
            description="Stay online — new requests near you will show up here instantly."
          />
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <RequestCard
                key={req.requestId}
                request={req}
                onAccept={handleAccept}
                accepting={acceptingId === req.requestId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default IncomingRequests;