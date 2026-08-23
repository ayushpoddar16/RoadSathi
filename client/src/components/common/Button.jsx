const Button = ({
  children,
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const base = 'py-2.5 px-5 rounded-lg font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-brand-500 text-white hover:bg-brand-600',
    secondary: 'bg-white text-ink-700 border border-ink-300 hover:border-brand-400',
    danger: 'bg-danger text-white hover:opacity-90',
    ghost: 'text-ink-700 hover:bg-ink-100',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? 'Please wait...' : children}
    </button>
  );
};

export default Button;