import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { Award, BookOpen, Hexagon, Star, Globe, Code2 } from 'lucide-react';
import { watchQualifications, type Qualification } from '../lib/firestore';

gsap.registerPlugin(ScrollTrigger);

const ICONS: Record<string, React.ReactNode> = {
    BookOpen: <BookOpen className="w-6 h-6" />,
    Award: <Award className="w-6 h-6" />,
    Hexagon: <Hexagon className="w-6 h-6" />,
    Star: <Star className="w-6 h-6" />,
    Globe: <Globe className="w-6 h-6" />,
    Code2: <Code2 className="w-6 h-6" />,
};

export default function Qualifications() {
    const [qualifications, setQualifications] = useState<Qualification[]>([]);
    const [loading, setLoading] = useState(true);
    const sectionRef = useRef<HTMLElement>(null);
    const cardsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const unsub = watchQualifications((data) => {
            setQualifications(data);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    useEffect(() => {
        if (loading || qualifications.length === 0) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                '.qual-header',
                { opacity: 0, y: 40 },
                { opacity: 1, y: 0, duration: 1, scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' } }
            );
            if (cardsRef.current) {
                gsap.fromTo(
                    cardsRef.current.children,
                    { opacity: 0, y: 50, scale: 0.95 },
                    { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.2, ease: 'power2.out', scrollTrigger: { trigger: cardsRef.current, start: 'top 75%' } }
                );
            }
        });

        return () => ctx.revert();
    }, [loading, qualifications]);

    return (
        <section ref={sectionRef} className="py-24 px-6 md:px-12 lg:px-24 bg-[#050505] text-white w-full relative z-30">
            <div className="text-center mb-16 md:mb-24 qual-header">
                <p className="text-gray-400 uppercase tracking-widest text-sm mb-4 font-semibold">Education &amp; Certifications</p>
                <h2 className="text-5xl md:text-6xl font-bold font-serif italic">Qualifications</h2>
            </div>

            {loading ? (
                <div className="flex justify-center py-24">
                    <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                </div>
            ) : qualifications.length === 0 ? (
                <p className="text-gray-600 text-center py-12">No qualifications listed yet.</p>
            ) : (
                <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {qualifications.map((item) => (
                        <div
                            key={item.id}
                            className="interactable bg-[#111111] p-8 rounded-2xl border border-gray-800 hover:border-gray-500 transition-colors duration-500 group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                            <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mb-6 text-gray-300 group-hover:text-white transition-colors duration-300">
                                {ICONS[item.iconName] ?? <Award className="w-6 h-6" />}
                            </div>
                            <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                            <div className="flex justify-between items-center mb-4 text-sm font-serif italic">
                                <span className="text-gray-400">{item.institution}</span>
                                <span className="text-gray-500">{item.year}</span>
                            </div>
                            <p className="text-gray-400 leading-relaxed text-sm">{item.description}</p>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
