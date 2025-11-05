

import { GoogleGenAI, Chat, GenerateContentResponse, Modality, Part } from '@google/genai';
import type { Attachment } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export function initializeChat(): Chat {
    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: 'You are GujjarGPT, a witty, creative, and friendly chatbot. You provide helpful and engaging answers. Keep your responses concise and well-formatted. You must provide reality and research-based answers by using your search tool when appropriate.',
            tools: [{googleSearch: {}}],
        },
    });
    return chat;
}

export async function sendMessageToAI(
    chat: Chat, 
    message: string,
    attachments: Attachment[] = []
): Promise<GenerateContentResponse> {
    try {
        const messageParts: Part[] = [{ text: message }];

        for(const attachment of attachments) {
            messageParts.push({
                inlineData: {
                    mimeType: attachment.mimeType,
                    data: attachment.data,
                }
            });
        }
        
        const result = await chat.sendMessage({ message: messageParts });
        return result;
    } catch (error) {
        console.error("Error sending message to AI:", error);
        let errorMessage = "Failed to get a response from the AI. The service may be temporarily down.";
        if (error instanceof Error) {
            if (error.message.includes('API key not valid')) {
                errorMessage = "API key is invalid. Please ensure it is configured correctly.";
            } else if (error.message.toLowerCase().includes('failed to fetch')) {
                 errorMessage = "Network error. Please check your internet connection.";
            } else if (error.message.includes('400 Bad Request')) {
                errorMessage = "The request was malformed. This can happen with unsupported image types.";
            }
        }
        throw new Error(errorMessage);
    }
}

export async function generateImage(prompt: string): Promise<{imageUrl?: string; text: string}> {
    try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
              {
                text: prompt,
              },
            ],
          },
          config: {
              responseModalities: [Modality.IMAGE],
          },
        });

        let imageUrl: string | undefined = undefined;
        let text = response.text || "I couldn't generate an image for that. Please try another prompt.";
        
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
                const base64ImageBytes: string = part.inlineData.data;
                imageUrl = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
                if (!response.text || response.text.trim() === "") {
                    text = `Here is the image you asked for.`;
                }
                break; 
            }
        }

        return { imageUrl, text };

    } catch (error) {
        console.error("Error generating image:", error);
        let errorMessage = "Failed to generate an image. The service may be temporarily down or the prompt may be unsupported.";
        if (error instanceof Error) {
           if (error.message.includes('API key not valid')) {
               errorMessage = "API key is invalid. Please ensure it is configured correctly.";
           } else if (error.message.toLowerCase().includes('failed to fetch')) {
                errorMessage = "Network error. Please check your internet connection.";
           } else if (error.message.includes('prompt was blocked')) {
               errorMessage = "Your prompt was blocked for safety reasons. Please try a different prompt.";
           }
       }
       throw new Error(errorMessage);
    }
}