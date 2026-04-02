import { useState, useRef, useEffect, useCallback } from 'react';
import { fetchAiContext } from '../lib/firestore';

interface Line {
  type: 'system' | 'user' | 'assistant' | 'error' | 'thinking';
  text: string;
}

const SYSTEM_PROMPT = (context: string) =>
  `You are an AI assistant representing Mithilesh's portfolio.
Answer questions about Mithilesh professionally and accurately using ONLY the information below.
If you don't know something, say so — never make up information.
Respond concisely — 1-3 sentences max unless detail is explicitly requested.

PORTFOLIO DATA:
${context}`;

const BOOT_LINES = [
  'Mithilesh Portfolio OS  [Version 1.0.0]',
  '(c) 2025 Mithilesh. All rights reserved.',
  '',
  'Initializing AI assistant...',
  'Loading portfolio context... done.',
  '',
  'Type your question and press Enter.',
  'Type "clear" to clear the terminal.',
  '──────────────────────────────────────────',
];

export default function AiTerminal() {
  const [lines, setLines] = useState<Line[]>(
    BOOT_LINES.map((t) => ({ type: 'system', text: t }))
  );
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const terminalBodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Load context once
  useEffect(() => {
    fetchAiContext().then(setContext).catch(() => {});
  }, []);

  useEffect(() => {
    const body = terminalBodyRef.current;
    if (body) {
      body.scrollTop = body.scrollHeight;
    }
  }, [lines]);

  const pushLine = (line: Line) => setLines((prev) => [...prev, line]);

  const sendMessage = useCallback(async (query: string) => {
    const q = query.trim();
    if (!q) return;
    if (q.toLowerCase() === 'clear') {
      setLines(BOOT_LINES.map((t) => ({ type: 'system', text: t })));
      return;
    }

    setHistory((prev) => [q, ...prev]);
    setHistoryIdx(-1);
    pushLine({ type: 'user', text: q });
    pushLine({ type: 'thinking', text: '⠋ thinking...' });
    setLoading(true);

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT(context) },
            { role: 'user', content: q },
          ],
          max_tokens: 400,
          temperature: 0.7,
        }),
      });
      const data = await res.json();
      const reply =
        data.choices?.[0]?.message?.content ??
        'Error: no response from model.';

      setLines((prev) => {
        const filtered = prev.filter((l) => l.type !== 'thinking');
        return [...filtered, { type: 'assistant', text: reply }];
      });
    } catch {
      setLines((prev) => {
        const filtered = prev.filter((l) => l.type !== 'thinking');
        return [
          ...filtered,
          { type: 'error', text: 'Error: network request failed.' },
        ];
      });
    } finally {
      setLoading(false);
    }
  }, [context]);

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const nextIdx = Math.min(historyIdx + 1, history.length - 1);
      setHistoryIdx(nextIdx);
      setInput(history[nextIdx] ?? '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIdx = Math.max(historyIdx - 1, -1);
      setHistoryIdx(nextIdx);
      setInput(nextIdx === -1 ? '' : history[nextIdx] ?? '');
    }
  };

  return (
    <section
      id="ai-terminal"
      ref={sectionRef}
      className="w-full bg-black py-24 px-6 md:px-12 lg:px-24 relative z-30"
    >
      {/* Section header */}
      <div className="flex flex-col items-center text-center mb-16">
        <p className="text-gray-400 uppercase tracking-widest text-sm mb-4 font-semibold">
          AI Assistant
        </p>
        <h2
          className="font-bold font-serif italic tracking-tight"
          style={{ fontSize: 'clamp(2.5rem, 8vw, 6rem)', color: '#fff' }}
        >
          Ask Me Anything
        </h2>
        <p className="text-gray-500 mt-4 text-sm max-w-md">
          Interact with Mithilesh's AI assistant in a terminal-style interface.
        </p>
      </div>

      {/* Terminal window */}
      <div
        className="mx-auto max-w-8xl rounded-xl overflow-hidden border border-gray-800 shadow-[0_0_60px_rgba(0,200,100,0.08)]"
        onClick={() => inputRef.current?.focus()}
      >
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 bg-[#1a1a1a] border-b border-gray-800 select-none">
          <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <span className="w-3 h-3 rounded-full bg-[#28c840]" />
          <span className="ml-4 text-xs text-gray-500 font-mono flex-1 text-center">
            mithilesh@portfolio ── bash ── 120×40
          </span>
        </div>

        {/* Terminal body */}
        <div
          ref={terminalBodyRef}
          className="bg-[#0d0d0d] p-6 font-mono text-sm min-h-[560px] max-h-[500px] overflow-y-auto cursor-text"
          style={{ lineHeight: '1.7' }}
        >
          {lines.map((line, i) => {
            if (line.type === 'system') {
              return (
                <div key={i} className="text-[#4af] whitespace-pre-wrap">
                  {line.text}
                </div>
              );
            }
            if (line.type === 'user') {
              return (
                <div key={i} className="flex gap-2 mt-2">
                  <span className="text-[#28c840] shrink-0 select-none">
                    visitor@portfolio:~$
                  </span>
                  <span className="text-white break-all">{line.text}</span>
                </div>
              );
            }
            if (line.type === 'assistant') {
              return (
                <div key={i} className="mt-1 ml-0 text-[#e2e2e2] whitespace-pre-wrap">
                  <span className="text-[#febc2e] select-none">→ </span>
                  {line.text}
                </div>
              );
            }
            if (line.type === 'thinking') {
              return (
                <div key={i} className="mt-1 text-[#555] italic animate-pulse">
                  {line.text}
                </div>
              );
            }
            if (line.type === 'error') {
              return (
                <div key={i} className="mt-1 text-[#ff5f57]">
                  {line.text}
                </div>
              );
            }
            return null;
          })}

          {/* Input prompt */}
          <div className="flex gap-2 mt-2 items-center">
            <span className="text-[#28c840] shrink-0 select-none">
              visitor@portfolio:~$
            </span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={loading}
              placeholder={loading ? '' : 'type your question…'}
              className="flex-1 bg-transparent text-white outline-none caret-[#28c840] placeholder-gray-700 min-w-0"
              autoComplete="off"
              spellCheck={false}
              aria-label="AI terminal input"
            />
            <span
              className="w-2 h-5 bg-[#28c840] animate-pulse ml-[-2px]"
              style={{ opacity: loading ? 0 : 1 }}
            />
          </div>

          <div ref={bottomRef} />
        </div>
      </div>

      <p className="text-center text-gray-700 text-xs mt-6 font-mono">
        ↑↓ arrow keys for history &nbsp;·&nbsp; type "clear" to reset
      </p>
    </section>
  );
}
