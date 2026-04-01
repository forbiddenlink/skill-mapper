import { NextRequest, NextResponse } from 'next/server';
import { getSkillFeedback, type SkillFeedbackRequest } from '@/lib/groq';
import { checkRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Rate limit: 10 requests per minute per IP
    const rateLimit = await checkRateLimit(request);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait and try again.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.resetInSeconds),
          },
        }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'AI feedback not configured' },
        { status: 503 }
      );
    }

    const body = (await request.json()) as SkillFeedbackRequest;
    const { skillName, skillCategory, userAnswer, challengeType } = body;

    if (!skillName || !skillCategory || !userAnswer || !challengeType) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: skillName, skillCategory, userAnswer, challengeType',
        },
        { status: 400 }
      );
    }

    if (userAnswer.length > 5000) {
      return NextResponse.json(
        { error: 'Answer too long. Maximum 5,000 characters.' },
        { status: 400 }
      );
    }

    const feedback = await getSkillFeedback(body);

    return NextResponse.json(feedback);
  } catch (error) {
    console.error('AI feedback error:', error);
    return NextResponse.json(
      { error: 'Failed to generate feedback' },
      { status: 500 }
    );
  }
}
