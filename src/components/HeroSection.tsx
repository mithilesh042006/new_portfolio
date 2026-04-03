import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";
import "./HeroSection.css";

gsap.registerPlugin(ScrollTrigger);

export default function HeroSection() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // 1. Initialize Lenis
        const lenis = new Lenis({
            duration: 0.6,
            smoothWheel: true,
            syncTouch: true,
        });

        lenis.on("scroll", ScrollTrigger.update);

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);

        // 2. Setup Canvas
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext("2d");
        if (!context) return;

        const resizeCanvas = () => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            canvas.style.width = window.innerWidth + "px";
            canvas.style.height = window.innerHeight + "px";
            context.resetTransform();
            context.scale(dpr, dpr);
            render();
        };

        function drawImageProp(ctx: CanvasRenderingContext2D, img: HTMLImageElement, offsetX = 0.5, offsetY = 0.5) {
            const w = window.innerWidth;
            const h = window.innerHeight;
            let iw = img.width,
                ih = img.height,
                r = Math.min(w / iw, h / ih),
                nw = iw * r,
                nh = ih * r,
                cx, cy, cw, ch, ar = 1;

            if (nw < w) ar = w / nw;
            if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;
            nw *= ar;
            nh *= ar;

            cw = iw / (nw / w);
            ch = ih / (nh / h);
            cx = (iw - cw) * offsetX;
            cy = (ih - ch) * offsetY;

            if (cx < 0) cx = 0;
            if (cy < 0) cy = 0;
            if (cw > iw) cw = iw;
            if (ch > ih) ch = ih;

            ctx.clearRect(0, 0, w, h);
            ctx.drawImage(img, cx, cy, cw, ch, 0, 0, w, h);
        }

        // 3. Load all 240 frames from new_seq
        const FRAME_COUNT = 240;
        const images: HTMLImageElement[] = [];

        const pad = (number: number, length: number) => {
            let str = "" + number;
            while (str.length < length) str = "0" + str;
            return str;
        };

        for (let i = 1; i <= FRAME_COUNT; i++) {
            const img = new Image();
            img.src = `/new_seq/ezgif-frame-${pad(i, 3)}.jpg`;
            images.push(img);
        }

        let currentFrameIndex = 0;

        const render = () => {
            const img = images[currentFrameIndex];
            if (img && img.complete) {
                drawImageProp(context, img);
            } else if (img) {
                img.onload = render;
            }
        };

        window.addEventListener("resize", resizeCanvas);
        resizeCanvas();

        if (images[0].complete) {
            render();
        } else {
            images[0].onload = render;
        }

        // 4. GSAP Frame Scroll — map entire hero scroll to 0-239 frames
        const triggers: ScrollTrigger[] = [];

        const obj = { frame: 0 };
        const frameTween = gsap.to(obj, {
            frame: FRAME_COUNT - 1,
            snap: "frame",
            ease: "none",
            scrollTrigger: {
                trigger: "#hero-scroll-section",
                start: "top top",
                end: "bottom top",
                scrub: true,
                onUpdate: () => {
                    currentFrameIndex = Math.round(obj.frame);
                    render();
                },
            },
        });
        if (frameTween.scrollTrigger) triggers.push(frameTween.scrollTrigger);

        // 5. Text Fades — 3 text blocks across the scroll
        gsap.set("#text-1", { opacity: 1 });
        gsap.set("#text-2", { opacity: 0 });
        gsap.set("#text-3", { opacity: 0 });

        // Text 1: visible at the start, fades out at ~30%
        const t1 = ScrollTrigger.create({
            trigger: "#hero-scroll-section",
            start: "top top",
            end: "30% top",
            onEnter: () => gsap.to("#text-1", { opacity: 1, duration: 0.6 }),
            onLeave: () => gsap.to("#text-1", { opacity: 0, duration: 0.6 }),
            onEnterBack: () => gsap.to("#text-1", { opacity: 1, duration: 0.6 }),
        });
        triggers.push(t1);

        // Text 2: fades in at ~30%, fades out at ~65%
        const t2 = ScrollTrigger.create({
            trigger: "#hero-scroll-section",
            start: "28% top",
            end: "65% top",
            onEnter: () => gsap.to("#text-2", { opacity: 1, duration: 0.6 }),
            onLeave: () => gsap.to("#text-2", { opacity: 0, duration: 0.6 }),
            onEnterBack: () => gsap.to("#text-2", { opacity: 1, duration: 0.6 }),
            onLeaveBack: () => gsap.to("#text-2", { opacity: 0, duration: 0.6 }),
        });
        triggers.push(t2);

        // Text 3: fades in at ~63%, stays until end
        const t3 = ScrollTrigger.create({
            trigger: "#hero-scroll-section",
            start: "63% top",
            end: "bottom top",
            onEnter: () => gsap.to("#text-3", { opacity: 1, duration: 0.6 }),
            onLeave: () => gsap.to("#text-3", { opacity: 0, duration: 0.6 }),
            onEnterBack: () => gsap.to("#text-3", { opacity: 1, duration: 0.6 }),
            onLeaveBack: () => gsap.to("#text-3", { opacity: 0, duration: 0.6 }),
        });
        triggers.push(t3);

        // Cleanup
        return () => {
            window.removeEventListener("resize", resizeCanvas);
            lenis.destroy();
            triggers.forEach(t => t.kill());
            ScrollTrigger.getAll().forEach(t => t.kill());
        };
    }, []);

    return (
        <div ref={containerRef} className="hero-container">
            <div className="canvas-container relative h-[auto]">
                <canvas ref={canvasRef} id="hero-canvas"></canvas>
            </div>

            <div className="fixed-text-container">
                <div className="text-container fixed-text" id="text-1">
                    <h2>Hello!, I am Mithilesh</h2>
                    <p>Welcome to my portfolio. Scroll down to explore my journey and work.</p>
                </div>
                <div className="text-container fixed-text" id="text-2">
                    <h2>The Evolution</h2>
                    <p>Seamlessly transitioning into the next phase of innovation and sophisticated digital design.</p>
                </div>
                <div className="text-container fixed-text" id="text-3">
                    <h2>The Future</h2>
                    <p>Step into tomorrow with unmatched visual fidelity. The experience continues from here.</p>
                </div>
            </div>

            <main className="scroll-content">
                <section className="sequence-section" id="hero-scroll-section" style={{ height: '500vh' }}></section>
            </main>
        </div>
    );
}
