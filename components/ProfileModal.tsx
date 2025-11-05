import React, { useState, useRef, useEffect } from 'react';
import type { UserProfile } from '../types';

interface ProfileModalProps {
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onClose: () => void;
}

const UserIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const ProfileModal: React.FC<ProfileModalProps> = ({ userProfile, onUpdateProfile, onClose }) => {
  const [name, setName] = useState(userProfile.name);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    const handleClickOutside = (event: MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
            onClose();
        }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleNameSave = () => {
    if (name.trim() && name.trim() !== userProfile.name) {
      onUpdateProfile({ ...userProfile, name: name.trim() });
    } else {
      setName(userProfile.name);
    }
    nameInputRef.current?.blur();
  };
  
  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        handleNameSave();
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onUpdateProfile({ ...userProfile, avatar: reader.result as string });
      };
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-slide-up" style={{ animationDuration: '0.2s' }}>
      <div ref={modalRef} className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700/50 w-full max-w-md p-6 m-4 relative">
        <button onClick={onClose} className="absolute top-3 right-3 p-2 text-gray-500 hover:text-white hover:bg-gray-700 rounded-full transition-colors" aria-label="Close profile">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
        <h2 className="text-2xl font-bold text-white mb-6 text-center">User Profile</h2>
        
        <div className="flex flex-col items-center gap-4">
            <div className="relative group">
                {userProfile.avatar ? (
                    <img src={userProfile.avatar} alt="User Avatar" className="h-24 w-24 rounded-full object-cover border-2 border-gray-600" />
                ) : (
                    <div className="h-24 w-24 rounded-full bg-gray-700 flex items-center justify-center border-2 border-gray-600">
                        <UserIcon />
                    </div>
                )}
                 <button onClick={handleAvatarClick} className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Change profile picture">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                 </button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/gif" />
            </div>

            <div className="w-full text-center">
                <label htmlFor="userName" className="text-sm text-gray-400 mb-1 block">Your Name</label>
                <input
                    id="userName"
                    ref={nameInputRef}
                    type="text"
                    value={name}
                    onChange={handleNameChange}
                    onBlur={handleNameSave}
                    onKeyDown={handleNameKeyDown}
                    className="w-full max-w-xs mx-auto bg-gray-700/60 text-white text-lg font-semibold rounded-lg px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
                    aria-label="Edit user name"
                />
            </div>
        </div>

        <div className="mt-8 text-center">
            <button onClick={onClose} className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold py-2 px-8 rounded-lg hover:from-purple-600 hover:to-cyan-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500">
                Done
            </button>
        </div>

      </div>
    </div>
  );
};

export default ProfileModal;
