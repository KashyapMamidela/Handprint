import { forwardRef } from 'react';

// The interactive 3D handprint from Landing.dc.html's hero — a palm plus five
// fingers, each an absolutely positioned div with its own gradient/shadow and
// Z-depth. The wrapper ref receives the mousemove-driven rotateX/rotateY tilt
// from useTilt; each shape keeps its own fixed transform so the whole mark
// reads as one solid object under `transform-style: preserve-3d`.
const HandprintMark = forwardRef(function HandprintMark(_props, ref) {
  return (
    <div
      ref={ref}
      style={{ transformStyle: 'preserve-3d', transition: 'transform 0.15s ease-out' }}
      className="relative h-[340px] w-[340px]"
    >
      {/* palm */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '56%',
          width: 180,
          height: 200,
          transform: 'translate(-50%,-50%) translateZ(10px)',
          borderRadius: '70px 70px 60px 60px',
          background: 'linear-gradient(155deg,#f3d98a,#d4af37 55%,#a8802a)',
          boxShadow: '0 30px 60px -20px rgba(212,175,55,0.4), inset 0 2px 4px rgba(255,255,255,0.5)',
        }}
      />
      {/* thumb */}
      <div
        style={{
          position: 'absolute',
          left: '26%',
          top: '16%',
          width: 40,
          height: 110,
          transform: 'translateZ(26px) rotate(-6deg)',
          borderRadius: 20,
          background: 'linear-gradient(155deg,#f6e0a0,#d4af37)',
          boxShadow: 'inset 0 2px 3px rgba(255,255,255,0.55),0 10px 18px -8px rgba(0,0,0,0.4)',
        }}
      />
      {/* index finger */}
      <div
        style={{
          position: 'absolute',
          left: '40%',
          top: '6%',
          width: 40,
          height: 130,
          transform: 'translateZ(30px) rotate(-2deg)',
          borderRadius: 20,
          background: 'linear-gradient(155deg,#f6e0a0,#d4af37)',
          boxShadow: 'inset 0 2px 3px rgba(255,255,255,0.55),0 10px 18px -8px rgba(0,0,0,0.4)',
        }}
      />
      {/* middle finger */}
      <div
        style={{
          position: 'absolute',
          left: '54%',
          top: '5%',
          width: 40,
          height: 132,
          transform: 'translateZ(30px) rotate(2deg)',
          borderRadius: 20,
          background: 'linear-gradient(155deg,#f6e0a0,#d4af37)',
          boxShadow: 'inset 0 2px 3px rgba(255,255,255,0.55),0 10px 18px -8px rgba(0,0,0,0.4)',
        }}
      />
      {/* ring finger */}
      <div
        style={{
          position: 'absolute',
          left: '68%',
          top: '14%',
          width: 38,
          height: 108,
          transform: 'translateZ(24px) rotate(7deg)',
          borderRadius: 19,
          background: 'linear-gradient(155deg,#f6e0a0,#d4af37)',
          boxShadow: 'inset 0 2px 3px rgba(255,255,255,0.55),0 10px 18px -8px rgba(0,0,0,0.4)',
        }}
      />
      {/* pinky */}
      <div
        style={{
          position: 'absolute',
          left: '6%',
          top: '46%',
          width: 34,
          height: 78,
          transform: 'translateZ(14px) rotate(-32deg)',
          borderRadius: 17,
          background: 'linear-gradient(155deg,#f6e0a0,#d4af37)',
          boxShadow: 'inset 0 2px 3px rgba(255,255,255,0.55),0 8px 14px -6px rgba(0,0,0,0.4)',
        }}
      />
      {/* palm highlight */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '60%',
          width: 120,
          height: 80,
          transform: 'translate(-50%,-50%) translateZ(34px)',
          borderRadius: 60,
          background: 'radial-gradient(circle at 35% 30%,rgba(255,255,255,0.55),transparent 60%)',
        }}
      />
    </div>
  );
});

export default HandprintMark;
