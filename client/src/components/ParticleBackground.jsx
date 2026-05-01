import { useEffect, useRef } from 'react';

const ParticleBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;
    let mouse = { x: -1000, y: -1000 };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Stars
    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      opacity: Math.random() * 0.4 + 0.2,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinklePhase: Math.random() * Math.PI * 2,
    }));

    // Particles
    const particles = Array.from({ length: 45 }, () => {
      const depth = Math.random(); // 0 = far, 1 = near
      const size = 4 + depth * 28 + Math.random() * 8;
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.2 - 0.1,
        size,
        depth,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.008,
        hue: Math.random() * 30 + 250, // subtle purple-blue range
        saturation: 15 + Math.random() * 20,
        lightness: 75 + Math.random() * 15,
        opacity: 0.08 + depth * 0.25,
      };
    });

    // Planets
    const planetColors = [
      { r: 196, g: 123, b: 142, name: 'rose' },     // dusty rose
      { r: 91, g: 154, b: 166, name: 'teal' },       // muted teal
      { r: 212, g: 165, b: 116, name: 'sand' },      // warm sand
      { r: 142, g: 130, b: 176, name: 'lavender' },   // soft lavender
    ];

    const planets = planetColors.map((color, i) => ({
      x: (canvas.width * (0.15 + Math.random() * 0.7)),
      y: (canvas.height * (0.15 + Math.random() * 0.7)),
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.12,
      size: 30 + Math.random() * 25,
      depth: 0.6 + Math.random() * 0.4,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.003,
      color,
    }));

    // Ambient light sources
    const lights = [
      { x: 0.2, y: 0.3, intensity: 0.6, hue: 280 },
      { x: 0.8, y: 0.2, intensity: 0.4, hue: 200 },
      { x: 0.5, y: 0.8, intensity: 0.3, hue: 320 },
    ];

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const drawVignette = () => {
      const grd = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, canvas.height * 0.3,
        canvas.width / 2, canvas.height / 2, canvas.height * 0.9
      );
      grd.addColorStop(0, 'rgba(0,0,0,0)');
      grd.addColorStop(1, 'rgba(0,0,0,0.4)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const getLighting = (x, y) => {
      let total = 0;
      lights.forEach(l => {
        const dx = x / canvas.width - l.x;
        const dy = y / canvas.height - l.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        total += l.intensity / (1 + dist * 3);
      });
      return Math.min(total, 1);
    };

    const repelFromMouse = (obj) => {
      const dx = obj.x - mouse.x;
      const dy = obj.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const repelRadius = 120 + obj.size;
      if (dist < repelRadius && dist > 0) {
        const force = (1 - dist / repelRadius) * 0.8 * obj.depth;
        obj.vx += (dx / dist) * force;
        obj.vy += (dy / dist) * force;
      }
    };

    const wrapPosition = (obj) => {
      if (obj.x < -obj.size) obj.x = canvas.width + obj.size;
      if (obj.x > canvas.width + obj.size) obj.x = -obj.size;
      if (obj.y < -obj.size) obj.y = canvas.height + obj.size;
      if (obj.y > canvas.height + obj.size) obj.y = -obj.size;
    };

    let time = 0;
    const animate = () => {
      time += 0.016;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Stars
      stars.forEach(s => {
        const twinkle = Math.sin(time * s.twinkleSpeed * 60 + s.twinklePhase) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232, 223, 245, ${s.opacity * twinkle})`;
        ctx.fill();
      });

      // Particles (sorted by depth — far first)
      const sorted = [...particles].sort((a, b) => a.depth - b.depth);
      sorted.forEach(p => {
        repelFromMouse(p);
        p.vx *= 0.995;
        p.vy *= 0.995;
        p.x += p.vx * (0.3 + p.depth * 0.7); // parallax
        p.y += p.vy * (0.3 + p.depth * 0.7);
        p.rotation += p.rotationSpeed;
        wrapPosition(p);

        const lit = getLighting(p.x, p.y);
        const adjustedL = p.lightness * (0.6 + lit * 0.4);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;

        // Shadow
        const shadowBlur = p.size * 0.4;
        ctx.shadowColor = `hsla(${p.hue}, ${p.saturation}%, 30%, 0.3)`;
        ctx.shadowBlur = shadowBlur;
        ctx.shadowOffsetY = p.size * 0.15;

        // Gradient fill
        const grd = ctx.createRadialGradient(
          -p.size * 0.2, -p.size * 0.2, 0,
          0, 0, p.size
        );
        grd.addColorStop(0, `hsla(${p.hue}, ${p.saturation + 5}%, ${adjustedL + 10}%, 0.9)`);
        grd.addColorStop(0.6, `hsla(${p.hue}, ${p.saturation}%, ${adjustedL}%, 0.7)`);
        grd.addColorStop(1, `hsla(${p.hue}, ${p.saturation - 5}%, ${adjustedL - 15}%, 0.3)`);

        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        ctx.restore();
      });

      // Planets
      planets.forEach(p => {
        repelFromMouse(p);
        p.vx *= 0.992;
        p.vy *= 0.992;
        p.x += p.vx * (0.3 + p.depth * 0.7);
        p.y += p.vy * (0.3 + p.depth * 0.7);
        p.rotation += p.rotationSpeed;
        wrapPosition(p);

        const lit = getLighting(p.x, p.y);
        const { r, g, b } = p.color;
        const lr = Math.round(r * (0.5 + lit * 0.5));
        const lg = Math.round(g * (0.5 + lit * 0.5));
        const lb = Math.round(b * (0.5 + lit * 0.5));

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        // Planet shadow
        ctx.shadowColor = `rgba(${r * 0.3}, ${g * 0.3}, ${b * 0.3}, 0.4)`;
        ctx.shadowBlur = p.size * 0.6;
        ctx.shadowOffsetY = p.size * 0.2;

        // Planet gradient (3D-ish)
        const grd = ctx.createRadialGradient(
          -p.size * 0.25, -p.size * 0.25, p.size * 0.1,
          0, 0, p.size
        );
        grd.addColorStop(0, `rgba(${Math.min(lr + 50, 255)}, ${Math.min(lg + 50, 255)}, ${Math.min(lb + 50, 255)}, 0.85)`);
        grd.addColorStop(0.5, `rgba(${lr}, ${lg}, ${lb}, 0.75)`);
        grd.addColorStop(1, `rgba(${lr * 0.5}, ${lg * 0.5}, ${lb * 0.5}, 0.5)`);

        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // Surface texture (subtle noise rings)
        ctx.globalAlpha = 0.08;
        for (let i = 0; i < 3; i++) {
          const offset = (i - 1) * p.size * 0.25;
          ctx.beginPath();
          ctx.ellipse(0, offset, p.size * 0.9, p.size * 0.15, 0, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255,255,255,0.3)`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        ctx.restore();
      });

      drawVignette();
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
};

export default ParticleBackground;
