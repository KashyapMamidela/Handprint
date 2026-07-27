import { useCallback, useEffect, useRef } from 'react';

function applyTilt(el, e, { rotateX, rotateY, perspective, extraTransform, hoverShadow }) {
  const r = el.getBoundingClientRect();
  const px = (e.clientX - r.left) / r.width - 0.5;
  const py = (e.clientY - r.top) / r.height - 0.5;
  const rx = (-py * rotateX).toFixed(2);
  const ry = (px * rotateY).toFixed(2);
  const persp = perspective ? `perspective(${perspective}px) ` : '';
  el.style.transform = `${persp}rotateX(${rx}deg) rotateY(${ry}deg)${extraTransform ? ` ${extraTransform}` : ''}`;
  if (hoverShadow) el.style.boxShadow = hoverShadow;
}

/**
 * Mousemove-driven 3D tilt, matching the math in the .dc.html prototypes.
 * By default listens and applies the transform to the same element (Dashboard
 * stat cards). Pass `targetRef` to listen on one element and tilt another
 * (the Landing hero handprint, which listens on the whole hero section).
 */
export function useTilt({
  rotateX = 8,
  rotateY = 8,
  perspective = null,
  extraTransform = '',
  resetTransform = null,
  resetShadow = null,
  hoverShadow = null,
  targetRef = null,
} = {}) {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    const target = targetRef?.current ?? host;
    if (!host || !target) return undefined;

    const onMove = (e) => applyTilt(target, e, { rotateX, rotateY, perspective, extraTransform, hoverShadow });
    const onLeave = () => {
      if (resetTransform !== null) target.style.transform = resetTransform;
      if (resetShadow !== null) target.style.boxShadow = resetShadow;
    };

    host.addEventListener('mousemove', onMove);
    if (resetTransform !== null || resetShadow !== null) host.addEventListener('mouseleave', onLeave);

    return () => {
      host.removeEventListener('mousemove', onMove);
      host.removeEventListener('mouseleave', onLeave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rotateX, rotateY, perspective, extraTransform, resetTransform, resetShadow, hoverShadow, targetRef]);

  return hostRef;
}

/**
 * For lists rendered from data (Drives grid) where each card needs its own
 * listener attached via a ref callback, mirroring the prototype's
 * `getCardRef` + WeakSet-dedup pattern.
 */
export function useCardTiltCallback({
  rotateX = 9,
  rotateY = 9,
  perspective = 900,
  extraTransform = 'translateY(-4px)',
  hoverShadow = null,
  resetTransform = 'rotateX(0deg) rotateY(0deg)',
  resetShadow = null,
} = {}) {
  const attached = useRef(new WeakSet());

  return useCallback(
    (el) => {
      if (!el || attached.current.has(el)) return;
      attached.current.add(el);
      el.addEventListener('mousemove', (e) =>
        applyTilt(el, e, { rotateX, rotateY, perspective, extraTransform, hoverShadow })
      );
      el.addEventListener('mouseleave', () => {
        el.style.transform = `perspective(${perspective}px) ${resetTransform}`;
        if (resetShadow !== null) el.style.boxShadow = resetShadow;
      });
    },
    [rotateX, rotateY, perspective, extraTransform, hoverShadow, resetTransform, resetShadow]
  );
}
