import React, { useState } from 'react';
import type { ChatMessage, GroundingChunk } from '../types';
import { MessageRole } from '../types';

interface ChatMessageProps {
  message: ChatMessage;
  isLoading?: boolean;
  isLastMessage: boolean;
}

const UserIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const AIIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

const TypingIndicator: React.FC = () => (
    <div className="flex items-center space-x-1 p-3">
        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
    </div>
);

const CopyIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const CopiedIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

const DownloadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);


const ReadReceiptIcon: React.FC = () => (
    <>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ transform: 'translateX(4px)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block text-cyan-400 -ml-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
    </>
);

const ChatMessageComponent: React.FC<ChatMessageProps> = ({ message, isLoading = false, isLastMessage }) => {
  const [isCopied, setIsCopied] = useState(false);
  const isUser = message.role === MessageRole.USER;

  const containerClasses = isUser ? 'justify-end' : 'justify-start';
  const bubbleClasses = isUser 
    ? 'bg-blue-600/50 rounded-br-none' 
    : 'bg-gray-800 rounded-bl-none';
  const icon = isUser ? <UserIcon /> : <AIIcon />;

  const handleCopy = () => {
    if (isLoading || !message.text) return;
    navigator.clipboard.writeText(message.text).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
  };
  
  const handleDownload = () => {
    if (!message.imageUrl) return;
    const link = document.createElement('a');
    link.href = message.imageUrl;
    const fileExtension = message.imageUrl.split(';')[0].split('/')[1] || 'png';
    link.download = `gujjar-gpt-image-${Date.now()}.${fileExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderSources = (sources: GroundingChunk[]) => (
    <div className="mt-3 pt-3 border-t border-gray-700">
        <h4 className="text-xs font-semibold text-gray-400 mb-2">Sources:</h4>
        <div className="flex flex-col space-y-2">
            {sources.map((source, index) => (
                source.web && (
                    <a 
                        key={index} 
                        href={source.web.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-cyan-400 hover:text-cyan-300 truncate transition-colors"
                        title={source.web.title || source.web.uri}
                    >
                        {source.web.title || source.web.uri}
                    </a>
                )
            ))}
        </div>
    </div>
  );
  
  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
  });

  return (
    <div className="animate-fade-in-slide-up">
        <div className={`flex items-start gap-3 ${containerClasses}`}>
        <div className={`flex-shrink-0 ${isUser ? 'order-2' : 'order-1'}`}>
            {icon}
        </div>
        <div className={`group relative max-w-md md:max-w-lg lg:max-w-2xl px-4 py-3 rounded-2xl ${bubbleClasses} ${isUser ? 'order-1' : 'order-2'}`}>
            {isLoading ? (
            <TypingIndicator />
            ) : (
            <>
                <div className="absolute top-1.5 right-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {message.imageUrl && !isUser && (
                        <button 
                            onClick={handleDownload}
                            aria-label="Download image"
                            className="p-1 rounded-full bg-gray-900/40 text-gray-400 focus:opacity-100 focus:outline-none hover:bg-gray-700/60"
                        >
                           <DownloadIcon />
                        </button>
                    )}
                    {message.text && (
                        <button 
                            onClick={handleCopy}
                            aria-label="Copy message"
                            className="p-1 rounded-full bg-gray-900/40 text-gray-400 focus:opacity-100 focus:outline-none hover:bg-gray-700/60"
                        >
                            {isCopied ? <CopiedIcon /> : <CopyIcon />}
                        </button>
                    )}
                </div>
                {message.attachments && message.attachments.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-2">
                        {message.attachments.map((att, index) => (
                            <img 
                                key={index}
                                src={`data:${att.mimeType};base64,${att.data}`}
                                alt="User upload"
                                className="rounded-lg max-w-full h-auto border border-gray-700/50"
                            />
                        ))}
                    </div>
                )}
                {message.imageUrl && (
                    <img 
                        src={message.imageUrl}
                        alt="Generated content"
                        className="rounded-lg mb-2 max-w-full h-auto border border-gray-700/50"
                    />
                )}
                {message.text && (
                    <p className="text-gray-200 whitespace-pre-wrap pr-8">{message.text}</p>
                )}
                {message.sources && message.sources.length > 0 && renderSources(message.sources)}
            </>
            )}
        </div>
        </div>
        <div className={`flex items-center text-xs text-gray-500 mt-1.5 px-10 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <span>{formattedTime}</span>
            {isUser && !isLastMessage && !isLoading && <ReadReceiptIcon />}
        </div>
    </div>
  );
};

export default ChatMessageComponent;