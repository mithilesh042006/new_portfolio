import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { watchTestimonials, type Testimonial } from '../lib/firestore';
import { ChevronLeft, ChevronRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function Testimonials() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [active, setActive] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        const unsub = watchTestimonials((data) => {
            setTestimonials(data);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    // GSAP header animation
    useEffect(() => {
        if (loading || testimonials.length === 0) return;
        const ctx = gsap.context(() => {
            gsap.fromTo('.test-header',
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 1, scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' } }
            );
        });
        return () => ctx.revert();
    }, [loading, testimonials]);

    const animateCard = useCallback((direction: 'left' | 'right', nextIdx: number) => {
        if (isAnimating || !cardRef.current) return;
        setIsAnimating(true);

        const xOut = direction === 'left' ? -120 : 120;
        const xIn = direction === 'left' ? 120 : -120;

        gsap.to(cardRef.current, {
            x: xOut, rotateY: direction === 'left' ? -15 : 15, opacity: 0, scale: 0.9,
            duration: 0.4, ease: 'power2.in',
            onComplete: () => {
                setActive(nextIdx);
                gsap.set(cardRef.current, { x: xIn, rotateY: direction === 'left' ? 15 : -15, opacity: 0, scale: 0.9 });
                gsap.to(cardRef.current, {
                    x: 0, rotateY: 0, opacity: 1, scale: 1,
                    duration: 0.5, ease: 'power2.out',
                    onComplete: () => setIsAnimating(false),
                });
            },
        });
    }, [isAnimating]);

    const goNext = useCallback(() => {
        if (testimonials.length === 0) return;
        const next = (active + 1) % testimonials.length;
        animateCard('left', next);
    }, [active, testimonials.length, animateCard]);

    const goPrev = useCallback(() => {
        if (testimonials.length === 0) return;
        const prev = (active - 1 + testimonials.length) % testimonials.length;
        animateCard('right', prev);
    }, [active, testimonials.length, animateCard]);

    // Autoplay
    useEffect(() => {
        if (testimonials.length <= 1) return;
        autoplayRef.current = setInterval(goNext, 5000);
        return () => { if (autoplayRef.current) clearInterval(autoplayRef.current); };
    }, [goNext, testimonials.length]);

    const resetAutoplay = () => {
        if (autoplayRef.current) clearInterval(autoplayRef.current);
        autoplayRef.current = setInterval(goNext, 5000);
    };

    const handleNext = () => { goNext(); resetAutoplay(); };
    const handlePrev = () => { goPrev(); resetAutoplay(); };
    const handleDot = (idx: number) => {
        if (idx === active || isAnimating) return;
        const dir = idx > active ? 'left' : 'right';
        animateCard(dir, idx);
        resetAutoplay();
    };

    const current = testimonials[active];

    return (
        <section ref={sectionRef} className="py-24 px-6 md:px-12 lg:px-24 bg-[#050505] text-white w-full relative z-30 overflow-hidden">
            {/* Background accent */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.015] rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 flex flex-col items-center text-center mb-16 md:mb-20 test-header">
                <p className="text-gray-400 uppercase tracking-widest text-sm mb-4 font-semibold">Client Feedback</p>
                <h2 className="text-5xl md:text-7xl font-bold font-serif italic max-w-3xl">What people say</h2>
            </div>

            {loading ? (
                <div className="flex justify-center py-24">
                    <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                </div>
            ) : testimonials.length === 0 ? (
                <p className="text-gray-600 text-center py-12">No testimonials yet.</p>
            ) : (
                <div className="relative z-10 max-w-3xl mx-auto" style={{ perspective: '1200px' }}>
                    {/* Card */}
                    <div
                        ref={cardRef}
                        className="relative bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-sm rounded-3xl border border-white/10 p-10 md:p-14 text-center"
                        style={{ transformStyle: 'preserve-3d' }}
                    >
                        {/* Big quote mark */}
                        <div className="absolute top-6 left-8 text-8xl font-serif text-white/[0.06] leading-none select-none">"</div>

                        {/* Number indicator */}
                        <div className="absolute top-6 right-8 text-xs font-mono text-gray-600 tracking-wider">
                            {String(active + 1).padStart(2, '0')} / {String(testimonials.length).padStart(2, '0')}
                        </div>

                        {/* Quote */}
                        <p className="text-xl md:text-2xl lg:text-3xl font-serif italic text-gray-200 leading-relaxed mb-10 mt-4 max-w-2xl mx-auto">
                            "{current.quote}"
                        </p>

                        {/* Divider */}
                        <div className="w-12 h-px bg-gradient-to-r from-transparent via-gray-500 to-transparent mx-auto mb-8" />

                        {/* Author */}
                        <div>
                            <p className="font-bold text-white text-lg tracking-wide">{current.author}</p>
                            <p className="text-gray-500 text-sm mt-1">{current.role}</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    {testimonials.length > 1 && (
                        <>
                            {/* Arrow buttons */}
                            <div className="flex items-center justify-center gap-6 mt-10">
                                <button
                                    onClick={handlePrev}
                                    disabled={isAnimating}
                                    className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all duration-300 disabled:opacity-40"
                                    aria-label="Previous testimonial"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>

                                {/* Dots */}
                                <div className="flex items-center gap-2">
                                    {testimonials.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleDot(i)}
                                            className={`rounded-full transition-all duration-500 ${
                                                i === active
                                                    ? 'w-8 h-2 bg-white'
                                                    : 'w-2 h-2 bg-gray-600 hover:bg-gray-400'
                                            }`}
                                            aria-label={`Go to testimonial ${i + 1}`}
                                        />
                                    ))}
                                </div>

                                <button
                                    onClick={handleNext}
                                    disabled={isAnimating}
                                    className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all duration-300 disabled:opacity-40"
                                    aria-label="Next testimonial"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </section>
    );
}
