import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

const STATUS_COLORS = {
  completed: 'bg-success/10 text-success',
  cancelled: 'bg-danger/10 text-danger',
  matched: 'bg-warning/10 text-warning',
  on_the_way: 'bg-warning/10 text-warning',
  arrived: 'bg-warning/10 text-warning',
  in_progress: 'bg-warning/10 text-warning',
};

const ACTIVE_STATUSES = ['matched', 'on_the_way', 'arrived', 'in_progress'];

const JobHistory = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data: profile } = await api.get('/providers/me');
        const { data: history } = await api.get('/requests/history', {
          params: { providerId: profile._id },
        });
        setJobs(history);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-100">
        <Loader size="lg" text="Loading job history..." />
      </div>
    );
  }

  const totalEarnings = jobs
    .filter((j) => j.payment?.status === 'paid')
    .reduce((sum, j) => sum + j.payment.amount, 0);

  return (
    <div className="min-h-screen bg-ink-100 px-4 py-8">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-ink-900 mb-1">Job history</h1>
        <p className="text-sm text-ink-500 mb-6">Total earned: ₹{totalEarnings}</p>

        {jobs.length === 0 ? (
          <EmptyState
            icon="🧰"
            title="No jobs yet"
            description="Completed jobs will show up here once you start accepting requests."
          />
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => {
              const isActive = ACTIVE_STATUSES.includes(job.status);
              return (
                <div
                  key={job._id}
                  onClick={() => isActive && navigate(`/provider/job/${job._id}`)}
                  className={`bg-white rounded-xl2 shadow-sm p-4 ${
                    isActive ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-ink-900">{job.subIssue}</p>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        STATUS_COLORS[job.status] || 'bg-ink-100 text-ink-500'
                      }`}
                    >
                      {job.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-ink-500">
                    {job.vehicleType} • {new Date(job.createdAt).toLocaleDateString()}
                  </p>
                  {isActive && (
                    <p className="text-xs text-brand-500 mt-1 font-medium">Tap to continue →</p>
                  )}
                  {job.rating?.stars && (
                    <p className="text-sm text-warning mt-1">{'⭐'.repeat(job.rating.stars)}</p>
                  )}
                  {job.payment?.status === 'paid' && (
                    <p className="text-sm text-ink-700 mt-1">Earned: ₹{job.payment.amount}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobHistory;