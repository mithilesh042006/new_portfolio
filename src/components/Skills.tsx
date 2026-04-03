import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { watchSkills, type Skill } from '../lib/firestore';

gsap.registerPlugin(ScrollTrigger);

export default function Skills() {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [loading, setLoading] = useState(true);
    const sectionRef = useRef<HTMLElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const unsub = watchSkills((data) => {
            setSkills(data.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
            setLoading(false);
        });
        return () => unsub();
    }, []);

    useEffect(() => {
        if (loading || skills.length === 0) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                '.skills-header',
                { opacity: 0, x: -50 },
                { opacity: 1, x: 0, duration: 1, scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' } }
            );
            if (gridRef.current) {
                gsap.fromTo(
                    gridRef.current.children,
                    { opacity: 0, y: 40, scale: 0.9 },
                    {
                        opacity: 1, y: 0, scale: 1,
                        duration: 0.6, stagger: 0.08,
                        ease: 'back.out(1.4)',
                        scrollTrigger: { trigger: gridRef.current, start: 'top 80%' }
                    }
                );
            }
        });

        return () => ctx.revert();
    }, [loading, skills]);

    // Group skills by category
    const categories = skills.reduce<Record<string, Skill[]>>((acc, skill) => {
        const cat = skill.category || 'Other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(skill);
        return acc;
    }, {});

    return (
        <section
            ref={sectionRef}
            className="py-24 px-6 md:px-12 lg:px-24 bg-black text-white w-full relative z-30 border-t border-gray-900"
        >
            {/* Header */}
            <div className="skills-header mb-16">
                <p className="text-gray-400 uppercase tracking-widest text-sm mb-4 font-semibold">Expertise</p>
                <h2 className="text-5xl md:text-7xl font-bold font-serif italic mb-6">Skills &amp;<br />Technologies</h2>
                <p className="text-gray-400 leading-relaxed text-lg max-w-lg">
                    Tools and technologies I use to bring ideas to life.
                </p>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                </div>
            ) : skills.length === 0 ? (
                <p className="text-gray-600 text-center py-12">No skills listed yet.</p>
            ) : (
                <div className="space-y-16">
                    {Object.entries(categories).map(([category, catSkills]) => (
                        <div key={category}>
                            <h3 className="text-sm uppercase tracking-widest text-gray-500 mb-8 font-semibold border-b border-gray-800 pb-3">
                                {category}
                            </h3>
                            <div ref={gridRef} className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-6">
                                {catSkills.map((skill) => (
                                    <div
                                        key={skill.id}
                                        className="group flex flex-col items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/20 hover:bg-white/[0.06] transition-all duration-500 cursor-default"
                                    >
                                        <div className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-lg bg-white/[0.04] group-hover:bg-white/10 group-hover:scale-110 transition-all duration-500">
                                            <img
                                                src={skill.iconUrl}
                                                alt={skill.name}
                                                className="w-8 h-8 md:w-9 md:h-9 object-contain filter group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] transition-all duration-500"
                                                draggable={false}
                                            />
                                        </div>
                                        <span className="text-xs text-gray-400 group-hover:text-white font-medium text-center transition-colors duration-300 leading-tight">
                                            {skill.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
