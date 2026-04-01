import Groq from 'groq-sdk';

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

export interface SkillFeedbackRequest {
  skillName: string;
  skillCategory: string;
  userAnswer: string;
  correctAnswer?: string;
  challengeType: 'quiz' | 'code' | 'concept';
}

export interface SkillFeedbackResponse {
  isCorrect: boolean;
  feedback: string;
  encouragement: string;
  nextSteps?: string[];
}

export async function getSkillFeedback(
  request: SkillFeedbackRequest
): Promise<SkillFeedbackResponse> {
  if (!groq) {
    // Return basic feedback when Groq not configured
    return {
      isCorrect: false,
      feedback: 'AI feedback not available.',
      encouragement: 'Keep practicing!',
    };
  }

  const { skillName, skillCategory, userAnswer, correctAnswer, challengeType } =
    request;

  const prompt = `You are a learning coach helping someone master "${skillName}" in the ${skillCategory} skill tree.

Challenge type: ${challengeType}
User's answer: ${userAnswer}
${correctAnswer ? `Expected answer: ${correctAnswer}` : ''}

Provide brief, encouraging feedback. Be specific about what they got right or wrong.

Respond in JSON:
{
  "isCorrect": boolean,
  "feedback": "specific feedback on their answer (2-3 sentences)",
  "encouragement": "brief motivational message",
  "nextSteps": ["optional suggestion 1", "optional suggestion 2"]
}`;

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content:
          'You are an encouraging learning coach. Be positive but honest. Always respond with valid JSON.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.4,
    max_tokens: 300,
    response_format: { type: 'json_object' },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from AI');
  }

  return JSON.parse(content) as SkillFeedbackResponse;
}

export async function generateSkillHint(
  skillName: string,
  difficulty: 'beginner' | 'intermediate' | 'advanced'
): Promise<string> {
  if (!groq) {
    return 'Hint: Take your time and think through each step carefully.';
  }

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'user',
        content: `Give a brief, helpful hint for learning "${skillName}" at the ${difficulty} level. Keep it under 50 words.`,
      },
    ],
    temperature: 0.5,
    max_tokens: 100,
  });

  return (
    completion.choices[0]?.message?.content ||
    'Keep practicing and you will improve!'
  );
}
