import { useState, useEffect, useCallback, useRef } from 'react';
import { transcribeAudio, detectSpeakers, getAssistantResponse } from '@/lib/openai';
import hark from 'hark';

interface UseConversationAssistantProps {
  onTranscription: (text: string) => void;
  onAssistantResponse: (response: string) => void;
  onConversation: (conversation: string) => void;
  isEnabled: boolean;
}

interface Speaker {
  id: string;
  text: string;
}

export const useConversationAssistant = ({ onTranscription, onAssistantResponse, onConversation, isEnabled }: UseConversationAssistantProps) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const conversationRef = useRef<string>('');
  const harkRef = useRef<hark.Harker | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const transcriptionsRef = useRef<string[]>([]);

  const processAudio = useCallback(async (audioBlob: Blob, fileName: string) => {
    try {
      const transcript = await transcribeAudio(audioBlob, fileName);
      if (!transcript) return;

      transcriptionsRef.current = [...transcriptionsRef.current, transcript];
      onTranscription(transcript);
      
      const speakers = await detectSpeakers(transcriptionsRef.current.join('\n'));
      conversationRef.current = speakers;
      onConversation(conversationRef.current);
      const response = await getAssistantResponse(conversationRef.current.slice(-5000));
      onAssistantResponse(response);
    } catch (err) {
      console.error('Error processing audio:', err);
    }
  }, [onTranscription, onAssistantResponse]);

  const startListening = useCallback(async () => {
    if (isListening) {
      console.log('already listening');
      return;
    }

    setIsListening(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);

      const speech = hark(stream, {});
      harkRef.current = speech;
      console.log('speech', speech);
      
      speech.on('state_change', (state) => {
        console.log('state', state);
      })

      speech.on('speaking', () => {
        console.log('speaking');
        mediaRecorder.start();
      })

      speech.on('stopped_speaking', () => {
        console.log('stopped speaking');
        if (mediaRecorder.state === "recording") mediaRecorder.stop();
      })

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (audioChunksRef.current.length > 0) {
          console.log('transcribing...');
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
          audioChunksRef.current = [];
          await processAudio(audioBlob, "recording.wav");
        }

        audioChunksRef.current = [];
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setError('Error recording audio');
      };

      mediaRecorderRef.current = mediaRecorder;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access microphone';
      setError(errorMessage);
      console.error(err);
    }
  }, [isEnabled, processAudio]);

  const stopListening = useCallback(() => {
    console.log('stopping listening');

    if (harkRef.current) {
      console.log('stopping hark');
      harkRef.current.stop();
    }
    if (mediaStreamRef.current) {
      console.log('stopping media stream');
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (mediaRecorderRef.current) {
      console.log('stopping media recorder');
      mediaRecorderRef.current.stop();
    }
    setIsListening(false);
  }, []);

  useEffect(() => {
    if (isEnabled && !isListening) {
      startListening();
    } else if (!isEnabled && isListening) {
      stopListening();
    }
  }, [isEnabled, isListening, startListening]);

  return {
    isListening,
    error,
    startListening,
  };
}; 