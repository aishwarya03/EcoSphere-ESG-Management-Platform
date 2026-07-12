import { forwardRef } from 'react';

const Input = forwardRef(({ className = '', ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={`w-full rounded-lg border border-border-subtle bg-white/5 px-3 py-2 text-ink-50 outline-none placeholder:text-ink-600 transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 ${className}`}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export default Input;
