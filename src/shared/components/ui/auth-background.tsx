import React from 'react';

export const AuthBackground = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black overflow-x-hidden relative">
      {/* Background Ambient Noise/Gradient (Subtle) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] bg-white opacity-[0.03] blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] bg-gray-500 opacity-[0.05] blur-[100px] rounded-full"></div>
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">{children}</div>
    </div>
  );
};
