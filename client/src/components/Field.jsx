import Input from './Input';

const Field = ({ label, error, className = '', ...inputProps }) => {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-medium text-ink-200">{label}</span>
      <Input {...inputProps} />
      {error && <span className="mt-1 block text-xs text-danger-400">{error}</span>}
    </label>
  );
};

export default Field;
