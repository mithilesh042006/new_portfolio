import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { ArrowUpRight, Github, Linkedin } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const NAME = "Mithilesh";
const ROLES = ["App Developer", "Backend Developer", "AI Engineer"];
const BIO =
    "I craft high-performance digital experiences at the intersection of design and code — blending immersive animations, elegant interfaces, and cutting-edge web technology.";

export default function SecondHero() {
    const sectionRef = useRef<HTMLElement>(null);
    const imageWrapRef = useRef<HTMLDivElement>(null);
    const revealLayerRef = useRef<HTMLDivElement>(null);
    const nameSplitRef = useRef<HTMLHeadingElement>(null);
    const roleCycleRef = useRef<HTMLSpanElement>(null);
    const bioRef = useRef<HTMLParagraphElement>(null);
    const linksRef = useRef<HTMLDivElement>(null);
    const roleIndex = useRef(0);    /* ─── Liquid blob clip-path reveal ─── */
    useEffect(() => {
        const imageWrap = imageWrapRef.current;
        const revealLayer = revealLayerRef.current;
        if (!imageWrap || !revealLayer) return;

        // ── State ──────────────────────────────────────
        let animFrame: number;
        let mouseX = 0.5, mouseY = 0.5;   // normalized 0–1
        let currentX = 0.5, currentY = 0.5;
        let currentRadius = 0;
        let targetRadius = 0;
        let time = 0;

        const NUM_POINTS = 10;             // blob vertices
        const NOISE_AMP = 22;              // px of edge wiggle

        // ── Helpers ────────────────────────────────────
        const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

        /** Generate blob points around (cx,cy) at radius with sinusoidal noise */
        function blobPoints(cx: number, cy: number, radius: number, t: number) {
            const pts: { x: number; y: number }[] = [];
            for (let i = 0; i < NUM_POINTS; i++) {
                const angle = (i / NUM_POINTS) * Math.PI * 2;
                // Two overlapping sine waves per point → organic, non-repeating feel
                const wobble =
                    Math.sin(t * 2.1 + i * 1.37) * NOISE_AMP +
                    Math.sin(t * 1.3 + i * 2.71) * NOISE_AMP * 0.45 +
                    Math.sin(t * 0.7 + i * 0.94) * NOISE_AMP * 0.2;
                const r = Math.max(0, radius + wobble);
                pts.push({
                    x: cx + Math.cos(angle) * r,
                    y: cy + Math.sin(angle) * r,
                });
            }
            return pts;
        }

        /** Convert ordered points to a closed smooth path via catmull-rom → cubic bezier */
        function catmullRomPath(pts: { x: number; y: number }[]): string {
            const n = pts.length;
            const f = (v: number) => v.toFixed(2);
            let d = `M ${f(pts[0].x)} ${f(pts[0].y)}`;
            for (let i = 0; i < n; i++) {
                const p0 = pts[(i - 1 + n) % n];
                const p1 = pts[i];
                const p2 = pts[(i + 1) % n];
                const p3 = pts[(i + 2) % n];
                // catmull-rom tension = 1/6
                const cp1x = p1.x + (p2.x - p0.x) / 6;
                const cp1y = p1.y + (p2.y - p0.y) / 6;
                const cp2x = p2.x - (p3.x - p1.x) / 6;
                const cp2y = p2.y - (p3.y - p1.y) / 6;
                d += ` C ${f(cp1x)} ${f(cp1y)}, ${f(cp2x)} ${f(cp2y)}, ${f(p2.x)} ${f(p2.y)}`;
            }
            return d + " Z";
        }

        // ── rAF loop ───────────────────────────────────
        const tick = (timestamp: number) => {
            time = timestamp / 1000;

            // Lazy dimensions (re-read each frame — handles resize)
            const w = imageWrap.offsetWidth;
            const h = imageWrap.offsetHeight;
            const maxRadius = Math.min(w, h) * 0.88; // spotlight radius

            // Lerp cursor follower (slightly sluggish for organic feel)
            currentX = lerp(currentX, mouseX, 0.07);
            currentY = lerp(currentY, mouseY, 0.07);
            // Lerp radius (slower = blobby expand/contract)
            currentRadius = lerp(currentRadius, targetRadius * maxRadius, 0.065);

            const cx = currentX * w;
            const cy = currentY * h;

            if (currentRadius < 1) {
                // Fully hidden — avoid rendering noise when off
                revealLayer.style.clipPath = "circle(0px at 50% 50%)";
            } else {
                const pts = blobPoints(cx, cy, currentRadius, time);
                const path = catmullRomPath(pts);
                revealLayer.style.clipPath = `path('${path}')`;
            }

            animFrame = requestAnimationFrame(tick);
        };
        animFrame = requestAnimationFrame(tick);

        // ── Mouse events ───────────────────────────────
        const onMouseMove = (e: MouseEvent) => {
            const rect = imageWrap.getBoundingClientRect();
            mouseX = (e.clientX - rect.left) / rect.width;
            mouseY = (e.clientY - rect.top) / rect.height;
        };

        const onMouseEnter = () => {
            targetRadius = 1; // 1 × maxRadius (computed per-frame)
        };

        const onMouseLeave = () => {
            targetRadius = 0;
        };

        imageWrap.addEventListener("mousemove", onMouseMove);
        imageWrap.addEventListener("mouseenter", onMouseEnter);
        imageWrap.addEventListener("mouseleave", onMouseLeave);

        return () => {
            cancelAnimationFrame(animFrame);
            imageWrap.removeEventListener("mousemove", onMouseMove);
            imageWrap.removeEventListener("mouseenter", onMouseEnter);
            imageWrap.removeEventListener("mouseleave", onMouseLeave);
        };
    }, []);

    /* ─── Role cycling animation ─── */
    useEffect(() => {
        const el = roleCycleRef.current;
        if (!el) return;

        el.textContent = ROLES[0];

        const cycle = () => {
            gsap.to(el, {
                opacity: 0,
                y: -20,
                duration: 0.4,
                ease: "power2.in",
                onComplete: () => {
                    roleIndex.current = (roleIndex.current + 1) % ROLES.length;
                    el.textContent = ROLES[roleIndex.current];
                    gsap.fromTo(
                        el,
                        { opacity: 0, y: 20 },
                        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
                    );
                },
            });
        };

        const interval = setInterval(cycle, 2500);
        return () => clearInterval(interval);
    }, []);

    /* ─── Split-character name animation on scroll ─── */
    useEffect(() => {
        const heading = nameSplitRef.current;
        if (!heading) return;

        // Split letters
        const text = heading.textContent ?? "";
        heading.innerHTML = text
            .split("")
            .map((ch) =>
                ch === " "
                    ? `<span class="inline-block">&nbsp;</span>`
                    : `<span class="inline-block overflow-hidden"><span class="letter inline-block">${ch}</span></span>`
            )
            .join("");

        const letters = heading.querySelectorAll(".letter");

        const ctx = gsap.context(() => {
            gsap.fromTo(
                letters,
                { y: "100%", opacity: 0 },
                {
                    y: "0%",
                    opacity: 1,
                    duration: 1,
                    stagger: 0.05,
                    ease: "power4.out",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 80%",
                    },
                }
            );

            gsap.fromTo(
                bioRef.current,
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    delay: 0.4,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 75%",
                    },
                }
            );

            gsap.fromTo(
                linksRef.current,
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    delay: 0.6,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 75%",
                    },
                }
            );
        });

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="relative w-full min-h-screen bg-black text-white flex items-center overflow-hidden z-30 border-t border-gray-900"
        >
            {/* Subtle grid background */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage:
                        "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
                    backgroundSize: "60px 60px",
                }}
            />

            <div className="relative w-full px-6 md:px-12 lg:px-24 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

                {/* ── LEFT: Text Content ── */}
                <div className="flex flex-col justify-center order-2 lg:order-1">

                    {/* Tag */}
                    <p className="text-gray-500 uppercase tracking-[0.3em] text-xs font-semibold mb-6 flex items-center gap-3">
                        <span className="w-8 h-px bg-gray-700" />
                        About Me
                    </p>

                    {/* Name (split chars) */}
                    <h2
                        ref={nameSplitRef}
                        className="text-[3rem] sm:text-[4rem] md:text-[5.5rem] lg:text-[6.5rem] font-bold tracking-tighter leading-none mb-4 font-serif italic"
                        style={{ wordBreak: 'break-word' }}
                    >
                        {NAME}
                    </h2>

                    {/* Cycling role */}
                    <div className="overflow-hidden h-10 flex items-center mb-8">
                        <span
                            ref={roleCycleRef}
                            className="text-xl md:text-2xl text-gray-400 font-semibold inline-block"
                        />
                    </div>

                    {/* Bio */}
                    <p
                        ref={bioRef}
                        className="text-gray-400 leading-relaxed text-lg max-w-md mb-12"
                    >
                        {BIO}
                    </p>

                    {/* CTA + Socials */}
                    <div ref={linksRef} className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
                        {/* CTA */}
                        <a
                            href="#featured-projects"
                            className="interactable group flex items-center gap-3 text-base font-semibold uppercase tracking-widest border-b border-white pb-1 hover:text-gray-300 transition-colors"
                        >
                            See My Work
                            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </a>

                        {/* Socials */}
                        <div className="flex items-center gap-5">
                            {[
                                { href: "https://github.com/mithilesh042006", Icon: Github, label: "GitHub" },
                                { href: "https://www.linkedin.com/in/mithilesh-k-a0295632b/", Icon: Linkedin, label: "LinkedIn" },
                            ].map(({ href, Icon, label }) => (
                                <a
                                    key={label}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={label}
                                    className="interactable w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:border-white transition-all duration-300"
                                >
                                    <Icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── RIGHT: Dual-image Clip-path Reveal ── */}
                <div className="flex items-center justify-center order-1 lg:order-2">
                    <div
                        ref={imageWrapRef}
                        className="interactable relative w-[320px] h-[420px] md:w-[400px] md:h-[520px] lg:w-[460px] lg:h-[600px] cursor-none select-none"
                    >
                        {/* Decorative ring */}
                        <div className="absolute -inset-4 rounded-[2rem] border border-gray-800 pointer-events-none" />
                        <div className="absolute -inset-8 rounded-[2.5rem] border border-gray-900 pointer-events-none" />

                        {/* Base image: desaturated / dark */}
                        <div className="absolute inset-0 rounded-[1.5rem] overflow-hidden">
                            <img
                                src="/hero_image.png"
                                alt="Mithilesh"
                                className="w-full h-full object-cover object-top"
                                style={{
                                    filter: "grayscale(100%) brightness(0.75) contrast(1.1)",
                                    mixBlendMode: "normal",
                                }}
                                draggable={false}
                            />
                            {/* Dark overlay */}
                            <div className="absolute inset-0 bg-black/30" />
                        </div>

                        {/* Reveal layer: full-color, glowing — unmasked by clip-path */}
                        <div
                            ref={revealLayerRef}
                            className="absolute inset-0 rounded-[1.5rem] overflow-hidden"
                            style={{ clipPath: "circle(0% at 50% 50%)", backgroundColor: "#000" }}
                        >
                            <img
                                src="/hover_image.png"
                                alt="Mithilesh — color"
                                className="w-full h-full object-cover object-top"
                                style={{
                                    filter:
                                        "brightness(1.15) saturate(1.3) contrast(1.05) drop-shadow(0 0 30px rgba(255,255,255,0.15))",
                                }}
                                draggable={false}
                            />
                            {/* Radial highlight at center */}
                            <div
                                className="absolute inset-0 pointer-events-none"
                                style={{
                                    background:
                                        "radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.08) 0%, transparent 65%)",
                                }}
                            />
                        </div>

                        {/* Hover hint text */}
                        <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none">
                            <span
                                className="text-xs uppercase tracking-widest text-gray-500 font-semibold px-4 py-2 rounded-full border border-gray-800 bg-black/50 backdrop-blur-sm"
                                style={{ transition: "opacity 0.3s" }}
                            >
                                Hover
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom fade into next section */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
        </section>
    );
}
