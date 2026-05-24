import React from 'react';
import './ImageAiCore.css';

export default function ImageAiCore({ isOpen, onClick }) {
  return (
    <div className={`image-ai-core-container ${isOpen ? 'is-open' : 'is-closed'}`} onClick={onClick}>
      <div className="core-visual-wrapper">
        <img
          src="/assistant-core.png"
          alt="AI Core"
          className="core-static-img"
        />
        <div className="core-glow-effect" />
      </div>
    </div>
  );
}
            >
  <img
    src="/core-closed-black.png"
    alt="AI Core Closed"
    className="core-img-blend"
  />
            </motion.div >
          ) : (
  <motion.div
    key="open"
    className="core-frame open-state"
    initial={{ rotateY: -180, opacity: 0, scale: 1.2 }}
    animate={{ rotateY: 0, opacity: 1, scale: 1 }}
    exit={{ rotateY: 180, opacity: 0, scale: 0.8 }}
    transition={{ duration: 0.6, ease: "circOut" }}
  >
    <img
      src="/core-open-black.png"
      alt="AI Core Open"
      className="core-img-blend"
    />

    {/* Fake orbiting pieces using copies of the image with masking */}
    <div className="orbiting-fragments">
      <div className="fragment frag-1" />
      <div className="fragment frag-2" />
      <div className="fragment frag-3" />
    </div>
  </motion.div>
)}
        </AnimatePresence >

  <div className="core-energy-glow" />
      </div >
    </div >
  );
}
