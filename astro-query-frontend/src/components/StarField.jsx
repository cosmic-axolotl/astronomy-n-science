import { useEffect, useRef } from 'react';

export default function StarField() {
    const ref = useRef(null);

    useEffect(() => {
        const c = ref.current;
        if (!c) return;
        const ctx = c.getContext('2d');
        c.width = window.innerWidth;
        c.height = window.innerHeight;

        const stars = Array.from({ length: 220 }, () => ({
            x: Math.random() * c.width,
            y: Math.random() * c.height,
            r: Math.random() * 1.4 + 0.2,
            o: Math.random() * 0.6 + 0.2,
            t: Math.random() * Math.PI * 2,
            s: Math.random() * 0.03 + 0.01,
        }));

        let id;
        const draw = () => {
            ctx.clearRect(0, 0, c.width, c.height);
            stars.forEach(s => {
                s.t += s.s;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(190,215,255,${s.o * (0.5 + 0.5 * Math.sin(s.t))})`;
                ctx.fill();
            });
            id = requestAnimationFrame(draw);
        };
        draw();
        return () => cancelAnimationFrame(id);
    }, []);

    return (
        <canvas ref={ref} style={{
            position: 'fixed', inset: 0,
            width: '100%', height: '100%',
            pointerEvents: 'none', zIndex: 0,
        }} />
    );
}