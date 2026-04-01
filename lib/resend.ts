import { Resend } from 'resend';

let _resend: Resend | null = null;

export function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

/**
 * Send skill achievement badge notification
 */
export async function sendSkillAchievement({
  userEmail,
  skillName,
  proficiencyLevel,
}: {
  userEmail: string;
  skillName: string;
  proficiencyLevel: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  const resend = getResend();
  if (!resend) {
    return { success: false, error: 'Resend API key not configured' };
  }

  const html = `
    <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
        <h2>🏆 Skill Unlocked!</h2>
        <p>Congratulations! You've reached <strong>${proficiencyLevel}</strong> in</p>
        <p style="font-size: 24px; font-weight: bold; color: #007bff;">${skillName}</p>
        <p>Share your achievement on your profile!</p>
      </body>
    </html>
  `;

  try {
    const response = await resend.emails.send({
      from: 'achievements@skill-mapper.dev',
      to: userEmail,
      subject: `Achievement Unlocked: ${skillName}`,
      html,
      text: `You've reached ${proficiencyLevel} in ${skillName}!`,
    });

    if (response.error) {
      return { success: false, error: response.error.message };
    }

    return { success: true, id: response.data?.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send notification',
    };
  }
}
