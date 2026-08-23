import Button from '../common/Button';

const ISSUE_ICONS = {
  fuel: '⛽',
  mechanical: '🔧',
  electrical: '⚡',
  towing: '🚨',
  service: '🛠️',
};

const RequestCard = ({ request, onAccept, accepting }) => {
  return (
    <div className="bg-white rounded-xl2 shadow-sm p-5 border border-ink-100">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{ISSUE_ICONS[request.issueCategory]}</span>
          <div>
            <p className="font-semibold text-ink-900">{request.subIssue}</p>
            <p className="text-xs text-ink-500 capitalize">{request.vehicleType}</p>
            {request.note && (
              <p className="text-xs text-ink-500 mt-1 ">"{request.note}"</p>
            )}
          </div>
        </div>
        <span className="text-xs text-ink-500">
          {new Date(request.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <Button
        variant="primary"
        className="w-full"
        loading={accepting}
        onClick={() => onAccept(request.requestId)}
      >
        Accept Request
      </Button>
    </div>
  );
};

export default RequestCard;