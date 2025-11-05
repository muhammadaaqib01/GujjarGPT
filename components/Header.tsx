

import React from 'react';

interface HeaderProps {
  onToggleHistory: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleHistory }) => {
  return (
    <header className="relative bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50 p-4 text-center sticky top-0 z-10 flex items-center justify-center">
       <button 
        onClick={onToggleHistory} 
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full text-gray-400 hover:bg-gray-700/60 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
        aria-label="Toggle chat history"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div>
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
          GujjarGPT
        </h1>
        <p className="text-sm text-gray-400">Powered by Ch Aqib</p>
      </div>
    </header>
  );
};

export default Header;