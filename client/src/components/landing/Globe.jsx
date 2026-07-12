import { useEffect, useRef } from 'react';

const POINT_COUNT = 760;

// unit vectors marking a handful of "operations hubs" feeding data into the
// score — the arcs converging on the front pole are the visual metaphor for
// "disconnected operations, unified into one live ESG score".
const HUBS = [
  [0.32, 0.52, 0.79],
  [-0.58, 0.24, 0.74],
  [0.68, -0.28, 0.63],
  [-0.42, -0.58, 0.55],
  [0.08, 0.82, -0.48],
  [-0.66, -0.12, -0.6],
].map(normalize);

function normalize([x, y, z]) {
  const len = Math.sqrt(x * x + y * y + z * z) || 1;
  return [x / len, y / len, z / len];
}

function fibonacciSphere(samples) {
  const points = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < samples; i++) {
    const y = 1 - (i / (samples - 1)) * 2;
    const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = goldenAngle * i;
    points.push([Math.cos(theta) * radiusAtY, y, Math.sin(theta) * radiusAtY]);
  }
  return points;
}

function rotateY([x, y, z], angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return [x * cos + z * sin, y, -x * sin + z * cos];
}

const depthAlpha = (z) => (z + 1) / 2;

const Globe = ({ className = '' }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const spherePoints = fibonacciSphere(POINT_COUNT);

    let size, radius, cx, cy, frameId;
    let angle = 0;

    const resize = () => {
      size = canvas.clientWidth;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      radius = size * 0.42;
      cx = size / 2;
      cy = size / 2;
    };
    resize();

    const draw = () => {
      angle += 0.0022;
      ctx.clearRect(0, 0, size, size);

      spherePoints.forEach((p) => {
        const [x, y, z] = rotateY(p, angle);
        if (z < -0.15) return;
        const depth = depthAlpha(z);
        const sx = cx + x * radius;
        const sy = cy + y * radius;
        const r = 0.6 + depth * 1.3;
        const alpha = 0.12 + depth * 0.55;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fillStyle =
          z > 0.55 ? `rgba(52,211,153,${alpha})` : `rgba(148,197,184,${alpha * 0.7})`;
        ctx.fill();
      });

      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(52,211,153,0.18)';
      ctx.lineWidth = 1;
      ctx.stroke();

      const front = { x: cx, y: cy - radius * 0.05 };
      const pulse = 0.5 + 0.5 * Math.sin(angle * 14);

      HUBS.forEach((v, i) => {
        const [x, y, z] = rotateY(v, angle + i);
        if (z < 0.05) return;
        const sx = cx + x * radius;
        const sy = cy + y * radius;

        const midX = (sx + front.x) / 2 + (sy - front.y) * 0.15;
        const midY = (sy + front.y) / 2 - (sx - front.x) * 0.15;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.quadraticCurveTo(midX, midY, front.x, front.y);
        ctx.strokeStyle = `rgba(56,189,248,${0.14 + depthAlpha(z) * 0.22})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(sx, sy, 2.2 + pulse * 1.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251,191,36,${0.5 + pulse * 0.4})`;
        ctx.fill();
      });

      frameId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => resize();
    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className={`block ${className}`} />;
};

export default Globe;
