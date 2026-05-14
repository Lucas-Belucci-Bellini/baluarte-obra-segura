import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Bot, User, Send, X, Plus, Trash2, MessageCircle,
  Loader2, Wrench, ChevronLeft, ChevronRight,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Navigation } from '@/components/Navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';

type Msg = { role: 'user' | 'assistant'; content: string; pending?: boolean };

export default function Chat() {
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const t = (pt: string, en: string) => language === 'PT' ? pt : en;

  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [toolActive, setToolActive] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const { data: conversations = [] } = trpc.chat.conversations.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: convData } = trpc.chat.conversationMessages.useQuery(
    { conversationId: activeConvId! },
    { enabled: !!activeConvId, staleTime: 5_000 }
  );

  const createConv = trpc.chat.createConversation.useMutation({
    onSuccess: (data) => {
      utils.chat.conversations.invalidate();
      setActiveConvId(data.id);
      setMsgs([{
        role: 'assistant',
        content: t(
          'Olá! Sou o **Mestre de Obra Digital** do WikiBuild. Posso ajudar com materiais, ferramentas, normas e boas práticas de construção. O que você precisa saber?',
          'Hi! I\'m the **Digital Master Builder** of WikiBuild. I can help with materials, tools, standards and construction best practices. What do you need to know?',
        ),
      }]);
    },
  });

  const deleteConv = trpc.chat.deleteConversation.useMutation({
    onSuccess: () => {
      utils.chat.conversations.invalidate();
    },
  });

  useEffect(() => {
    if (convData) {
      const loaded: Msg[] = convData.messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));
      if (loaded.length === 0) {
        loaded.unshift({
          role: 'assistant',
          content: t(
            'Olá! Sou o **Mestre de Obra Digital** do WikiBuild. O que você precisa saber?',
            'Hi! I\'m the **Digital Master Builder** of WikiBuild. What do you need to know?',
          ),
        });
      }
      setMsgs(loaded);
    }
  }, [convData]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, toolActive]);

  useEffect(() => {
    if (!isAuthenticated) setLocation('/login');
  }, [isAuthenticated]);

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
        body: JSON.stringify({
          message: text,
          conversationId: activeConvId ?? undefined,
          language,
        }),
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: 'Error' }));
        setMsgs(prev => {
          const next = [...prev];
          next[next.length - 1] = { role: 'assistant', content: `⚠️ ${err.error ?? 'Error'}` };
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
              if (!activeConvId) setActiveConvId(evt.conversationId);
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
          } catch { /* ignore */ }
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

  function startNew() {
    setActiveConvId(null);
    setMsgs([{
      role: 'assistant',
      content: t(
        'Olá! Sou o **Mestre de Obra Digital** do WikiBuild. O que você precisa saber?',
        'Hi! I\'m the **Digital Master Builder** of WikiBuild. What do you need to know?',
      ),
    }]);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  function handleSelectConv(id: number) {
    if (id === activeConvId) return;
    setActiveConvId(id);
    setMsgs([]);
  }

  const suggestedQuestions = language === 'PT' ? [
    'Qual cimento usar para fundação de casa?',
    'Como calcular a quantidade de tijolos de uma parede?',
    'Qual fio elétrico usar para chuveiro 5500W?',
    'Quais EPIs são obrigatórios em obra?',
  ] : [
    'Which cement to use for house foundations?',
    'How to calculate the number of bricks for a wall?',
    'Which wire gauge for a 5500W shower?',
    'What PPE is mandatory on construction sites?',
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-1)', display: 'flex', flexDirection: 'column' }}>
      <Navigation />

      <div style={{ display: 'flex', flex: 1, paddingTop: '4rem', height: 'calc(100vh - 4rem)' }}>
        {/* Sidebar */}
        {sidebarOpen && (
          <aside style={{
            width: 260, borderRight: '1px solid var(--border)',
            background: 'var(--bg-2)', display: 'flex', flexDirection: 'column',
            flexShrink: 0, overflow: 'hidden',
          }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
              <button
                type="button"
                onClick={startNew}
                className="btn btn-sm"
                style={{
                  width: '100%', gap: 6,
                  background: 'var(--accent)', color: 'white', border: 'none',
                  justifyContent: 'center',
                }}
              >
                <Plus size={14} />
                {t('Nova conversa', 'New chat')}
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
              {conversations.length === 0 ? (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', textAlign: 'center', padding: '2rem 1rem' }}>
                  {t('Nenhuma conversa ainda.', 'No conversations yet.')}
                </p>
              ) : (
                (conversations as any[]).map(conv => (
                  <div
                    key={conv.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.5rem 0.625rem', borderRadius: 8, marginBottom: 2,
                      background: activeConvId === conv.id ? 'var(--accent-muted)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onClick={() => handleSelectConv(conv.id)}
                  >
                    <MessageCircle size={13} style={{ color: activeConvId === conv.id ? 'var(--accent)' : 'var(--text-subtle)', flexShrink: 0 }} />
                    <span style={{
                      flex: 1, fontSize: '0.8rem', color: activeConvId === conv.id ? 'var(--accent)' : 'var(--text)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {conv.title}
                    </span>
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); deleteConv.mutate({ conversationId: conv.id }); if (activeConvId === conv.id) startNew(); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--text-subtle)', opacity: 0.6, flexShrink: 0 }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </aside>
        )}

        {/* Toggle sidebar */}
        <button
          type="button"
          onClick={() => setSidebarOpen(o => !o)}
          style={{
            position: 'absolute', left: sidebarOpen ? 260 : 0, top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10, background: 'var(--bg-3)', border: '1px solid var(--border)',
            borderRadius: '0 6px 6px 0', padding: '0.5rem 0.25rem',
            cursor: 'pointer', color: 'var(--text-muted)',
          }}
        >
          {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>

        {/* Main chat area */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', maxWidth: 780, width: '100%', margin: '0 auto' }}>
            {msgs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 16, background: 'var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem',
                }}>
                  <Bot size={28} style={{ color: 'white' }} />
                </div>
                <h2 style={{ color: 'var(--text)', marginBottom: 8 }}>
                  {t('Mestre de Obra Digital', 'Digital Master Builder')}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>
                  {t('Especialista em materiais, ferramentas e normas de construção civil.', 'Specialist in construction materials, tools and standards.')}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem', justifyContent: 'center' }}>
                  {suggestedQuestions.map(q => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => { setInput(q); setTimeout(() => inputRef.current?.focus(), 50); }}
                      style={{
                        padding: '0.5rem 1rem', borderRadius: 999,
                        background: 'var(--bg-3)', border: '1px solid var(--border)',
                        color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              msgs.map((m, i) => (
                <div key={i} style={{
                  display: 'flex', gap: '0.75rem', marginBottom: '1.25rem',
                  flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 999, flexShrink: 0,
                    background: m.role === 'user' ? 'var(--accent)' : 'var(--bg-3)',
                    border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {m.role === 'user'
                      ? <User size={16} style={{ color: 'white' }} />
                      : <Bot size={16} style={{ color: 'var(--accent)' }} />}
                  </div>

                  <div style={{
                    maxWidth: '75%',
                    background: m.role === 'user' ? 'var(--accent)' : 'var(--bg-2)',
                    color: m.role === 'user' ? 'white' : 'var(--text)',
                    borderRadius: m.role === 'user' ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem', lineHeight: 1.7,
                    border: m.role === 'assistant' ? '1px solid var(--border)' : 'none',
                  }}>
                    {m.pending && m.content === '' ? (
                      <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center', color: 'var(--text-muted)' }}>
                        <Loader2 size={15} className="animate-spin" />
                        {toolActive ? (
                          <span style={{ fontSize: '0.8rem' }}>
                            <Wrench size={13} style={{ display: 'inline', marginRight: 4 }} />
                            {t('Buscando', 'Searching')} {toolActive.replace('search_', '').replace('_', ' ')}…
                          </span>
                        ) : t('digitando...', 'typing...')}
                      </span>
                    ) : (
                      <ReactMarkdown
                        components={{
                          a: ({ href, children }) => (
                            <a
                              href={href}
                              style={{ color: m.role === 'user' ? 'rgba(255,255,255,0.9)' : 'var(--accent)', textDecoration: 'underline' }}
                            >
                              {children}
                            </a>
                          ),
                          p: ({ children }) => <p style={{ margin: '0 0 0.5rem', lineHeight: 1.7 }}>{children}</p>,
                          ul: ({ children }) => <ul style={{ margin: '0.25rem 0 0.5rem', paddingLeft: '1.5rem' }}>{children}</ul>,
                          ol: ({ children }) => <ol style={{ margin: '0.25rem 0 0.5rem', paddingLeft: '1.5rem' }}>{children}</ol>,
                          li: ({ children }) => <li style={{ marginBottom: 4 }}>{children}</li>,
                          code: ({ children }) => (
                            <code style={{ background: 'rgba(0,0,0,0.25)', padding: '1px 5px', borderRadius: 4, fontSize: '0.8rem' }}>
                              {children}
                            </code>
                          ),
                          blockquote: ({ children }) => (
                            <blockquote style={{ borderLeft: '3px solid var(--accent)', paddingLeft: '0.75rem', margin: '0.5rem 0', color: 'var(--text-muted)' }}>
                              {children}
                            </blockquote>
                          ),
                          strong: ({ children }) => <strong style={{ fontWeight: 700 }}>{children}</strong>,
                        }}
                      >
                        {m.content}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
              ))
            )}
            {toolActive && msgs[msgs.length - 1]?.content !== '' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.5rem 2.75rem', color: 'var(--text-subtle)', fontSize: '0.75rem' }}>
                <Wrench size={12} />
                {t('Consultando', 'Querying')} WikiBuild {toolActive.replace('search_', '')}…
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div style={{
            padding: '1rem',
            borderTop: '1px solid var(--border)',
            background: 'var(--bg-2)',
          }}>
            <div style={{
              maxWidth: 780, margin: '0 auto',
              display: 'flex', gap: '0.75rem', alignItems: 'flex-end',
            }}>
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                disabled={streaming}
                placeholder={t('Pergunte sobre materiais, ferramentas, normas de construção...', 'Ask about materials, tools, construction standards...')}
                style={{
                  flex: 1, resize: 'none', background: 'var(--bg-3)', color: 'var(--text)',
                  border: '1px solid var(--border-strong)', borderRadius: 12,
                  padding: '0.75rem 1rem', fontSize: '0.9rem', lineHeight: 1.5,
                  maxHeight: 150, outline: 'none', fontFamily: 'inherit',
                  transition: 'border-color 0.15s',
                }}
              />
              {streaming ? (
                <button
                  type="button"
                  onClick={() => abortRef.current?.abort()}
                  style={{
                    width: 44, height: 44, borderRadius: 12, border: 'none', cursor: 'pointer',
                    background: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}
                >
                  <X size={18} style={{ color: 'white' }} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  style={{
                    width: 44, height: 44, borderRadius: 12, border: 'none',
                    cursor: input.trim() ? 'pointer' : 'not-allowed',
                    background: input.trim() ? 'var(--accent)' : 'var(--bg-3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    transition: 'background 0.15s',
                  }}
                >
                  <Send size={18} style={{ color: input.trim() ? 'white' : 'var(--text-subtle)' }} />
                </button>
              )}
            </div>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-subtle)', textAlign: 'center', marginTop: '0.5rem' }}>
              {t('IA pode cometer erros. Confirme informações críticas com profissional.', 'AI can make mistakes. Verify critical information with a professional.')}
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
