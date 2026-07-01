'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ArrowPathIcon, PaperAirplaneIcon, TrashIcon } from '@heroicons/react/24/solid';
import type { ChatMessage } from '@/lib/types';

export function CoachChat({
  messages,
  loading,
  onSend,
  onClear,
}: {
  messages: ChatMessage[];
  loading: boolean;
  onSend: (message: string) => Promise<void>;
  onClear: () => Promise<void>;
}) {
  const [message, setMessage] = useState('');

  return (
    <section className="card chat-shell">
      <div className="section-header">
        <div>
          <span className="pill">AI coach</span>
          <h3>Ask for training, food, or recovery advice</h3>
          <p>The coach responds in simple markdown and keeps your chat history in the local store.</p>
        </div>
        <button type="button" className="button button-secondary" onClick={onClear}>
          <TrashIcon className="icon icon--small" />
          Clear chat
        </button>
      </div>

      <div className="chat-messages">
        {messages.map((entry) => (
          <div key={entry.id} className={`message message--${entry.sender}`}>
            <span className="message__meta">
              {entry.sender === 'user' ? 'You' : 'Coach'} -{' '}
              {new Date(entry.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            <div className="message__bubble">
              {entry.sender === 'ai' ? <ReactMarkdown>{entry.text}</ReactMarkdown> : <p>{entry.text}</p>}
            </div>
          </div>
        ))}

        {loading && (
          <div className="message message--ai">
            <span className="message__meta">Coach - thinking</span>
            <div className="message__bubble">
              <ArrowPathIcon className="icon icon--spin" />
            </div>
          </div>
        )}
      </div>

      <form
        className="input-row"
        onSubmit={async (event) => {
          event.preventDefault();
          const trimmed = message.trim();
          if (!trimmed) return;
          setMessage('');
          await onSend(trimmed);
        }}
      >
        <input
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Ask for a split, meal idea, or recovery advice..."
        />
        <button type="submit" className="button button-primary" disabled={loading || !message.trim()}>
          {loading ? (
            <ArrowPathIcon className="icon icon--small icon--spin" />
          ) : (
            <PaperAirplaneIcon className="icon icon--small" />
          )}
          Send
        </button>
      </form>
    </section>
  );
}

