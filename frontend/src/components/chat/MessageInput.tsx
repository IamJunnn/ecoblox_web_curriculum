'use client';

import { useState, useRef, KeyboardEvent } from 'react';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onStartTyping: () => void;
  onStopTyping: () => void;
  disabled?: boolean;
}

export function MessageInput({
  onSendMessage,
  onStartTyping,
  onStopTyping,
  disabled = false,
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isTypingRef = useRef(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);

    // Start typing indicator
    if (value.trim() && !isTypingRef.current) {
      onStartTyping();
      isTypingRef.current = true;
    }

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed || disabled) return;

    onSendMessage(trimmed);
    setMessage('');
    onStopTyping();
    isTypingRef.current = false;

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Focus back on input
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleBlur = () => {
    // Stop typing indicator when input loses focus
    if (isTypingRef.current) {
      onStopTyping();
      isTypingRef.current = false;
    }
  };

  return (
    <div className="border-t bg-white p-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder="Type a message..."
            disabled={disabled}
            rows={1}
            className="w-full px-4 py-3 pr-2 border border-gray-300 rounded-2xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 resize-none max-h-32 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900 placeholder:text-gray-400 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#d1d5db transparent'
            }}
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className="flex-shrink-0 h-12 px-6 bg-green-500 text-white rounded-2xl hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
            />
          </svg>
          Send
        </button>
      </div>

      <div className="mt-2 text-xs text-gray-600">
        Press Enter to send, Shift+Enter for new line
      </div>
    </div>
  );
}
