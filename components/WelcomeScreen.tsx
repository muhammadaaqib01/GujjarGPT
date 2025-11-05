import React from 'react';

interface WelcomeScreenProps {
    onSendMessage: (message: string) => void;
}

const CreativeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
    </svg>
);

const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const CodeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
);

const ImageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const DailyLifeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);


const promptCategories = [
    {
        title: "Creative Corner",
        icon: <CreativeIcon />,
        prompts: [
            "Write a short story about a robot who discovers music",
            "Compose a poem about a city at night",
            "Suggest a plot for a sci-fi movie",
        ]
    },
    {
        title: "Brain Boost",
        icon: <InfoIcon />,
        prompts: [
            "Explain quantum computing in simple terms",
            "What are the main causes of climate change?",
            "Summarize the history of the internet",
        ]
    },
    {
        title: "Daily Life",
        icon: <DailyLifeIcon />,
        prompts: [
            "What's a good recipe for a quick dinner?",
            "Give me a 30-minute workout plan",
            "How can I improve my sleep quality?",
        ]
    },
    {
        title: "Visual Creator",
        icon: <ImageIcon />,
        prompts: [
            "/imagine a majestic lion with a crown of stars",
            "/imagine a futuristic city skyline at sunset",
            "/imagine a serene Japanese garden with a koi pond",
        ]
    }
];

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSendMessage }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 p-4">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mb-4">
                    Welcome to GujjarGPT
                </h1>
                <p className="text-lg mb-12">
                    How can I help you today? Start a conversation or try one of these examples.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {promptCategories.map((category) => (
                        <div key={category.title} className="flex flex-col items-center">
                            <div className="flex items-center gap-3 mb-4">
                                {category.icon}
                                <h3 className="text-xl font-semibold text-gray-200">{category.title}</h3>
                            </div>
                            <div className="w-full space-y-3">
                                {category.prompts.map((prompt) => (
                                    <button
                                        key={prompt}
                                        onClick={() => onSendMessage(prompt)}
                                        className="w-full bg-gray-800/50 p-4 rounded-lg text-left hover:bg-gray-700/70 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <p className="text-sm text-gray-300">{prompt}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WelcomeScreen;