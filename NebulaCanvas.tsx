import React, { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useMetacosmState } from '../context';

const NebulaCanvas = () => {
    const { options } = useMetacosmState();
    const { particleEffects, quality } = options.graphics;
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameId = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let w = 0, h = 0;
        let particles: Particle[] = [];

        const qualitySettings = {
            'Low': { particleCount: 50, particleSpeed: 0.07, particleSize: 1.5 },
            'Medium': { particleCount: 120, particleSpeed: 0.09, particleSize: 1.7 },
            'High': { particleCount: 200, particleSpeed: 0.1, particleSize: 2.0 },
        };

        const properties = {
            ...qualitySettings[quality],
            particleLife: 400,
            bgColor: 'rgba(10, 20, 40, 0.018)',
            particleColor: 'rgba(255, 220, 180, 0.34)',
        };

        class Particle {
            x!: number; y!: number;
            velocityX!: number; velocityY!: number;
            life!: number; hue!: number;

            constructor() { this._init(); }

            _init() {
                this.x = Math.random() * w;
                this.y = Math.random() * h;
                this.velocityX = (Math.random() - 0.5) * properties.particleSpeed * w / 1500;
                this.velocityY = (Math.random() - 0.5) * properties.particleSpeed * h / 1500;
                this.life = Math.random() * properties.particleLife * (30 + Math.random() * 32);
                this.hue = Math.floor(Math.random() * 60) + 30;
            }

            update() {
                this.x += this.velocityX;
                this.y += this.velocityY;
                if (this.x <= 0 || this.x >= w) this.velocityX *= -1;
                if (this.y <= 0 || this.y >= h) this.velocityY *= -1;
                if (--this.life < 1) this._init();
            }

            render(ctx: CanvasRenderingContext2D) {
                ctx.save();
                ctx.globalAlpha = 0.55 + 0.25 * Math.sin(this.life / 43);
                const grad = ctx.createRadialGradient(this.x, this.y, 0.7, this.x, this.y, properties.particleSize * 2.8);
                grad.addColorStop(0, `hsla(${this.hue},80%,85%,0.63)`);
                grad.addColorStop(0.8, properties.particleColor);
                grad.addColorStop(1, 'rgba(10,20,40,0)');
                ctx.beginPath();
                ctx.arc(this.x, this.y, properties.particleSize * (0.8 + Math.abs(Math.sin(this.life / 28)) / 2), 0, Math.PI * 2);
                ctx.fillStyle = grad;
                ctx.shadowColor = 'rgba(255,240,222,0.04)';
                ctx.shadowBlur = 5;
                ctx.fill();
                ctx.restore();
            }
        }

        const resize = () => {
            w = canvas.width = window.innerWidth * (window.devicePixelRatio || 1);
            h = canvas.height = window.innerHeight * (window.devicePixelRatio || 1);
            canvas.style.width = window.innerWidth + "px";
            canvas.style.height = window.innerHeight + "px";
        };
        
        const spawnParticles = () => {
            particles = [];
            if (particleEffects) {
                for (let i = 0; i < properties.particleCount; i++) {
                    particles.push(new Particle());
                }
            }
        };

        const animate = () => {
            ctx.fillStyle = properties.bgColor;
            ctx.globalAlpha = 0.84;
            ctx.fillRect(0, 0, w, h);
            particles.forEach(p => { p.update(); p.render(ctx); });
            animationFrameId.current = requestAnimationFrame(animate);
        };
        
        const startAnimation = () => {
            resize();
            spawnParticles();
            if(particleEffects) {
                animate();
            } else {
                ctx.clearRect(0, 0, w, h);
            }
        };
        
        const stopAnimation = () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };

        startAnimation();
        window.addEventListener('resize', startAnimation);

        return () => {
            stopAnimation();
            window.removeEventListener('resize', startAnimation);
        };
    }, [particleEffects, quality]);

    const container = document.getElementById('nebula-container');
    if (!container) return null;
    
    return createPortal(
        <canvas ref={canvasRef} id="nebula-canvas-component" aria-hidden="true" style={{
            position: 'fixed',
            inset: 0,
            width: '100vw',
            height: '100vh',
            zIndex: -2,
            opacity: 0.67,
            mixBlendMode: 'lighten',
            pointerEvents: 'none',
            transition: 'opacity 0.4s',
        }} />,
        container
    );
};

export default NebulaCanvas;
