import { Link } from 'react-router-dom';
import Button from '../components/Button';

const NotFound = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 pt-16 text-center">
      <span className="text-sm font-semibold text-primary-400">404</span>
      <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-ink-50">
        Page not found
      </h1>
      <p className="mt-3 max-w-sm text-ink-400">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <Button as={Link} to="/" variant="primary" className="mt-8">
        Back to home
      </Button>
    </div>
  );
};

export default NotFound;
