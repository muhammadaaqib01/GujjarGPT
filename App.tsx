import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ChatMessage, ChatSession, UserProfile, Attachment } from './types';
import { MessageRole } from './types';
import { sendMessageToAI, initializeChat, generateImage } from './services/geminiService';
import type { Chat } from '@google/genai';
import Header from './components/Header';
import ChatMessageComponent from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import WelcomeScreen from './components/WelcomeScreen';
import ChatHistory from './components/ChatHistory';
import SplashScreen from './components/SplashScreen';
import LoginScreen from './components/LoginScreen';
import ProfileModal from './components/ProfileModal';

const App: React.FC = () => {
  const [appStatus, setAppStatus] = useState<'loading' | 'auth' | 'chat'>('loading');
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [geminiChat, setGeminiChat] = useState<Chat | null>(null);
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>({ name: 'Guest' });
  const [justLoggedIn, setJustLoggedIn] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const stopGenerationRef = useRef<boolean>(false);

  // App initialization effect for splash screen and auth check
  useEffect(() => {
    const initTimer = setTimeout(() => {
      try {
        const session = localStorage.getItem('gujjar-gpt-session');
        if (session) {
          const savedProfile = localStorage.getItem('gujjar-gpt-user-profile');
           if (savedProfile) {
            setUserProfile(JSON.parse(savedProfile));
          }
          setAppStatus('chat');
          setJustLoggedIn(true); // Treat session resume like a login
        } else {
          setAppStatus('auth');
        }
      } catch (e) {
        setError("Failed to check session. Please try refreshing the page.");
        setAppStatus('auth');
      }
    }, 2000); // Show splash screen for 2 seconds

    return () => clearTimeout(initTimer);
  }, []);


  // Load chats from localStorage on initial render for the current user
  useEffect(() => {
    if (appStatus === 'chat') {
      try {
        const savedChats = localStorage.getItem(`gujjar-gpt-chats-${userProfile.name}`);
        if (savedChats) {
          setChats(JSON.parse(savedChats));
        } else {
          setChats([]); // Ensure chats are cleared for a new user
        }
        const savedProfile = localStorage.getItem('gujjar-gpt-user-profile');
        if (savedProfile) {
          setUserProfile(JSON.parse(savedProfile));
        }
        const chatSession = initializeChat();
        setGeminiChat(chatSession);
      } catch (e) {
        const message = e instanceof Error ? e.message : "An unknown error occurred during initialization.";
        setError(message);
      }
    }
  }, [appStatus, userProfile.name]);

  // Save chats to localStorage whenever they change
  useEffect(() => {
    if (appStatus === 'chat' && userProfile.name !== 'Guest') {
        localStorage.setItem(`gujjar-gpt-chats-${userProfile.name}`, JSON.stringify(chats));
    }
  }, [chats, appStatus, userProfile.name]);
  
    // Save user profile to localStorage whenever it changes
  useEffect(() => {
    if (appStatus === 'chat') {
        localStorage.setItem('gujjar-gpt-user-profile', JSON.stringify(userProfile));
    }
  }, [userProfile, appStatus]);


  // Scroll to bottom effect
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chats, currentChatId, isLoading]);
  
  const handleLoginSuccess = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('gujjar-gpt-session', 'authenticated');
    localStorage.setItem('gujjar-gpt-user-profile', JSON.stringify(profile));
    setAppStatus('chat');
    setJustLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('gujjar-gpt-session');
    localStorage.removeItem('gujjar-gpt-user-profile');
    // Also remove user-specific chats to avoid privacy leak if another user logs in
    localStorage.removeItem(`gujjar-gpt-chats-${userProfile.name}`);
    setAppStatus('auth');
    setChats([]);
    setCurrentChatId(null);
    setUserProfile({ name: 'Guest' });
  };
  
  const handleUpdateProfile = (newProfile: UserProfile) => {
    // When name changes, we need to migrate the chats
    if (newProfile.name !== userProfile.name) {
        const oldKey = `gujjar-gpt-chats-${userProfile.name}`;
        const newKey = `gujjar-gpt-chats-${newProfile.name}`;
        const currentChats = localStorage.getItem(oldKey);
        if(currentChats) {
          localStorage.setItem(newKey, currentChats);
          localStorage.removeItem(oldKey);
        }
    }
    setUserProfile(newProfile);
  };

  const handleNewChat = () => {
    try {
        const newChatSession = initializeChat();
        setGeminiChat(newChatSession);
        setCurrentChatId(null);
        setJustLoggedIn(false);
    } catch (e) {
        const message = e instanceof Error ? e.message : "An unknown error occurred.";
        setError(message);
    }
  };
  
  const handleSelectChat = (id: string) => {
    setCurrentChatId(id);
    setJustLoggedIn(false);
  };

  const handleDeleteChat = (idToDelete: string) => {
    const remainingChats = chats.filter(c => c.id !== idToDelete);
    setChats(remainingChats);
    if (currentChatId === idToDelete) {
        handleNewChat();
    }
    if (remainingChats.length === 0) {
        localStorage.removeItem(`gujjar-gpt-chats-${userProfile.name}`);
    }
  };

  const handleStopGeneration = () => {
    stopGenerationRef.current = true;
    setIsLoading(false);
  };

  const handleSendMessage = useCallback(async (inputText: string, attachments: Attachment[] = []) => {
    if (justLoggedIn) {
        setJustLoggedIn(false);
    }
    if ((!inputText.trim() && attachments.length === 0) || isLoading) return;

    stopGenerationRef.current = false;
    const userMessage: ChatMessage = { 
        id: `user-${Date.now()}`,
        timestamp: new Date().toISOString(),
        role: MessageRole.USER, 
        text: inputText,
        attachments
    };
    setIsLoading(true);
    setError(null);
    
    let targetChatId = currentChatId;
    let newChatsArray = [...chats];
    const titleText = inputText || "Image Analysis";
    
    // If it's a new chat
    if (!targetChatId) {
        const newChat: ChatSession = {
            id: Date.now().toString(),
            title: titleText.length > 30 ? titleText.substring(0, 27) + '...' : titleText,
            messages: [userMessage]
        };
        newChatsArray = [newChat, ...newChatsArray];
        setChats(newChatsArray);
        setCurrentChatId(newChat.id);
        targetChatId = newChat.id;
    } else { // If it's an existing chat
        const chatIndex = newChatsArray.findIndex(c => c.id === targetChatId);
        if (chatIndex !== -1) {
            const updatedChat = {
                ...newChatsArray[chatIndex],
                messages: [...newChatsArray[chatIndex].messages, userMessage]
            };
            newChatsArray[chatIndex] = updatedChat;
            setChats(newChatsArray);
        }
    }

    try {
      let aiMessage: ChatMessage;
      const isImageGeneration = inputText.trim().toLowerCase().startsWith('/imagine');

      if (isImageGeneration) {
        const prompt = inputText.trim().substring('/imagine'.length).trim();
        if (!prompt) {
          setError("Please provide a prompt after /imagine.");
          setIsLoading(false);
          return;
        }
        const response = await generateImage(prompt);
        if (stopGenerationRef.current) return;
        aiMessage = {
          id: `ai-${Date.now()}`,
          timestamp: new Date().toISOString(),
          role: MessageRole.MODEL,
          text: response.text,
          imageUrl: response.imageUrl,
        };
      } else {
        if (!geminiChat) throw new Error("Chat is not initialized.");
        const response = await sendMessageToAI(geminiChat, inputText, attachments);
        if (stopGenerationRef.current) return;
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        aiMessage = {
          id: `ai-${Date.now()}`,
          timestamp: new Date().toISOString(),
          role: MessageRole.MODEL,
          text: response.text,
          sources: sources.filter(s => s.web)
        };
      }
      
      const finalChatIndex = newChatsArray.findIndex(c => c.id === targetChatId);
      if (finalChatIndex !== -1) {
        const finalUpdatedChat = {
            ...newChatsArray[finalChatIndex],
            messages: [...newChatsArray[finalChatIndex].messages, aiMessage]
        };
        newChatsArray[finalChatIndex] = finalUpdatedChat;
        setChats([...newChatsArray]);
      }

    } catch (e) {
        if (stopGenerationRef.current) {
            return;
        }
        
        const err = e as Error;
        const userFriendlyError = err.message || "An unexpected error occurred. Please try again.";

        setError(userFriendlyError);
        const errorAiMessage: ChatMessage = { 
            id: `error-${Date.now()}`,
            timestamp: new Date().toISOString(),
            role: MessageRole.MODEL, 
            text: `Sorry, I encountered an error: ${userFriendlyError}` 
        };
        
        const errorChatIndex = newChatsArray.findIndex(c => c.id === targetChatId);
        if (errorChatIndex !== -1) {
            const errorUpdatedChat = {
                ...newChatsArray[errorChatIndex],
                messages: [...newChatsArray[errorChatIndex].messages, errorAiMessage]
            };
            newChatsArray[errorChatIndex] = errorUpdatedChat;
            setChats([...newChatsArray]);
        }
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, geminiChat, currentChatId, chats, userProfile.name, justLoggedIn]);

  const handleToggleHistory = () => {
    setIsHistoryOpen(prev => !prev);
  };
  
  const handleOpenProfile = () => setIsProfileModalOpen(true);
  const handleCloseProfile = () => setIsProfileModalOpen(false);

  const currentMessages = chats.find(c => c.id === currentChatId)?.messages || [];

  const AppContent = () => (
    <div className="flex h-full bg-gray-900 text-white font-sans">
      <ChatHistory 
        isOpen={isHistoryOpen}
        chats={chats}
        activeChatId={currentChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        userProfile={userProfile}
        onOpenProfile={handleOpenProfile}
        onLogout={handleLogout}
      />
      <div className="flex flex-col flex-1 bg-gradient-to-b from-gray-900 via-gray-900 to-blue-600/20 min-w-0">
        <Header onToggleHistory={handleToggleHistory} />
        <main ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {currentMessages.length === 0 && !justLoggedIn ? (
              <WelcomeScreen onSendMessage={handleSendMessage} />
          ) : (
              currentMessages.map((msg, index) => (
                  <ChatMessageComponent 
                    key={msg.id} 
                    message={msg}
                    isLastMessage={index === currentMessages.length - 1}
                  />
              ))
          )}
          {currentMessages.length === 0 && justLoggedIn && !isLoading && (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 p-4 animate-fade-in-slide-up">
                  <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mb-4">
                      GujjarGPT
                  </h1>
                  <p className="text-lg">
                      Ready for your questions. How can I help you today?
                  </p>
              </div>
          )}
          {isLoading && <ChatMessageComponent message={{ id:'loading', timestamp: new Date().toISOString(), role: MessageRole.MODEL, text: '' }} isLoading={true} isLastMessage={true}/>}
           {error && (
            <div className="flex justify-center">
              <div className="bg-red-500/20 text-red-300 p-3 rounded-lg max-w-md text-center">
                {error}
              </div>
            </div>
          )}
        </main>
        <div>
          {isLoading && (
            <div className="flex justify-center animate-fade-in-slide-up">
              <button
                onClick={handleStopGeneration}
                className="mb-3 bg-gray-800 border border-gray-600/80 text-gray-300 px-4 py-1.5 rounded-lg hover:bg-gray-700/80 hover:text-white transition-colors flex items-center gap-2 text-sm"
                aria-label="Stop generating response"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V3z" clipRule="evenodd" />
                </svg>
                Stop generating
              </button>
            </div>
          )}
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </div>
       {isProfileModalOpen && (
        <ProfileModal 
            userProfile={userProfile}
            onUpdateProfile={handleUpdateProfile}
            onClose={handleCloseProfile}
        />
      )}
    </div>
  );

  if (appStatus === 'loading') {
    return <SplashScreen />;
  }
  
  if (appStatus === 'auth') {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="bg-black font-sans flex justify-center items-center min-h-screen p-0 sm:p-4">
      <div className="w-full sm:max-w-md h-screen sm:h-[95vh] sm:max-h-[900px] bg-gray-900 sm:rounded-3xl shadow-2xl overflow-hidden sm:border-2 sm:border-gray-700 flex flex-col relative">
        <AppContent />
      </div>
    </div>
  );
};

export default App;