const Spinner = ({ className = '' }) => (
  <div
    className={`h-6 w-6 animate-spin rounded-full border-2 border-white/15 border-t-primary-400 ${className}`}
  />
);

export default Spinner;
