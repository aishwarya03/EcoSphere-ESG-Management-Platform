import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, LayoutDashboard } from 'lucide-react';
import Button from '../Button';
import HeroBackground from './HeroBackground';
import ScoreGauge from './ScoreGauge';
import FloatingMetrics from './FloatingMetrics';
import { useAuth } from '../../context/useAuth';
import { useAuthCta } from '../../hooks/useAuthCta';

const Hero = () => {
  const { isAuthenticated } = useAuth();
  const cta = useAuthCta();

  return (
    <section
      id="top"
      className="relative flex min-h-screen flex-col justify-center overflow-hidden pt-28 pb-16"
    >
      <HeroBackground />

      <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center px-6 text-center">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass mb-6 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide text-primary-300"
        >
          ESG INTELLIGENCE PLATFORM
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-heading text-4xl font-bold leading-[1.1] tracking-tight text-ink-50 md:text-6xl"
        >
          EcoSphere
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-5 max-w-2xl text-lg text-ink-200 md:text-xl"
        >
          Transform your organization&apos;s sustainability journey with
          real-time Environmental, Social and Governance insights.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          {isAuthenticated ? (
            <Button as={Link} to={cta.to} size="lg" variant="primary">
              <LayoutDashboard size={18} /> {cta.label}
            </Button>
          ) : (
            <>
              <Button as={Link} to="/register" size="lg" variant="primary">
                Get Started <ArrowRight size={18} />
              </Button>
              <Button as={Link} to="/dashboard" size="lg" variant="secondary">
                <LayoutDashboard size={18} /> Explore Dashboard
              </Button>
            </>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-14 w-full max-w-2xl"
        >
          <ScoreGauge />
        </motion.div>

        <div className="mt-10 w-full">
          <FloatingMetrics />
        </div>
      </div>
    </section>
  );
};

export default Hero;
