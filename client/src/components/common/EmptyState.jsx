const EmptyState = ({ title, description, icon }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && <div className="text-4xl mb-3">{icon}</div>}
      <h3 className="text-ink-900 font-semibold mb-1">{title}</h3>
      {description && <p className="text-ink-500 text-sm max-w-xs">{description}</p>}
    </div>
  );
};

export default EmptyState;