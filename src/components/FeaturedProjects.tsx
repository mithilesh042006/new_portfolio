import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { ArrowUpRight, ExternalLink, Github } from 'lucide-react';
import { watchProjects, type Project } from '../lib/firestore';

gsap.registerPlugin(ScrollTrigger);

export default function FeaturedProjects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const sectionRef = useRef<HTMLElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const projectsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const unsub = watchProjects((data) => {
            setProjects(data);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    useEffect(() => {
        if (loading || projects.length === 0) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(headerRef.current,
                { opacity: 0, y: 50 },
                {
                    opacity: 1, y: 0, duration: 1,
                    scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' }
                }
            );

            if (projectsRef.current) {
                gsap.fromTo(projectsRef.current.children,
                    { opacity: 0, y: 100 },
                    {
                        opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: 'power3.out',
                        scrollTrigger: { trigger: projectsRef.current, start: 'top 85%' }
                    }
                );
            }
        });

        return () => ctx.revert();
    }, [loading, projects]);

    return (
        <section ref={sectionRef} className="py-24 px-6 md:px-12 lg:px-24 bg-black text-white w-full relative z-30">
            <div ref={headerRef} className="flex flex-col md:flex-row justify-between items-end mb-16 md:mb-24">
                <div>
                    <p className="text-gray-400 uppercase tracking-widest text-sm mb-4 font-semibold">Selected Work</p>
                    <h2 className="text-3xl sm:text-5xl md:text-7xl font-bold italic font-serif tracking-tight">Featured<br />Projects</h2>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-24">
                    <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                </div>
            ) : projects.length === 0 ? (
                <p className="text-gray-600 text-center py-12">No projects yet.</p>
            ) : (
                <div ref={projectsRef} className="flex flex-col gap-16 md:gap-32">
                    {projects.map((project, index) => (
                        <div
                            key={project.id}
                            className={`flex flex-col ${index % 2 !== 0 ? 'md:flex-col-reverse lg:flex-row-reverse' : 'lg:flex-row'} gap-8 lg:gap-16 items-center group interactable cursor-pointer`}
                        >
                            <div className="w-full lg:w-3/5 overflow-hidden rounded-xl">
                                {project.imageUrl ? (
                                    <img
                                        src={project.imageUrl}
                                        alt={project.title}
                                        className="w-full h-[250px] sm:h-[400px] md:h-[600px] object-cover transition-transform duration-700 group-hover:scale-105 filter grayscale hover:grayscale-0"
                                    />
                                ) : (
                                    <div className="w-full h-[250px] sm:h-[400px] md:h-[600px] bg-gray-900 rounded-xl flex items-center justify-center text-gray-700 text-lg font-serif italic">
                                        No image
                                    </div>
                                )}
                            </div>
                            <div className="w-full lg:w-2/5 flex flex-col justify-center">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-gray-400 tracking-wider text-sm">{project.category}</span>
                                    <span className="text-gray-500 font-serif italic">{project.year}</span>
                                </div>
                                <h3 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 group-hover:text-gray-300 transition-colors">{project.title}</h3>
                                {project.description && (
                                    <p className="text-gray-500 leading-relaxed mb-6 text-sm">{project.description}</p>
                                )}
                                {project.tech?.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {project.tech.map(t => (
                                            <span key={t} className="text-xs px-3 py-1 border border-gray-800 rounded-full text-gray-400">{t}</span>
                                        ))}
                                    </div>
                                )}
                                <div className="flex items-center gap-4">
                                    {project.liveUrl && (
                                        <a href={project.liveUrl} target="_blank" rel="noreferrer"
                                           className="w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    )}
                                    {project.githubUrl && (
                                        <a href={project.githubUrl} target="_blank" rel="noreferrer"
                                           className="w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                                            <Github className="w-4 h-4" />
                                        </a>
                                    )}
                                    {!project.liveUrl && !project.githubUrl && (
                                        <div className="w-12 h-12 rounded-full border border-gray-600 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                                            <ArrowUpRight className="w-6 h-6" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
