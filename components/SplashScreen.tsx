

import React from 'react';

const SplashScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mb-4">
          GujjarGPT
        </h1>
        <div className="flex justify-center items-center space-x-2">
            <div className="w-4 h-4 border-2 border-cyan-400 rounded-full animate-spin" style={{animationDuration: '1s'}}></div>
            <p className="text-lg text-gray-400">Initializing...</p>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;