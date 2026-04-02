import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { watchTestimonials, type Testimonial } from '../lib/firestore';

gsap.registerPlugin(ScrollTrigger);

export default function Testimonials() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const sectionRef = useRef<HTMLElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const unsub = watchTestimonials((data) => {
            setTestimonials(data);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    useEffect(() => {
        if (loading || testimonials.length === 0) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                '.test-header',
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 1, scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' } }
            );
            if (containerRef.current) {
                gsap.fromTo(
                    containerRef.current.children,
                    { opacity: 0, scale: 0.9 },
                    { opacity: 1, scale: 1, duration: 0.8, stagger: 0.2, ease: 'power2.out', scrollTrigger: { trigger: containerRef.current, start: 'top 75%' } }
                );
            }
        });

        return () => ctx.revert();
    }, [loading, testimonials]);

    return (
        <section ref={sectionRef} className="py-24 px-6 md:px-12 lg:px-24 bg-[#050505] text-white w-full relative z-30">
            <div className="flex flex-col items-center text-center mb-16 md:mb-24 test-header">
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
                <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((test) => (
                        <div
                            key={test.id}
                            className="interactable bg-[#111] p-10 rounded-[2rem] border border-gray-800 hover:bg-[#151515] transition-colors duration-500"
                        >
                            <svg className="w-10 h-10 text-gray-700 mb-6" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
                                <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                            </svg>
                            <p className="text-xl md:text-2xl font-serif italic text-gray-300 leading-snug mb-10">
                                "{test.quote}"
                            </p>
                            <div>
                                <p className="font-bold text-white text-lg">{test.author}</p>
                                <p className="text-gray-500 text-sm">{test.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
