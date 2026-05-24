import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, Briefcase, CheckSquare, Users, UserCheck, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const commands = [
    { id: 'dash', label: 'Go to Dashboard', icon: Command, action: () => navigate('/') },
    { id: 'proj', label: 'View Projects', icon: Briefcase, action: () => navigate('/projects') },
    { id: 'tasks', label: 'My Tasks', icon: CheckSquare, action: () => navigate('/tasks') },
    { id: 'devs', label: 'Browse Developers', icon: Users, action: () => navigate('/developers') },
    { id: 'chefs', label: 'Contact Chefs', icon: UserCheck, action: () => navigate('/chefs') },
  ];

  const filtered = commands.filter(cmd => 
    cmd.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose(!isOpen);
      }
      if (e.key === 'Escape') onClose(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            className="command-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onClose(false)}
          />
          <motion.div 
            className="command-dialog"
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
          >
            <div className="command-input-wrapper">
              <Search className="command-search-icon" size={20} />
              <input 
                type="text" 
                placeholder="Type a command or search..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
              <div className="command-kb-badge">ESC</div>
            </div>

            <div className="command-results">
              {filtered.length > 0 ? (
                filtered.map(cmd => (
                  <button 
                    key={cmd.id} 
                    className="command-item"
                    onClick={() => {
                      cmd.action();
                      onClose(false);
                    }}
                  >
                    <cmd.icon size={18} />
                    <span>{cmd.label}</span>
                    <span className="command-item-hint">Jump to</span>
                  </button>
                ))
              ) : (
                <div className="command-empty">No results found for "{query}"</div>
              )}
            </div>

            <div className="command-footer">
              <span>Tip: Use <kbd>Ctrl</kbd> + <kbd>K</kbd> to open this from anywhere</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
