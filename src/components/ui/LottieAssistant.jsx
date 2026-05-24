import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function LottieAssistant({ isOpen, onClick }) {
  return (
    <div
      className={`lottie-assistant-wrapper ${isOpen ? 'active' : ''}`}
      onClick={onClick}
      title="DRACO — AI Assistant"
      style={{
        width: '90px',
        height: '90px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        borderRadius: '50%',
        background: 'rgba(14,165,233,0.08)',
        border: '2px solid rgba(14,165,233,0.25)',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 4px 20px rgba(14,165,233,0.2)',
      }}
    >
      <DotLottieReact
        src="https://lottie.host/118804df-eae7-4132-9a79-d156fcb87830/lsn7KsaUVI.lottie"
        loop
        autoplay
        style={{ width: '100%', height: '100%' }}
      />

      {/* Pulse ring */}
      <div style={{
        position: 'absolute',
        inset: '-4px',
        borderRadius: '50%',
        border: '2px solid rgba(14,165,233,0.4)',
        animation: 'dracoRing 2s ease-in-out infinite',
        pointerEvents: 'none',
      }} />

      <style>{`
        @keyframes dracoRing {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50%       { opacity: 0;   transform: scale(1.25); }
        }
        .lottie-assistant-wrapper {
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
                      box-shadow 0.25s ease;
        }
        .lottie-assistant-wrapper:hover {
          transform: scale(1.08);
          box-shadow: 0 8px 28px rgba(14,165,233,0.45);
        }
        .lottie-assistant-wrapper.active {
          transform: scale(1.05);
          box-shadow: 0 8px 32px rgba(14,165,233,0.55);
        }
      `}</style>
    </div>
  );
}
