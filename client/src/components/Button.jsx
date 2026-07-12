const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  as: Component = 'button',
  className = '',
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 cursor-pointer active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none';

  const variants = {
    primary:
      'bg-primary-500 text-canvas shadow-[0_0_24px_-4px_rgba(16,185,129,0.6)] hover:bg-primary-400 hover:shadow-[0_0_32px_-4px_rgba(16,185,129,0.75)]',
    secondary:
      'border border-border-strong bg-white/5 text-ink-50 hover:bg-white/10',
    accent:
      'bg-accent-500 text-canvas shadow-sm hover:bg-accent-400',
    danger:
      'bg-danger-500 text-white shadow-sm hover:bg-danger-400',
    ghost:
      'text-ink-200 hover:bg-white/5 hover:text-ink-50',
    light:
      'bg-white text-primary-700 shadow-sm hover:bg-primary-50',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  };

  const buttonVariant = variants[variant] ?? variants.primary;
  const buttonSize = sizes[size] ?? sizes.md;

  return (
    <Component
      type={Component === 'button' ? type : undefined}
      className={`${baseClasses} ${buttonVariant} ${buttonSize} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Button;
