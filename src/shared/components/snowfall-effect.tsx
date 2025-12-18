'use client';

import Snowfall from 'react-snowfall';

export function SnowfallEffect() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 50,
        pointerEvents: 'none',
      }}
    >
      <Snowfall
        snowflakeCount={200}
        radius={[0.5, 2.5]}
        speed={[0.5, 2.5]}
        wind={[-0.5, 1.5]}
        color="#fff" // Simple white snow, or could use images
      />
    </div>
  );
}
