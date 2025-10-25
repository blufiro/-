
import { GoogleGenAI, Modality } from "@google/genai";

// Audio Decoding Functions
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


let audioContext: AudioContext | null = null;
const getAudioContext = (): AudioContext => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    return audioContext;
};

export const geminiService = {
  speak: async (text: string) => {
    if (!process.env.API_KEY) {
        alert("API key is not set. Cannot use text-to-speech feature.");
        return;
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `Please say this: ${text}` }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' }, // A friendly voice for kids
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
            const ctx = getAudioContext();
            const audioBuffer = await decodeAudioData(
                decode(base64Audio),
                ctx,
                24000,
                1,
            );
            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            source.start();
        } else {
            console.error("No audio data received from API.");
            console.error("Full API response:", JSON.stringify(response, null, 2));
            const textResponse = response.text;
            if (textResponse) {
                console.error("API returned a text response:", textResponse);
                alert(`Sorry, I couldn't say the word. The API returned an error: ${textResponse}`);
            } else {
                alert("Sorry, I couldn't say the word. The API returned an empty response.");
            }
        }
    } catch (error) {
        console.error("Error with Gemini TTS:", error);
        alert("An error occurred while trying to speak the word.");
    }
  },
};