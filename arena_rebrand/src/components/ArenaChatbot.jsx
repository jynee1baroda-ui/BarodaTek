import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Minimal client-side HTML sanitizer for chatbot messages.
// Keeps a small, conservative whitelist to avoid XSS when
// using dangerouslySetInnerHTML. This mirrors the project's
// public/dom-utils.js approach but kept local to this component
// to avoid build/import complications.
function sanitizeHTML(html) {
  if (!html) return '';
  const allowedTags = [
    'div','span','p','a','strong','em','b','i','u','br','hr',
    'h1','h2','h3','h4','h5','h6','ul','ol','li','pre','code'
  ];
  const allowedAttrs = ['class', 'id', 'href', 'title', 'alt', 'src', 'rel', 'target'];

  const temp = document.createElement('div');
  temp.innerHTML = html;

  // Remove dangerous elements
  const blocked = temp.querySelectorAll('script, style, iframe, object, embed');
  blocked.forEach(el => el.remove());

  const all = temp.querySelectorAll('*');
  all.forEach(el => {
    const tag = el.tagName.toLowerCase();
    if (!allowedTags.includes(tag)) {
      // Replace element with its children (strip the tag)
      while (el.firstChild) el.parentNode.insertBefore(el.firstChild, el);
      el.parentNode.removeChild(el);
      return;
    }

    // Remove unsafe attributes
    Array.from(el.attributes).forEach(attr => {
      const name = attr.name.toLowerCase();
      const value = attr.value || '';
      if (!allowedAttrs.includes(name) && !name.startsWith('data-')) {
        el.removeAttribute(attr.name);
        return;
      }
      // strip javascript: and data:text/html URIs
      if (typeof value === 'string' && (value.toLowerCase().includes('javascript:') || value.toLowerCase().includes('data:text/html'))) {
        el.removeAttribute(attr.name);
      }
    });
  });

  return temp.innerHTML;
}

export default function ArenaChatbot({ isDisabled = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: '👋 <strong>BarodaTek AI Arena Copilot</strong><br/>How can I help you dominate today, Champion?'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const quickReplies = [
    { id: 'api', icon: '⚡', text: 'Generate API', category: 'Code' },
    { id: 'game', icon: '🎮', text: 'Play Arena Game', category: 'Tools' },
    { id: 'tool', icon: '🛠️', text: 'Launch Dev Tool', category: 'Tools' },
    { id: 'quote', icon: '💼', text: 'Request Quote', category: 'Business' }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleQuickReply = (reply) => {
    if (isDisabled) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: reply.text
    };

    let botResponse = '';
    switch (reply.id) {
      case 'api':
        botResponse = '🔧 <strong>API Generator Activated!</strong><br/>Navigate to <a href="/coding" class="text-arena-red underline">Coding Arena</a> to start building your API with our interactive tools.';
        break;
      case 'game':
        botResponse = '🎮 <strong>Game Mode Ready!</strong><br/>Check out <a href="/games" class="text-arena-red underline">Arena Games</a> to level up your skills through interactive challenges.';
        break;
      case 'tool':
        botResponse = '🛠️ <strong>Developer Tools Unlocked!</strong><br/>Access our full toolkit in the <a href="/coding" class="text-arena-red underline">Coding Arena</a> - formatters, encoders, and more!';
        break;
      case 'quote':
        botResponse = '💼 <strong>Enterprise Inquiry Received!</strong><br/>Visit our <a href="/appeal" class="text-arena-red underline">Arena Appeal</a> page or contact us at <strong>enterprise@barodatek.com</strong> for custom solutions.';
        break;
      default:
        botResponse = '🤔 Interesting choice, Champion. How else can I assist you?';
    }

    const botMessage = {
      id: messages.length + 2,
      type: 'bot',
      text: botResponse
    };

    setMessages([...messages, userMessage, botMessage]);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isDisabled) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: inputValue
    };

    const botMessage = {
      id: messages.length + 2,
      type: 'bot',
      text: '🤖 I\'m currently in training mode! Use the quick-reply buttons above for instant assistance, or explore the Arena to unleash your full potential.'
    };

    setMessages([...messages, userMessage, botMessage]);
    setInputValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        disabled={isDisabled}
        className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-lg transition-all ${
          isDisabled
            ? 'bg-gray-600 cursor-not-allowed opacity-50'
            : 'bg-arena-red hover:shadow-arena-red-glow'
        }`}
        aria-label={isOpen ? 'Close chatbot' : 'Open chatbot'}
        aria-expanded={isOpen}
      >
        {isOpen ? '✖️' : '💬'}
      </motion.button>

      {/* Chatbot Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[500px] bg-arena-black border-2 border-arena-red rounded-lg shadow-2xl flex flex-col"
            onKeyDown={handleKeyDown}
            role="dialog"
            aria-labelledby="chatbot-title"
            aria-modal="true"
          >
            {/* Header */}
            <div className="bg-arena-red p-4 rounded-t-lg flex items-center justify-between">
              <div>
                <h3 id="chatbot-title" className="font-bold text-lg">
                  🤖 ARENA COPILOT
                </h3>
                <p className="text-xs opacity-90">
                  {isDisabled ? 'Offline' : 'Online and Ready'}
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-black transition-colors"
                aria-label="Close chatbot"
              >
                ✖️
              </button>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-3"
              aria-live="polite"
              aria-atomic="false"
              role="log"
            >
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: msg.type === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.type === 'user'
                        ? 'bg-arena-red text-white'
                        : 'bg-gray-800 text-gray-100'
                    }`}
                    dangerouslySetInnerHTML={{ __html: sanitizeHTML(msg.text) }}
                  />
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            {!isDisabled && (
              <div className="px-4 py-2 border-t border-gray-700">
                <p className="text-xs text-gray-400 mb-2">Quick Actions:</p>
                <div className="grid grid-cols-2 gap-2">
                  {quickReplies.map((reply) => (
                    <button
                      key={reply.id}
                      onClick={() => handleQuickReply(reply)}
                      className="bg-gray-800 hover:bg-arena-red transition-colors p-2 rounded text-sm flex items-center gap-2"
                      aria-label={`${reply.category}: ${reply.text}`}
                    >
                      <span>{reply.icon}</span>
                      <span className="truncate">{reply.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={isDisabled ? 'Offline...' : 'Type a message...'}
                  disabled={isDisabled}
                  className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-arena-red disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Chat message input"
                />
                <button
                  type="submit"
                  disabled={isDisabled || !inputValue.trim()}
                  className="bg-arena-red hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-colors"
                  aria-label="Send message"
                >
                  ➤
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
