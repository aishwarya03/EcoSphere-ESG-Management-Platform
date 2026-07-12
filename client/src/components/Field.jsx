import { forwardRef } from 'react';
import Input from './Input';

const Field = forwardRef(({ label, error, className = '', ...inputProps }, ref) => {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-medium text-ink-200">{label}</span>
      <Input ref={ref} {...inputProps} />
      {error && <span className="mt-1 block text-xs text-danger-400">{error}</span>}
    </label>
  );
});

Field.displayName = 'Field';

export default Field;
