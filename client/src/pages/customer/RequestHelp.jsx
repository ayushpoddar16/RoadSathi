import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGeolocation } from '../../hooks/useGeolocation';
import LeafletMap from '../../components/map/LeafletMap';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import api from '../../api/axios';

const VEHICLE_TYPES = [
  { value: '2-wheeler', label: '2-Wheeler', icon: '🏍️' },
  { value: '3-wheeler', label: '3-Wheeler', icon: '🛺' },
  { value: '4-wheeler', label: '4-Wheeler', icon: '🚗' },
  { value: 'multi-wheeler', label: 'Multi-Wheeler', icon: '🚛' },
];

const ISSUE_CATEGORIES = {
  fuel: {
    label: 'Fuel / Charging',
    icon: '⛽',
    subIssues: ['Out of petrol/diesel', 'Out of CNG', 'EV battery drained'],
  },
  mechanical: {
    label: 'Mechanical Breakdown',
    icon: '🔧',
    subIssues: ['Engine not starting', 'Flat tyre / puncture', 'Brake failure', 'Battery dead', 'Overheating'],
  },
  electrical: {
    label: 'Electrical Issue',
    icon: '⚡',
    subIssues: ['Lights not working', 'Horn/indicator issue', 'Wiring/short circuit', 'Dashboard warning light'],
  },
  towing: {
    label: 'Accident / Towing',
    icon: '🚨',
    subIssues: ['Vehicle stuck', 'Accident — needs towing', "Vehicle won't move"],
  },
  service: {
    label: 'General Service',
    icon: '🛠️',
    subIssues: ['Regular servicing', 'Oil change', 'Minor repair'],
  },
};

const RequestHelp = () => {
  const navigate = useNavigate();
  const { location, error: geoError, loading: geoLoading, getCurrentLocation } = useGeolocation();

  const [step, setStep] = useState(1); // 1: vehicle, 2: issue, 3: confirm
  const [vehicleType, setVehicleType] = useState('');
  const [issueCategory, setIssueCategory] = useState('');
  const [subIssue, setSubIssue] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  const handleSubmit = async () => {
    setSubmitError('');
    setSubmitting(true);
    try {
      const { data } = await api.post('/requests', {
        vehicleType,
        issueCategory,
        subIssue,
        note,
        latitude: location.latitude,
        longitude: location.longitude,
      });
      navigate(`/customer/tracking/${data.request._id}`);
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to create request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-100 px-4 py-8">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-ink-900 mb-1">Get roadside help</h1>
        <p className="text-ink-500 text-sm mb-6">Tell us what's wrong — we'll find help nearby.</p>

        {/* Step indicator */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full ${s <= step ? 'bg-brand-500' : 'bg-ink-300'}`}
            />
          ))}
        </div>

        <div className="bg-white rounded-xl2 shadow-sm p-6">
          {/* STEP 1: Vehicle type */}
          {step === 1 && (
            <div>
              <h2 className="font-semibold text-ink-900 mb-4">Which vehicle needs help?</h2>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {VEHICLE_TYPES.map((v) => (
                  <button
                    key={v.value}
                    onClick={() => setVehicleType(v.value)}
                    className={`p-4 rounded-lg border text-center transition-colors ${
                      vehicleType === v.value
                        ? 'bg-brand-50 border-brand-500'
                        : 'border-ink-300 hover:border-brand-400'
                    }`}
                  >
                    <div className="text-2xl mb-1">{v.icon}</div>
                    <div className="text-sm font-medium text-ink-700">{v.label}</div>
                  </button>
                ))}
              </div>
              <Button
                variant="primary"
                className="w-full"
                disabled={!vehicleType}
                onClick={() => setStep(2)}
              >
                Continue
              </Button>
            </div>
          )}

          {/* STEP 2: Issue category + sub-issue */}
          {step === 2 && (
            <div>
              <h2 className="font-semibold text-ink-900 mb-4">What's the problem?</h2>
              <div className="space-y-2 mb-4">
                {Object.entries(ISSUE_CATEGORIES).map(([key, cat]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setIssueCategory(key);
                      setSubIssue('');
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                      issueCategory === key
                        ? 'bg-brand-50 border-brand-500'
                        : 'border-ink-300 hover:border-brand-400'
                    }`}
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <span className="text-sm font-medium text-ink-700">{cat.label}</span>
                  </button>
                ))}
              </div>

              {issueCategory && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-ink-700 mb-2">
                    Choose the specific issue
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ISSUE_CATEGORIES[issueCategory].subIssues.map((sub) => (
                      <button
                        key={sub}
                        onClick={() => setSubIssue(sub)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          subIssue === sub
                            ? 'bg-brand-500 text-white border-brand-500'
                            : 'border-ink-300 text-ink-700 hover:border-brand-400'
                        }`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  disabled={!issueCategory || !subIssue}
                  onClick={() => setStep(3)}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Confirm location + submit */}
          {step === 3 && (
            <div>
              <h2 className="font-semibold text-ink-900 mb-4">Confirm your location</h2>

              {geoLoading && <Loader text="Getting your location..." />}
              {geoError && (
                <div className="mb-4 px-4 py-3 rounded-lg bg-danger/10 text-danger text-sm">
                  {geoError}. Please enable location access and try again.
                </div>
              )}

              {location && (
                <>
                  <LeafletMap customerLocation={location} height="240px" />

                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add any extra details (optional)"
                    rows={3}
                    className="w-full mt-4 px-4 py-2.5 rounded-lg border border-ink-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />

                  {submitError && (
                    <div className="mt-3 px-4 py-3 rounded-lg bg-danger/10 text-danger text-sm">
                      {submitError}
                    </div>
                  )}

                  <div className="flex gap-3 mt-4">
                    <Button variant="secondary" className="flex-1" onClick={() => setStep(2)}>
                      Back
                    </Button>
                    <Button
                      variant="primary"
                      className="flex-1"
                      loading={submitting}
                      onClick={handleSubmit}
                    >
                      Request Help
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestHelp;