import React from 'react';
import type { ChatSession, UserProfile } from '../types';

// --- User Profile Component ---
interface UserProfileProps {
  userProfile: UserProfile;
  onOpenProfile: () => void;
  onLogout: () => void;
}

const UserIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const LogoutIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);

const UserProfileComponent: React.FC<UserProfileProps> = ({ userProfile, onOpenProfile, onLogout }) => {
    return (
        <div className="p-3 flex items-center justify-between">
            <button 
                onClick={onOpenProfile}
                className="group flex-1 flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/50 transition-colors min-w-0"
                aria-label="Open user profile"
            >
                {userProfile.avatar ? (
                    <img src={userProfile.avatar} alt="User Avatar" className="h-8 w-8 rounded-full object-cover flex-shrink-0" />
                ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                        <UserIcon />
                    </div>
                )}
                <span className="text-sm font-semibold text-gray-300 group-hover:text-white truncate transition-colors">
                    {userProfile.name}
                </span>
            </button>
            <button onClick={onLogout} aria-label="Logout" className="ml-2 p-2 rounded-lg text-gray-500 hover:bg-red-500/20 hover:text-red-400 transition-colors">
                <LogoutIcon />
            </button>
        </div>
    );
};


// --- Chat History Component ---
interface ChatHistoryProps {
  isOpen: boolean;
  chats: ChatSession[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  userProfile: UserProfile;
  onOpenProfile: () => void;
  onLogout: () => void;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ isOpen, chats, activeChatId, onSelectChat, onNewChat, onDeleteChat, userProfile, onOpenProfile, onLogout }) => {
  
  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent onSelectChat from firing
    if (window.confirm('Are you sure you want to delete this chat?')) {
        onDeleteChat(id);
    }
  };

  return (
    <aside className={`
      flex-shrink-0 bg-gray-900/70 backdrop-blur-md flex flex-col
      transition-all duration-300 ease-in-out overflow-hidden
      ${isOpen ? 'w-64 border-r border-gray-700/50' : 'w-0 border-r-0'}
    `}>
      {/* This wrapper div has a fixed width to prevent content from collapsing/wrapping during the animation */}
      <div className="w-64 h-full flex flex-col">
        <div className="p-4 border-b border-gray-700/50">
          <button
            onClick={onNewChat}
            className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold py-2 px-4 rounded-lg hover:from-purple-600 hover:to-cyan-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500"
          >
            + New Chat
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto">
          <ul className="p-2 space-y-1">
            {chats.map((chat) => (
              <li key={chat.id}>
                <button
                  onClick={() => onSelectChat(chat.id)}
                  className={`group w-full text-left px-3 py-2.5 rounded-md text-sm truncate transition-all duration-200 ease-in-out flex justify-between items-center relative ${
                    activeChatId === chat.id
                      ? 'bg-purple-500/20 text-white font-semibold'
                      : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                  }`}
                >
                  {activeChatId === chat.id && (
                      <div className="absolute left-0 top-0 h-full w-1 bg-purple-400 rounded-r-full animate-pulse" style={{ animationDuration: '2s'}}></div>
                  )}
                  <span className="flex-1 truncate pl-2">{chat.title || 'New Chat'}</span>
                  <span 
                      onClick={(e) => handleDelete(e, chat.id)} 
                      className="ml-2 p-1 rounded-md text-gray-500 hover:bg-red-500/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Delete chat"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto border-t border-gray-700/50">
          <UserProfileComponent userProfile={userProfile} onOpenProfile={onOpenProfile} onLogout={onLogout} />
        </div>
      </div>
    </aside>
  );
};

export default ChatHistory;
