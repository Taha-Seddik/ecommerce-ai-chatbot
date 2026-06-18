'use client';

import { type KeyboardEvent as ReactKeyboardEvent, useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { IconBot, IconClose, IconSend, IconSparkles } from '@/components/ui/icons';
import { cn } from '@/lib/cn';
import { ChatMessage } from './chatMessage';
import { sendChatMessage } from './chat.actions';
import type { ChatProductCardData, ChatTurn } from './chat.types';

type UiMessage = {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  products?: ChatProductCardData[];
  seed?: boolean;
};

export function ChatWidget() {
  const t = useTranslations('chat');
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const idRef = useRef(0);
  const seededRef = useRef(false);
  const sendingRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const nextId = () => ++idRef.current;

  function close() {
    setOpen(false);
    launcherRef.current?.focus(); // return focus to the trigger (dialog focus management)
  }

  // Seed the greeting once, on first open (guarded against StrictMode double-invoke).
  useEffect(() => {
    if (open && !seededRef.current) {
      seededRef.current = true;
      setMessages([{ id: nextId(), role: 'assistant', text: t('greeting'), seed: true }]);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep the latest message in view; focus the input when opening.
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Esc closes the panel.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // Trap Tab focus within the open dialog.
  function onDialogKeyDown(e: ReactKeyboardEvent) {
    if (e.key !== 'Tab' || !dialogRef.current) return;
    const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  async function send(raw: string) {
    const text = raw.trim();
    if (!text || sendingRef.current) return; // synchronous guard — `loading` state lags a render behind
    sendingRef.current = true;
    setLoading(true);

    const userMsg: UiMessage = { id: nextId(), role: 'user', text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');

    const history: ChatTurn[] = next
      .filter((m) => !m.seed) // drop the canned greeting; the model gets only real turns
      .map((m) => ({ role: m.role, content: m.text }));

    try {
      const res = await sendChatMessage(history, locale);
      const text2 = res.ok
        ? res.text
        : res.kind === 'disabled'
          ? t('unavailable')
          : res.kind === 'rate_limited'
            ? t('rateLimited')
            : t('error');
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: 'assistant', text: text2, products: res.ok ? res.products : undefined },
      ]);
    } catch {
      setMessages((prev) => [...prev, { id: nextId(), role: 'assistant', text: t('error') }]);
    } finally {
      setLoading(false);
      sendingRef.current = false;
    }
  }

  const suggestions = [t('suggest1'), t('suggest2'), t('suggest3')];
  const showSuggestions = messages.length <= 1 && !loading;

  return (
    <div className='fixed bottom-6 inset-e-6 z-50 flex flex-col items-end gap-3 print:hidden'>
      {open && (
        <div
          ref={dialogRef}
          onKeyDown={onDialogKeyDown}
          role='dialog'
          aria-modal='true'
          aria-label={t('title')}
          className='bg-surface border-border shadow-lifted animate-in fade-in slide-in-from-bottom-4 flex h-[min(70vh,560px)] w-[calc(100vw-3rem)] max-w-[380px] flex-col overflow-hidden rounded-2xl border duration-200'>
          {/* Header */}
          <div className='bg-ink text-ink-foreground flex items-center gap-3 px-4 py-3'>
            <span className='bg-ink-foreground/10 grid size-9 place-items-center rounded-full'>
              <IconSparkles className='size-5' />
            </span>
            <span className='flex flex-1 flex-col leading-tight'>
              <span className='font-display font-semibold'>{t('title')}</span>
              <span className='text-ink-foreground/70 text-xs'>{t('subtitle')}</span>
            </span>
            <button
              type='button'
              onClick={close}
              aria-label={t('close')}
              className='hover:bg-ink-foreground/10 grid size-8 place-items-center rounded-full transition-colors'>
              <IconClose className='size-5' />
            </button>
          </div>

          {/* Messages (live region so screen readers hear new replies) */}
          <div
            ref={scrollRef}
            role='log'
            aria-live='polite'
            aria-relevant='additions'
            aria-atomic='false'
            aria-busy={loading}
            className='flex-1 space-y-3 overflow-y-auto p-4'>
            {messages.map((m) =>
              m.role === 'user' ? (
                <div key={m.id} className='flex justify-end'>
                  <p className='bg-accent text-accent-foreground max-w-[85%] rounded-2xl rounded-ee-md px-3.5 py-2 text-sm whitespace-pre-wrap'>
                    {m.text}
                  </p>
                </div>
              ) : (
                <div key={m.id} className='flex justify-start'>
                  <div className='bg-surface-secondary max-w-[90%] rounded-2xl rounded-es-md px-3.5 py-2.5'>
                    {/* Seed greeting is rendered from t() so it always matches the active locale. */}
                    <ChatMessage text={m.seed ? t('greeting') : m.text} products={m.products ?? []} onNavigate={close} />
                  </div>
                </div>
              ),
            )}

            {loading && (
              <div className='flex justify-start' role='status' aria-label={t('thinking')}>
                <div className='bg-surface-secondary flex gap-1 rounded-2xl rounded-es-md px-4 py-3'>
                  {[0, 150, 300].map((delay) => (
                    <span
                      key={delay}
                      className='bg-muted size-2 animate-bounce rounded-full'
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                  <span className='sr-only'>{t('thinking')}</span>
                </div>
              </div>
            )}

            {showSuggestions && (
              <div className='flex flex-wrap gap-2 pt-1'>
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type='button'
                    onClick={() => send(s)}
                    className='border-border hover:border-accent/50 hover:text-accent rounded-full border px-3 py-1.5 text-xs transition-colors'>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className='border-border flex items-end gap-2 border-t p-3'>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              rows={1}
              placeholder={t('placeholder')}
              aria-label={t('placeholder')}
              className='bg-surface-secondary max-h-24 min-h-10 flex-1 resize-none rounded-xl px-3 py-2.5 text-sm outline-none'
            />
            <button
              type='submit'
              disabled={!input.trim() || loading}
              aria-label={t('send')}
              className='bg-accent text-accent-foreground grid size-10 shrink-0 place-items-center rounded-xl transition-opacity disabled:opacity-40'>
              <IconSend className='size-5 rtl:-scale-x-100' />
            </button>
          </form>
          <p className='text-muted pb-2 text-center text-[10px]'>{t('poweredBy')}</p>
        </div>
      )}

      {/* Launcher — round bot button with a soft colour glow orbiting it (closed) / X (open) */}
      <div className='relative'>
        {!open && <span aria-hidden className='bot-glow pointer-events-none absolute -inset-1.5 rounded-full' />}
        <button
          ref={launcherRef}
          type='button'
          onClick={() => (open ? close() : setOpen(true))}
          aria-label={open ? t('close') : t('launch')}
          aria-expanded={open}
          className={cn(
            'bg-ink shadow-lifted relative z-10 grid size-14 place-items-center rounded-full ring-1 ring-white/10 transition-transform duration-200 hover:scale-105 active:scale-95',
            open && 'animate-in zoom-in-90 duration-200',
          )}>
          {open ? (
            <IconClose className='size-5 text-white' />
          ) : (
            <IconBot className='size-7 text-[#5eead4]' />
          )}
        </button>
      </div>
    </div>
  );
}
