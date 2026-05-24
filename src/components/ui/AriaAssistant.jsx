import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import './AriaAssistant.css';

function AriaAssistant({ className = '' }) {
  return (
    <div className={`aria-stage ${className}`}>
      <div className="aria-robot">
        <DotLottieReact
          src="https://lottie.host/118804df-eae7-4132-9a79-d156fcb87830/lsn7KsaUVI.lottie"
          loop
          autoplay
          style={{ width: '220px', height: '220px' }}
        />
      </div>
      
      <div className="aria-label">
        <strong>DRACO</strong>
        <span>AI Workspace Guardian</span>
      </div>
    </div>
  );
}

export default AriaAssistant;
