import { forwardRef } from 'react';
import Select from './Select';

const SelectField = forwardRef(({ label, error, className = '', children, ...selectProps }, ref) => {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-medium text-ink-200">{label}</span>
      <Select ref={ref} {...selectProps}>
        {children}
      </Select>
      {error && <span className="mt-1 block text-xs text-danger-400">{error}</span>}
    </label>
  );
});

SelectField.displayName = 'SelectField';

export default SelectField;
