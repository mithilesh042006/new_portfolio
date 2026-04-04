import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { ArrowUpRight, ExternalLink, Github, ChevronLeft, ChevronRight } from 'lucide-react';
import { watchProjects, type Project } from '../lib/firestore';

gsap.registerPlugin(ScrollTrigger);

function ProjectImageCarousel({ images, title }: { images: string[]; title: string }) {
    const [current, setCurrent] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    const go = (dir: 'prev' | 'next') => {
        if (isAnimating || images.length <= 1) return;
        setIsAnimating(true);
        const next = dir === 'next'
            ? (current + 1) % images.length
            : (current - 1 + images.length) % images.length;

        gsap.to(imgRef.current, {
            opacity: 0, scale: 1.05, duration: 0.3, ease: 'power2.in',
            onComplete: () => {
                setCurrent(next);
                gsap.fromTo(imgRef.current,
                    { opacity: 0, scale: 1.05 },
                    { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out', onComplete: () => setIsAnimating(false) }
                );
            },
        });
    };

    return (
        <div className="relative w-full h-[250px] sm:h-[400px] md:h-[600px] overflow-hidden rounded-xl group/carousel bg-[#0a0a0a]">
            <img
                ref={imgRef}
                src={images[current]}
                alt={`${title} - ${current + 1}`}
                className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
            />

            {images.length > 1 && (
                <>
                    {/* Left Arrow */}
                    <button
                        onClick={(e) => { e.stopPropagation(); go('prev'); }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white opacity-0 group-hover/carousel:opacity-100 hover:bg-black/80 hover:scale-110 transition-all duration-300"
                        aria-label="Previous image"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    {/* Right Arrow */}
                    <button
                        onClick={(e) => { e.stopPropagation(); go('next'); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white opacity-0 group-hover/carousel:opacity-100 hover:bg-black/80 hover:scale-110 transition-all duration-300"
                        aria-label="Next image"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>

                    {/* Dots */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300">
                        {images.map((_, i) => (
                            <button
                                key={i}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (i !== current && !isAnimating) {
                                        setIsAnimating(true);
                                        gsap.to(imgRef.current, {
                                            opacity: 0, duration: 0.25,
                                            onComplete: () => {
                                                setCurrent(i);
                                                gsap.to(imgRef.current, { opacity: 1, duration: 0.3, onComplete: () => setIsAnimating(false) });
                                            },
                                        });
                                    }
                                }}
                                className={`rounded-full transition-all duration-400 ${
                                    i === current ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                                }`}
                                aria-label={`Go to image ${i + 1}`}
                            />
                        ))}
                    </div>

                    {/* Counter */}
                    <span className="absolute top-4 right-4 text-xs font-mono text-white/60 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-md opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300">
                        {current + 1} / {images.length}
                    </span>
                </>
            )}
        </div>
    );
}

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

    const getImages = (p: Project): string[] => {
        if (p.images && p.images.length > 0) return p.images;
        if (p.imageUrl) return [p.imageUrl];
        return [];
    };

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
                    {projects.map((project, index) => {
                        const imgs = getImages(project);
                        return (
                            <div
                                key={project.id}
                                className={`flex flex-col ${index % 2 !== 0 ? 'md:flex-col-reverse lg:flex-row-reverse' : 'lg:flex-row'} gap-8 lg:gap-16 items-center group interactable cursor-pointer`}
                            >
                                <div className="w-full lg:w-3/5">
                                    {imgs.length > 0 ? (
                                        <ProjectImageCarousel images={imgs} title={project.title} />
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
                        );
                    })}
                </div>
            )}
        </section>
    );
}
