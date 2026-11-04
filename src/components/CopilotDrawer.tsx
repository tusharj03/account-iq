import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, MessageSquareText } from 'lucide-react';
import { AccountIntelligenceReport } from '../types';
import { askCopilot } from '../lib/api';
import { Markdown } from './Markdown';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
}

export function CopilotDrawer({
  open,
  account,
  onClose,
}: {
  open: boolean;
  account: AccountIntelligenceReport | null;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const suggestions = [
    'What are the 3 strongest reasons to engage now?',
    'How do I displace the likely incumbent here?',
    'Draft a cold email to the VP of Infrastructure.',
  ];

  const send = async (q: string) => {
    if (!account || !q.trim() || loading) return;
    const history = messages;
    setMessages((m) => [...m, { role: 'user', content: q }]);
    setInput('');
    setLoading(true);
    try {
      const answer = await askCopilot(account.id, q, history);
      setMessages((m) => [...m, { role: 'assistant', content: answer }]);
    } catch (e: any) {
      setMessages((m) => [...m, { role: 'assistant', content: `⚠️ ${e.message || 'Copilot failed.'}` }]);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white border-l border-gray-20 flex flex-col shadow-xl">
        <div className="h-14 px-4 flex items-center justify-between border-b border-gray-20 shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquareText className="w-5 h-5 text-ibm-blue" />
            <div>
              <div className="text-sm font-semibold text-gray-100">Meeting-prep copilot</div>
              <div className="text-[11px] text-gray-50">{account?.companyName}</div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-50 hover:text-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-sm text-gray-60">
              <p className="mb-3">Ask anything about {account?.companyName} grounded in this dossier.</p>
              <div className="space-y-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="block w-full text-left border border-gray-20 px-3 py-2 text-sm text-gray-80 hover:border-ibm-blue hover:text-ibm-blue transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={m.role === 'user' ? 'flex justify-end' : ''}>
              <div
                className={
                  m.role === 'user'
                    ? 'bg-ibm-blue text-white px-3 py-2 max-w-[85%] text-sm'
                    : 'bg-gray-10 border border-gray-20 px-3 py-2 max-w-[92%]'
                }
              >
                {m.role === 'user' ? m.content : <Markdown compact>{m.content}</Markdown>}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-50">
              <Loader2 className="w-4 h-4 animate-spin" /> Thinking…
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="p-3 border-t border-gray-20 shrink-0 flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the copilot…"
            className="flex-1 border border-gray-30 focus:border-ibm-blue outline-none px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="bg-ibm-blue hover:bg-ibm-blueHover disabled:bg-gray-30 text-white px-3 flex items-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
