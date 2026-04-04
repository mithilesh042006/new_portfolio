import { Bot } from 'lucide-react';

export default function AiChat() {
  const scrollToTerminal = () => {
    const el = document.getElementById('ai-terminal');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <button
      onClick={scrollToTerminal}
      aria-label="Open AI Assistant Terminal"
      className="fixed bottom-6 right-6 z-50 group"
    >
      {/* Tooltip */}
      <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-4 py-2 bg-white text-black text-sm font-semibold rounded-xl shadow-xl whitespace-nowrap opacity-0 translate-x-3 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out">
        AI Assistant ✦
        <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[6px] w-3 h-3 bg-white rotate-45 rounded-sm" />
      </span>

      {/* Pulse ring */}
      <span className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-0 group-hover:opacity-30 transition-opacity duration-300" />

      {/* Button */}
      <span className="relative w-14 h-14 bg-white text-black rounded-full shadow-2xl flex items-center justify-center hover:bg-gray-100 transition-all duration-300 group-hover:scale-110">
        <Bot className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
      </span>
    </button>
  );
}
