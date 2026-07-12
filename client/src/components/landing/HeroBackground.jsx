import ParticleField from './ParticleField';
import Globe from './Globe';

const HeroBackground = () => {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* glowing grid floor */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(56,189,248,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.07) 1px, transparent 1px)',
          backgroundSize: '46px 46px',
          maskImage:
            'radial-gradient(ellipse 75% 55% at 50% 25%, black, transparent 72%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 75% 55% at 50% 25%, black, transparent 72%)',
        }}
      />

      {/* ambient glow blobs */}
      <div className="absolute left-1/2 top-16 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-primary-500/20 blur-[130px]" />
      <div className="absolute right-10 top-40 h-[320px] w-[320px] rounded-full bg-blue-400/10 blur-[110px]" />

      {/* data globe — operations hubs feeding into one live ESG score */}
      <div className="absolute left-1/2 top-24 flex -translate-x-1/2 justify-center">
        <div
          className="relative h-95 w-95 md:h-110 md:w-110"
          style={{
            filter: 'drop-shadow(0 0 60px rgba(16,185,129,0.25))',
          }}
        >
          <Globe className="h-full w-full" />
        </div>
      </div>

      <ParticleField />
    </div>
  );
};

export default HeroBackground;
