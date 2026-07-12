import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf } from 'lucide-react';
import Button from '../Button';

const words = ['Measure.', 'Improve.', 'Sustain.'];

const Footer = () => {
  return (
    <footer className="relative overflow-hidden border-t border-border-subtle px-6 pt-28 pb-10">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-primary-500/15 blur-[120px]"
      />

      <div className="relative mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
        >
          <Button as={Link} to="/register" size="lg" variant="primary">
            Get Started <ArrowRight size={18} />
          </Button>
        </motion.div>

        <div className="mt-14 flex flex-wrap justify-center gap-x-6">
          {words.map((word, i) => (
            <motion.span
              key={word}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="font-heading text-5xl font-bold tracking-tight text-ink-50 md:text-7xl"
            >
              {word}
            </motion.span>
          ))}
        </div>

        <div className="mt-20 flex flex-col items-center justify-between gap-4 border-t border-border-subtle pt-8 text-sm text-ink-400 md:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary-500 text-canvas">
              <Leaf size={14} strokeWidth={2.5} />
            </span>
            <span className="font-semibold text-ink-200">EcoSphere</span>
          </div>
          <p>&copy; {new Date().getFullYear()} EcoSphere. Built for the Odoo Hackathon.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
