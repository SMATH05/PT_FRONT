import React from 'react';
import './AiCore.css';

export default function AiCore({ isOpen = false, onClick }) {
  return (
    <div className={`ai-core-container ${isOpen ? 'is-open' : 'is-closed'}`} onClick={onClick}>
      <div className="ai-core-stage">
        {/* The central energy sphere */}
        <div className="energy-sphere">
          <div className="energy-pulse" />
        </div>

        {/* The mechanical fragments */}
        <div className="shell-fragment fragment-top" />
        <div className="shell-fragment fragment-bottom" />
        <div className="shell-fragment fragment-left" />
        <div className="shell-fragment fragment-right" />
        <div className="shell-fragment fragment-front" />
        <div className="shell-fragment fragment-back" />
        
        {/* Particle rings */}
        <div className="energy-ring ring-1" />
        <div className="energy-ring ring-2" />
      </div>
    </div>
  );
}
