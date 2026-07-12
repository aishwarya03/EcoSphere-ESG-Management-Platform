import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';

const AuthLayout = ({ children }) => {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-canvas px-6 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-primary-500/15 blur-[130px]"
      />

      <div className="relative w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500 text-canvas shadow-[0_0_20px_-2px_rgba(16,185,129,0.7)]">
            <Leaf size={18} strokeWidth={2.5} />
          </span>
          <span className="font-heading text-xl font-bold text-ink-50">EcoSphere</span>
        </Link>

        <div className="glass rounded-2xl p-8">{children}</div>
      </div>
    </div>
  );
};

export default AuthLayout;
