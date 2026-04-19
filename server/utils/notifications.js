import nodemailer from 'nodemailer';

export const getTransporter = () => nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

export const generateMotivationalSummary = (stats) => {
  const { completionRate, prevCompletionRate, streak } = stats;
  const improvement = completionRate - (prevCompletionRate || 0);

  if (completionRate >= 90) {
    return `🔥 LEGENDARY WEEK! You crushed it with ${completionRate.toFixed(0)}% completion! You're absolutely unstoppable. Keep this energy going!`;
  } else if (completionRate >= 70) {
    if (improvement > 0) {
      return `💪 Solid week! You improved by ${improvement.toFixed(0)}% this week. ${streak > 3 ? `Your ${streak}-day streak shows real discipline!` : 'Keep building that consistency!'} `;
    }
    return `✅ Good effort this week with ${completionRate.toFixed(0)}% completion. You have what it takes — push a little harder next week!`;
  } else if (completionRate >= 40) {
    return `⚡ You showed up, and that matters. ${completionRate.toFixed(0)}% completion this week — your future self is watching. Let's make next week count!`;
  } else {
    return `💀 Rough week... ${completionRate.toFixed(0)}% completion. But hey — the fact you're reading this means you haven't quit. Reset. Rebuild. Come back stronger.`;
  }
};

export const sendWeeklyEmail = async ({ to, userName, stats, summary }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
  const transporter = getTransporter();

  const html = `
    <!DOCTYPE html>
    <html>
    <head><style>
      body { font-family: Arial, sans-serif; background: #0f0f0f; color: #fff; margin: 0; padding: 20px; }
      .container { max-width: 600px; margin: 0 auto; background: #1a1a2e; border-radius: 16px; padding: 30px; }
      .header { text-align: center; margin-bottom: 30px; }
      h1 { color: #00d4ff; font-size: 28px; }
      .stat-card { background: #16213e; border-radius: 12px; padding: 16px; margin: 10px 0; display: flex; justify-content: space-between; }
      .stat-label { color: #8892b0; }
      .stat-value { color: #00d4ff; font-weight: bold; font-size: 20px; }
      .summary { background: #0f3460; border-radius: 12px; padding: 20px; margin-top: 20px; font-size: 16px; line-height: 1.6; }
      .footer { text-align: center; margin-top: 20px; color: #8892b0; font-size: 12px; }
    </style></head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚡ LifeOS Weekly Report</h1>
          <p style="color:#8892b0">${userName}'s Weekly Performance</p>
        </div>
        <div class="stat-card"><span class="stat-label">Completion Rate</span><span class="stat-value">${stats.completionRate?.toFixed(0)}%</span></div>
        <div class="stat-card"><span class="stat-label">Tasks Completed</span><span class="stat-value">${stats.completedTasks} / ${stats.totalTasks}</span></div>
        <div class="stat-card"><span class="stat-label">Coding Hours</span><span class="stat-value">${stats.codingHours}h</span></div>
        <div class="stat-card"><span class="stat-label">Current Streak</span><span class="stat-value">🔥 ${stats.streak} days</span></div>
        <div class="stat-card"><span class="stat-label">XP Earned</span><span class="stat-value">+${stats.xpEarned} XP</span></div>
        <div class="summary">${summary}</div>
        <div class="footer">Sent by LifeOS Discipline System • Stay consistent.</div>
      </div>
    </body></html>
  `;

  await transporter.sendMail({
    from: `"LifeOS" <${process.env.EMAIL_USER}>`,
    to,
    subject: `⚡ ${userName}'s Weekly Discipline Report`,
    html
  });
};

export const sendWhatsApp = async (to, message) => {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) return;
  try {
    const { default: twilio } = await import('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: `whatsapp:${to}`
    });
  } catch (err) {
    console.error('WhatsApp error:', err.message);
  }
};
