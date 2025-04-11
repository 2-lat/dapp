import { ConversationAssistant } from '@/components/ConversationAssistant';

export default function AssistantPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Conversation Assistant</h1>
        <p className="text-gray-600 mb-8">
          This assistant helps guide your online meetings by listening to the conversation and providing real-time suggestions.
          Click the Start button to begin.
        </p>
        <ConversationAssistant />
      </div>
    </div>
  );
} 