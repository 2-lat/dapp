"use client";

import { useCallback, useState } from "react";
import { useConversationAssistant } from "@/hooks/useConversationAssistant";

interface Speaker {
  id: string;
  text: string;
}

export const ConversationAssistant = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [assistantResponse, setAssistantResponse] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversation, setConversation] = useState<string>('');
  const [transcriptionsLog, setTranscriptionsLog] = useState<string[]>([]);
  const [assistantResponsesLog, setAssistantResponsesLog] = useState<string[]>(
    [],
  );

  const handleTranscription = useCallback((text: string) => {
    setTranscription(text);
    setTranscriptionsLog((prev) => [...prev, text]);
  }, []);

  const handleConversation = useCallback((conversation: string) => {
    setConversation(conversation);
  }, []);

  const handleAssistantResponse = useCallback((response: string) => {
    setAssistantResponse(response);
    setAssistantResponsesLog((prev) => [...prev, response]);
  }, []);

  const { isListening, error } = useConversationAssistant({
    onTranscription: handleTranscription,
    onConversation: handleConversation,
    onAssistantResponse: handleAssistantResponse,
    isEnabled,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-background rounded-lg border p-4 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-foreground font-semibold">
            Conversation Assistant
          </h3>
          <button
            onClick={() => setIsEnabled(!isEnabled)}
            className={`rounded px-3 py-1 ${
              isEnabled
                ? "bg-destructive hover:bg-destructive/90"
                : "bg-primary hover:bg-primary/90"
            } text-primary-foreground`}
          >
            {isEnabled ? "Stop" : "Start"}
          </button>
        </div>

        {error && <div className="text-destructive mb-2 text-sm">{error}</div>}

        {isListening && (
          <div className="text-muted-foreground mb-2 text-sm">
            Status: Listening...
          </div>
        )}

        {transcription && (
          <div className="mb-2">
            <div className="text-foreground mb-1 text-sm font-medium">
              Latest Transcription:
            </div>
            <div className="bg-muted text-foreground rounded p-2 text-sm">
              {transcription}
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="text-muted-foreground mb-2 text-sm">
            Processing...
          </div>
        )}

        {assistantResponse && (
          <div>
            <div className="text-foreground mb-1 text-sm font-medium">
              Assistant:
            </div>
            <div className="bg-primary/10 text-foreground rounded p-2 text-sm">
              {assistantResponse}
            </div>
          </div>
        )}
      </div>
      <div className="bg-background rounded-lg border p-4 shadow-lg">
        <h3 className="text-foreground font-semibold">Assistant Responses</h3>
        <div className="flex flex-col-reverse gap-2">
          {assistantResponsesLog.slice(-10).map((response, index) => (
            <div key={index}>{response}</div>
          ))}
        </div>
      </div>
      <div className="bg-background rounded-lg border p-4 shadow-lg">
        <h3 className="text-foreground font-semibold">Transcriptions</h3>
        <div className="flex flex-col gap-2">
          {transcriptionsLog.slice(-10).map((transcription, index) => (
            <div key={index}>{transcription}</div>
          ))}
        </div>
      </div>
      <div className="bg-background rounded-lg border p-4 shadow-lg">
        <h3 className="text-foreground font-semibold">Conversation</h3>
        <div className="flex flex-col gap-2">
          {conversation}
        </div>
      </div>
    </div>
  );
};
