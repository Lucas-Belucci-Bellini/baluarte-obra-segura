import { useState, useRef, useEffect, type CSSProperties } from 'react';
import { Link } from 'wouter';
import { MessageCircle, X, Send, Bot, User, Maximize2, Loader2, Wrench } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';

type Msg = { role: 'user' | 'assistant'; content: string; pending?: boolean };

const MAX_WIDGET_MSGS = 40;

export function ChatWidget() {
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [convId, setConvId] = useState<number | null>(null);
  const [toolActive, setToolActive] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const utils = trpc.useUtils();

  const t = (pt: string, en: string) => language === 'PT' ? pt : en;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, toolActive]);

  useEffect(() => {
    if (open && msgs.length === 0) {
      setMsgs([{
        role: 'assistant',
        content: t(
          'Olá! Sou o **Mestre de Obra Digital** do WikiBuild. Posso ajudar com materiais, ferramentas, normas e boas práticas de construção. O que você precisa saber?',
          'Hi! I\'m the **Digital Master Builder** of WikiBuild. I can help with materials, tools, standards and construction best practices. What do you need to know?',
        ),
      }]);
    }
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || streaming) return;

    setInput('');
    setMsgs(prev => [...prev, { role: 'user', content: text }]);
    setMsgs(prev => [...prev, { role: 'assistant', content: '', pending: true }]);
    setStreaming(true);
    setToolActive('');

    abortRef.current = new AbortController();
    let buffer = '';

    try {
      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        signal: abortRef.current.signal,
        body: JSON.stringify({ message: text, conversationId: convId ?? undefined, language }),
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: 'Error' }));
        const msg = err.error === 'CHAT_TIER_REQUIRED'
          ? t(
              '🔒 O chatbot IA está disponível apenas nos planos **Pro** e **Enterprise**. [Ver planos →](/pricing)',
              '🔒 The AI chatbot is only available on **Pro** and **Enterprise** plans. [See plans →](/pricing)'
            )
          : (err.error ?? t('Erro ao conectar.', 'Connection error.'));
        setMsgs(prev => {
          const next = [...prev];
          next[next.length - 1] = { role: 'assistant', content: msg };
          return next;
        });
        setStreaming(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const evt = JSON.parse(line.slice(6));
            if (evt.type === 'delta') {
              setMsgs(prev => {
                const next = [...prev];
                const last = next[next.length - 1];
                next[next.length - 1] = { ...last, content: last.content + evt.content, pending: false };
                return next;
              });
            } else if (evt.type === 'tool_start') {
              setToolActive(evt.tool);
            } else if (evt.type === 'tool_result') {
              setToolActive('');
            } else if (evt.type === 'done') {
              setConvId(evt.conversationId);
              utils.chat.conversations.invalidate();
              setMsgs(prev => {
                const next = [...prev];
                next[next.length - 1] = { ...next[next.length - 1], pending: false };
                return next;
              });
            } else if (evt.type === 'error') {
              setMsgs(prev => {
                const next = [...prev];
                next[next.length - 1] = { role: 'assistant', content: `⚠️ ${evt.message}` };
                return next;
              });
            }
          } catch { /* ignore parse errors */ }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setMsgs(prev => {
          const next = [...prev];
          next[next.length - 1] = { role: 'assistant', content: t('Erro ao processar. Tente novamente.', 'Processing error. Please try again.') };
          return next;
        });
      }
    } finally {
      setStreaming(false);
      setToolActive('');
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  function stopStream() {
    abortRef.current?.abort();
    setStreaming(false);
    setToolActive('');
  }

  if (!isAuthenticated) return null;

  const bubble: CSSProperties = {
    position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 200,
  };

  const panel: CSSProperties = {
    position: 'fixed', bottom: '5rem', right: '1.5rem', zIndex: 200,
    width: 360, maxWidth: 'calc(100vw - 2rem)',
    height: 500, maxHeight: 'calc(100vh - 8rem)',
    background: 'var(--bg-2)', border: '1px solid var(--border-strong)',
    borderRadius: 16, boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
  };

  return (
    <>
      {open && (
        <div style={panel}>
          {/* Header */}
          <div style={{
            padding: '0.75rem 1rem',
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: '0.625rem',
            background: 'var(--bg-3)',
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Bot size={16} className="text-white" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text)' }}>
                {t('Mestre de Obra Digital', 'Digital Master Builder')}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>WikiBuild AI</div>
            </div>
            <Link
              href="/chat"
              onClick={() => setOpen(false)}
              title={t('Abrir chat completo', 'Open full chat')}
              style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
            >
              <Maximize2 size={14} />
            </Link>
            <button type="button" onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
            {msgs.slice(-MAX_WIDGET_MSGS).map((m, i) => (
              <div key={i} style={{
                display: 'flex', gap: '0.5rem', marginBottom: '0.75rem',
                flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 999, flexShrink: 0,
                  background: m.role === 'user' ? 'var(--accent)' : 'var(--bg-3)',
                  border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {m.role === 'user' ? <User size={13} style={{ color: 'white' }} /> : <Bot size={13} style={{ color: 'var(--accent)' }} />}
                </div>
                <div style={{
                  maxWidth: '80%',
                  background: m.role === 'user' ? 'var(--accent)' : 'var(--bg-3)',
                  color: m.role === 'user' ? 'white' : 'var(--text)',
                  borderRadius: m.role === 'user' ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.8125rem', lineHeight: 1.6,
                  border: m.role === 'assistant' ? '1px solid var(--border)' : 'none',
                }}>
                  {m.pending && m.content === '' ? (
                    <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center', color: 'var(--text-muted)' }}>
                      <Loader2 size={13} className="animate-spin" />
                      {toolActive ? (
                        <span style={{ fontSize: '0.7rem' }}>
                          <Wrench size={11} style={{ display: 'inline', marginRight: 3 }} />
                          {toolActive.replace('search_', '').replace('_', ' ')}…
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.7rem' }}>{t('digitando...', 'typing...')}</span>
                      )}
                    </span>
                  ) : (
                    <ReactMarkdown
                      components={{
                        a: ({ href, children }) => (
                          <a href={href} style={{ color: m.role === 'user' ? 'rgba(255,255,255,0.85)' : 'var(--accent)', textDecoration: 'underline' }}>
                            {children}
                          </a>
                        ),
                        p: ({ children }) => <p style={{ margin: '0 0 0.5rem', lineHeight: 1.6 }}>{children}</p>,
                        ul: ({ children }) => <ul style={{ margin: '0.25rem 0', paddingLeft: '1.25rem' }}>{children}</ul>,
                        li: ({ children }) => <li style={{ marginBottom: 2 }}>{children}</li>,
                        code: ({ children }) => (
                          <code style={{ background: 'rgba(0,0,0,0.2)', padding: '1px 4px', borderRadius: 4, fontSize: '0.75rem' }}>
                            {children}
                          </code>
                        ),
                        strong: ({ children }) => <strong style={{ fontWeight: 700 }}>{children}</strong>,
                      }}
                    >
                      {m.content}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            ))}
            {toolActive && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.5rem 0.25rem', color: 'var(--text-subtle)', fontSize: '0.7rem' }}>
                <Wrench size={11} />
                {t('Buscando', 'Searching')} {toolActive.replace('search_', '').replace('_', ' ')}…
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '0.625rem', borderTop: '1px solid var(--border)', background: 'var(--bg-3)' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                disabled={streaming}
                placeholder={t('Pergunte sobre materiais, normas...', 'Ask about materials, standards...')}
                style={{
                  flex: 1, resize: 'none', background: 'var(--bg-2)', color: 'var(--text)',
                  border: '1px solid var(--border)', borderRadius: 10, padding: '0.5rem 0.75rem',
                  fontSize: '0.8125rem', lineHeight: 1.5, maxHeight: 100, outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
              {streaming ? (
                <button
                  type="button"
                  onClick={stopStream}
                  style={{
                    width: 36, height: 36, borderRadius: 10, border: 'none', cursor: 'pointer',
                    background: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <X size={16} style={{ color: 'white' }} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  style={{
                    width: 36, height: 36, borderRadius: 10, border: 'none', cursor: input.trim() ? 'pointer' : 'not-allowed',
                    background: input.trim() ? 'var(--accent)' : 'var(--bg-3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, transition: 'background 0.15s',
                  }}
                >
                  <Send size={15} style={{ color: input.trim() ? 'white' : 'var(--text-subtle)' }} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          ...bubble,
          width: 52, height: 52, borderRadius: 999, border: 'none', cursor: 'pointer',
          background: open ? 'var(--bg-3)' : 'var(--accent)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s',
        }}
        aria-label={t('Abrir assistente', 'Open assistant')}
      >
        {open ? <X size={22} style={{ color: 'var(--text)' }} /> : <MessageCircle size={22} style={{ color: 'white' }} />}
      </button>
    </>
  );
}
