const Input = ({ label, error, className = '', ...props }) => {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-ink-700 mb-1">{label}</label>
      )}
      <input
        className={`w-full px-4 py-2.5 rounded-lg border ${
          error ? 'border-danger' : 'border-ink-300'
        } focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent ${className}`}
        {...props}
      />
      {error && <p className="text-danger text-xs mt-1">{error}</p>}
    </div>
  );
};

export default Input;