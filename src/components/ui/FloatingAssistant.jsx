import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './FloatingAssistant.css';
import LottieAssistant from './LottieAssistant.jsx';
import { useAuth } from '../../auth/useAuth.js';
import { useRoleAccess } from '../../auth/useRoleAccess.js';
import { useTheme } from '../../theme/useTheme.js';
import { buildSystemPrompt, sendMessageToNvidia } from '../../services/aiService.js';

export default function FloatingAssistant() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { profile } = useAuth();
  const { currentRole } = useRoleAccess();
  const { setTheme } = useTheme();

  const [greeting, setGreeting]     = useState(false);
  const [chatOpen, setChatOpen]      = useState(false);
  const [message, setMessage]        = useState('');
  const [isTyping, setIsTyping]      = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const chatEndRef = useRef(null);

  const userName = profile?.name || profile?.preferred_username || 'there';

  // Dynamic greeting based on role + page
  const getGreeting = () => {
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    const roleGreets = {
      manager:       `${timeOfDay}, ${userName}! I'm DRACO. I can help you manage projects, review SLAs, and oversee your team.`,
      chef_de_projet:`${timeOfDay}, ${userName}! I'm DRACO. I'm here to help you supervise your projects and coordinate your developers.`,
      developer:     `${timeOfDay}, ${userName}! I'm DRACO. I can help you find your tasks and track project progress.`,
    };
    return roleGreets[currentRole] || `${timeOfDay}! I'm DRACO, your workspace guardian. How can I help?`;
  };

  // Reset chat with contextual greeting when chat opens
  useEffect(() => {
    if (chatOpen) {
      setChatHistory([{ role: 'assistant', text: getGreeting() }]);
    }
  }, [chatOpen, currentRole]);

  // Initial pop-up greeting
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!chatOpen) {
        setGreeting(true);
        setTimeout(() => setGreeting(false), 4000);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Page-change hint
  useEffect(() => {
    if (chatOpen && chatHistory.length > 1) {
      const pageHints = {
        '/projects':     '📁 You just navigated to Projects. Ask me about project statuses or deadlines!',
        '/tasks':        '✅ You\'re on Tasks. I can help you understand task priorities or workflows.',
        '/sla-projects': '📊 SLA Projects — I can explain how SLA tracking works if you need.',
        '/chefs':        '👥 Chefs de Projet list. Need to look up a specific team lead?',
        '/developers':   '💻 Developer roster. Ask me about assigning developers to projects.',
      };
      const hint = pageHints[location.pathname];
      if (hint) {
        setChatHistory(prev => [...prev, { role: 'assistant', text: hint }]);
      }
    }
  }, [location.pathname]);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isTyping]);

  const toggleChat = (e) => {
    e.stopPropagation();
    setChatOpen(prev => !prev);
    setGreeting(false);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || isTyping) return;

    const userMsg = { role: 'user', text: message };
    const updatedHistory = [...chatHistory, userMsg];
    setChatHistory(updatedHistory);
    setMessage('');
    setIsTyping(true);

    // Add an empty assistant bubble that we'll stream into
    setChatHistory(prev => [...prev, { role: 'assistant', text: '' }]);

    try {
      const systemPrompt = buildSystemPrompt({
        currentPage: location.pathname,
        userRole:    currentRole,
        userName,
      });

      const resultText = await sendMessageToNvidia({
        messages:     updatedHistory,
        systemPrompt,
        // Each token: update the last bubble in place
        onChunk: (partialText) => {
          setChatHistory(prev => {
            const next = [...prev];
            next[next.length - 1] = { role: 'assistant', text: partialText };
            return next;
          });
        },
      });

      // --- ACTION PARSING ---
      if (resultText.includes('[ACTION:THEME:noir]')) {
        setTimeout(() => setTheme('noir'), 500);
      } else if (resultText.includes('[ACTION:THEME:cloud]')) {
        setTimeout(() => setTheme('cloud'), 500);
      }

      if (resultText.includes('[ACTION:NAV:PROJECT_CREATE]')) {
        setTimeout(() => navigate('/projects/create'), 1000);
      }
    } catch (err) {
      console.error('DRACO AI Error:', err);
      
      // --- LOCAL COMMAND FALLBACK ---
      const msgLower = message.toLowerCase();
      let localResponse = null;

      if (msgLower.includes('noir') || msgLower.includes('dark')) {
        setTheme('noir');
        localResponse = "Bien sûr ! Je passe le thème en Noir pour vous. 🌑";
      } else if (msgLower.includes('light') || msgLower.includes('clair')) {
        setTheme('cloud');
        localResponse = "Pas de problème, voici le thème Clair. ☀️";
      } else if (msgLower.includes('projet') || msgLower.includes('create')) {
        navigate('/projects/create');
        localResponse = "J'ouvre la page de création de projet immédiatement. 📁";
      } else if (msgLower.includes('help') || msgLower.includes('aide') || msgLower.includes('do here') || msgLower.includes('faire ici')) {
        localResponse = "Je suis DRACO ! Je peux vous aider à gérer vos projets, vos tâches et votre équipe. Vous pouvez aussi me demander de changer le thème ou d'ouvrir des pages spécifiques.";
      } else if (msgLower.includes('hello') || msgLower.includes('bonjour') || msgLower.includes('salut')) {
        localResponse = `Bonjour ${profile?.name || ''} ! Comment puis-je vous aider aujourd'hui ? 🐉`;
      }

      if (localResponse) {
        setChatHistory(prev => {
          const next = [...prev];
          next[next.length - 1] = { role: 'assistant', text: localResponse };
          return next;
        });
        setIsTyping(false);
        return;
      }

      // If no local command match, show standard fallback
      const fallbacks = {
        '/projects':     '📁 Connection issue. Check the Projects page for status and deadline columns.',
        '/tasks':        '✅ Connection issue! Tip: validate your tasks so your manager can mark them complete.',
        '/sla-projects': "📊 Can't connect. SLA projects track service agreements — check the expiry dates column.",
        '/':             '⚠️ Connection issue! From the Dashboard you can navigate to Projects, Tasks, or SLA tracking.',
      };
      const pageKey = Object.keys(fallbacks).find(k => location.pathname.startsWith(k)) || '/';
      const fallback = fallbacks[pageKey];
      setChatHistory(prev => {
        const next = [...prev];
        next[next.length - 1] = { role: 'assistant', text: fallback };
        return next;
      });
    } finally {
      setIsTyping(false);
    }
  };

  // Suggested quick questions based on current page & role
  const getSuggestions = () => {
    const base = {
      '/':          ['What can I do here?', 'Show my projects', 'How does SLA work?'],
      '/projects':  ['What\'s the project status?', 'How do I create a project?', 'Who manages this project?'],
      '/tasks':     ['How do I validate a task?', 'What tasks are pending?', 'How do I create a task?'],
      '/sla-projects': ['What is SLA?', 'How do I update an SLA?', 'Show critical SLAs'],
      '/chefs':     ['What does a chef de projet do?', 'How to assign a chef?'],
      '/developers':['How to add a developer?', 'How to assign to a project?'],
    };
    const pageKey = Object.keys(base).find(k => location.pathname.startsWith(k)) || '/';
    return base[pageKey] || base['/'];
  };

  return (
    <div className={`floating-assistant-container ${chatOpen ? 'chat-active' : ''}`}>
      {chatOpen && (
        <div className="assistant-chat-panel">
          <div className="chat-header">
            <div className="chat-status-dot" />
            <span>DRACO — AI Assistant</span>
            <span className="chat-page-badge">{location.pathname === '/' ? 'Dashboard' : location.pathname.replace('/', '')}</span>
            <button className="chat-close" onClick={toggleChat}>×</button>
          </div>

          <div className="chat-messages">
            {chatHistory.map((msg, i) => (
              <div key={i} className={`chat-bubble ${msg.role}`}>
                {msg.role === 'assistant' && <span className="bubble-icon">🐉</span>}
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <div className="chat-bubble assistant typing-indicator">
                <span className="bubble-icon">🐉</span>
                <span className="dot" /><span className="dot" /><span className="dot" />
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick suggestions */}
          {chatHistory.length <= 1 && (
            <div className="chat-suggestions">
              {getSuggestions().map((s, i) => (
                <button key={i} className="suggestion-chip" onClick={() => {
                  setMessage(s);
                }}>
                  {s}
                </button>
              ))}
            </div>
          )}

          <form className="chat-input-area" onSubmit={handleSend}>
            <input
              type="text"
              placeholder={isTyping ? 'DRACO is thinking...' : 'Ask me anything...'}
              value={message}
              onChange={e => setMessage(e.target.value)}
              disabled={isTyping}
              autoFocus
            />
            <button type="submit" disabled={isTyping || !message.trim()}>
              {isTyping ? '...' : '→'}
            </button>
          </form>
        </div>
      )}

      {!chatOpen && greeting && (
        <div className="assistant-speech-bubble">
          {`Hi ${userName}! I'm DRACO, your workspace guardian. Click me! 🐉`}
        </div>
      )}

      <LottieAssistant isOpen={chatOpen} onClick={toggleChat} />
    </div>
  );
}
