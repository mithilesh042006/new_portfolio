import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { addMessage } from '../lib/firestore';
import { Send, CheckCircle, Loader2 } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function Footer() {
    const footerRef = useRef<HTMLElement>(null);
    const textRef = useRef<HTMLHeadingElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(textRef.current,
                { opacity: 0, y: 100 },
                {
                    opacity: 1, y: 0, duration: 1.5, ease: "power4.out",
                    scrollTrigger: { trigger: footerRef.current, start: "top 80%" },
                }
            );

            if (formRef.current) {
                gsap.fromTo(formRef.current,
                    { opacity: 0, y: 60 },
                    {
                        opacity: 1, y: 0, duration: 1, ease: "power3.out", delay: 0.3,
                        scrollTrigger: { trigger: formRef.current, start: "top 90%" },
                    }
                );
            }
        });
        return () => ctx.revert();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (sending) return;
        setSending(true);
        try {
            await addMessage({
                ...form,
                createdAt: new Date().toISOString(),
                read: false,
            });
            setSent(true);
            setForm({ name: '', email: '', subject: '', message: '' });
            setTimeout(() => setSent(false), 5000);
        } catch (err) {
            console.error('Failed to send message:', err);
        } finally {
            setSending(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const inputClass = "w-full bg-white/[0.03] border border-white/10 text-white rounded-xl px-5 py-3.5 text-sm outline-none placeholder-gray-600 focus:border-white/30 focus:bg-white/[0.05] transition-all duration-300";

    return (
        <footer ref={footerRef} className="py-24 px-6 md:px-12 lg:px-24 bg-black text-white w-full relative z-30 overflow-hidden rounded-t-[3rem] border-t border-gray-900">
            <div className="flex flex-col items-center justify-center text-center mb-16 md:mb-24">
                <p className="text-gray-400 tracking-widest uppercase text-sm font-semibold mb-6">Have an idea?</p>
                <h2 ref={textRef} className="text-5xl md:text-[10rem] font-bold tracking-tighter leading-none interactable hover:text-gray-300 transition-colors cursor-pointer" style={{ fontSize: 'clamp(3rem, 12vw, 10rem)' }}>
                    Let's Talk
                </h2>
            </div>

            {/* Contact Form */}
            <div className="max-w-2xl mx-auto mb-20 md:mb-32">
                {sent ? (
                    <div className="flex flex-col items-center gap-4 py-12 animate-fadeIn">
                        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-green-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white">Message Sent!</h3>
                        <p className="text-gray-400 text-sm">Thanks for reaching out. I'll get back to you soon.</p>
                    </div>
                ) : (
                    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wider font-semibold">Name</label>
                                <input
                                    required
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    className={inputClass}
                                    placeholder="Your name"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wider font-semibold">Email</label>
                                <input
                                    required
                                    type="email"
                                    value={form.email}
                                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                    className={inputClass}
                                    placeholder="your@email.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wider font-semibold">Subject</label>
                            <input
                                required
                                value={form.subject}
                                onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                                className={inputClass}
                                placeholder="What's this about?"
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wider font-semibold">Message</label>
                            <textarea
                                required
                                rows={5}
                                value={form.message}
                                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                                className={`${inputClass} resize-none`}
                                placeholder="Tell me about your project..."
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={sending}
                            className="w-full py-4 rounded-xl bg-white text-black text-sm font-bold uppercase tracking-wider hover:bg-gray-100 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 interactable disabled:opacity-60"
                        >
                            {sending ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Send Message
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-800/50">
                <div className="flex gap-8 mb-6 md:mb-0">
                    <a href="#" className="text-gray-400 hover:text-white transition-colors interactable text-sm font-semibold uppercase tracking-wider">Twitter</a>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors interactable text-sm font-semibold uppercase tracking-wider">LinkedIn</a>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors interactable text-sm font-semibold uppercase tracking-wider">Instagram</a>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors interactable text-sm font-semibold uppercase tracking-wider">GitHub</a>
                </div>

                <div className="flex items-center gap-8">
                    <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Mithilesh. All rights reserved.</p>
                    <button onClick={scrollToTop} className="interactable text-gray-400 hover:text-white transition-colors text-sm font-semibold uppercase tracking-wider hidden md:block">
                        Back to Top ↑
                    </button>
                </div>
            </div>
        </footer>
    );
}
