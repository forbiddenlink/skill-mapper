import { NextRequest, NextResponse } from 'next/server';
import { getSkillFeedback, skillFeedbackRequestSchema } from '@/lib/groq';
import { checkGlobalDailyCap, checkRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Rate limit: 10 requests per minute per IP
    const rateLimit = await checkRateLimit(request);
    if (rateLimit.unavailable) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please retry shortly.' },
        { status: 503, headers: { 'Retry-After': '5' } }
      );
    }
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

    let raw: unknown;
    try {
      raw = await request.json();
    } catch {
      return NextResponse.json({ error: 'Request body must be JSON.' }, { status: 400 });
    }

    const parsed = skillFeedbackRequestSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid request.',
          issues: parsed.error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    // Global daily ceiling on paid calls; fails closed if Redis is unavailable.
    const globalCap = await checkGlobalDailyCap();
    if (globalCap.unavailable) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please retry shortly.' },
        { status: 503, headers: { 'Retry-After': '5' } }
      );
    }
    if (!globalCap.success) {
      return NextResponse.json(
        { error: 'Daily AI feedback capacity reached. Please try again tomorrow.' },
        { status: 429, headers: { 'Retry-After': String(globalCap.resetInSeconds) } }
      );
    }

    const feedback = await getSkillFeedback(parsed.data);

    return NextResponse.json(feedback);
  } catch (error) {
    console.error('AI feedback error:', error);
    return NextResponse.json(
      { error: 'Failed to generate feedback' },
      { status: 500 }
    );
  }
}
