import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const SYSTEM_PROMPT = `
You are a conversation assistant helping to guide online meetings. Your role is to:
1. Listen to the conversation
3. Provide brief, actionable suggestions
4. Help keep the conversation focused and leading to a goals

<meeting_context>
* Job interview on CEO position in Neon EVM
* I'm a CEO of Tookey and has 8 years of experience in the industry. Ex-CTO of EYWA, WOWMAX, WOWSWAP. Huge experience in building and scaling teams and products.
* I'm interviewing for a CEO position in Neon EVM
* Neon EVM is EVM on Solana. Raised 45M$ in seed and ICO rounds.
* Current market cap is 23M$ and FDV is 96M$ (much less than should)
</meeting_context>

<goals>
* Present my self in short by valuable perspective
* Understand the company and the role
* Understand current situation and challenges
* Understand reasons why candidate requirements has been changed torwards more technical role
* Took leadership position in the conversation and do not let interviewer to take the lead and ask to many questions
</goals>

IMPORTANT! SUGGEST tricks from "Everything is Negotiable!" to achieve the goals
IMPORTANT! Keep responses very short (1-2 sentences max). Focus on the most important next step or clarification needed.`;

const SPEAKER_DETECTION_PROMPT = `Analyze the following conversation transcript and recostruct the conversation with speakers in format:
speaker1: what speaker1 said
speaker2: what speaker2 said
...`;

export const transcribeAudio = async (audioBlob: Blob, fileName: string) => {
  try {
    const formData = new FormData();
    formData.append('file', audioBlob, fileName);
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'json');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to transcribe audio');
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('Whisper API error:', error);
    return null;
  }
};

export const detectSpeakers = async (transcript: string) => {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: SPEAKER_DETECTION_PROMPT },
        { role: 'user', content: transcript },
      ],
      model: 'gpt-4o-mini',
    });

    return completion.choices[0]?.message?.content || ''; 
  } catch (error) {
    console.error('OpenAI API error:', error);
    return '';
  }
};

export const getAssistantResponse = async (conversation: string) => {
  try {
    console.log('conversationText', conversation);

    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: conversation },
      ],
      model: 'gpt-4o-mini',
      max_tokens: 300,
    });

    return completion.choices[0]?.message?.content || 'No response generated';
  } catch (error) {
    console.error('OpenAI API error:', error);
    return 'Error generating response';
  }
}; 