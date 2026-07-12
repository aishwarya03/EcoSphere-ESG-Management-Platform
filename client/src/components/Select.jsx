import { forwardRef } from 'react';

const Select = forwardRef(({ className = '', children, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={`w-full rounded-lg border border-border-subtle bg-white/5 px-3 py-2 text-ink-50 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
});

Select.displayName = 'Select';

export default Select;
