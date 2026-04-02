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
      title="Open AI Terminal"
      aria-label="Open AI Assistant Terminal"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-white text-black rounded-full shadow-2xl flex items-center justify-center hover:bg-gray-100 transition-all duration-300 hover:scale-110 group"
    >
      <Bot className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
    </button>
  );
}
