'use client';

import dynamic from 'next/dynamic';

const Threads = dynamic(() => import('@/shared/components/Threads'), {
  ssr: false,
});

export function ThreadsBackground() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
      }}
    >
      <Threads amplitude={1} distance={0} enableMouseInteraction={true} />
    </div>
  );
}
