import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Button from '../../components/common/Button';

const RatingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [stars, setStars] = useState(0);
  const [hoverStars, setHoverStars] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (stars === 0) {
      setError('Please select a star rating');
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/requests/${id}/rate`, { stars, comment });
      navigate('/customer');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-100 px-4 py-8 flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-xl2 shadow-sm p-8 text-center">
        <h1 className="text-xl font-bold text-ink-900 mb-1">How was your service?</h1>
        <p className="text-ink-500 text-sm mb-6">Your feedback helps other riders find good help.</p>

        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onMouseEnter={() => setHoverStars(n)}
              onMouseLeave={() => setHoverStars(0)}
              onClick={() => setStars(n)}
              className="text-4xl transition-transform hover:scale-110"
            >
              {(hoverStars || stars) >= n ? '⭐' : '☆'}
            </button>
          ))}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell us more (optional)"
          rows={3}
          className="w-full px-4 py-2.5 rounded-lg border border-ink-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm mb-4"
        />

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-danger/10 text-danger text-sm">
            {error}
          </div>
        )}

        <Button variant="primary" className="w-full" loading={submitting} onClick={handleSubmit}>
          Submit Rating
        </Button>

        <button
          onClick={() => navigate('/customer')}
          className="text-ink-500 text-sm mt-4 hover:underline"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
};

export default RatingPage;