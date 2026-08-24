import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { useAuthStore } from '../../store/authStore';

const PaymentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [request, setRequest] = useState(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

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
  }, [id]);

  const handlePay = async () => {
    setError('');
    if (!amount || Number(amount) <= 0) {
      setError('Enter a valid amount');
      return;
    }

    setPaying(true);
    try {
      const { data } = await api.post('/payments/create-order', {
        requestId: id,
        amount: Number(amount),
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'RoadSathi',
        description: 'Roadside assistance payment',
        order_id: data.order.id,
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: { color: '#f2600c' },
        handler: async (response) => {
          try {
            await api.post('/payments/verify', {
              requestId: id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            navigate(`/customer/rate/${id}`);
          } catch (err) {
            setError('Payment verification failed');
          }
        },
        modal: {
          ondismiss: () => setPaying(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start payment');
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-100">
        <Loader size="lg" text="Loading..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-100 px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl2 shadow-sm p-6">
          <h1 className="text-xl font-bold text-ink-900 mb-1">Service completed</h1>
          <p className="text-ink-500 text-sm mb-6">
            {request?.subIssue} — pay your mechanic to close out the request.
          </p>

          <label className="block text-sm font-medium text-ink-700 mb-1">Amount (₹)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter agreed amount"
            className="w-full px-4 py-2.5 rounded-lg border border-ink-300 focus:outline-none focus:ring-2 focus:ring-brand-500 mb-4"
          />

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-danger/10 text-danger text-sm">
              {error}
            </div>
          )}

          <Button variant="primary" className="w-full" loading={paying} onClick={handlePay}>
            Pay Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;