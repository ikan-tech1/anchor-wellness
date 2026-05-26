const CRISIS_KEYWORDS = [
  "kill myself",
  "suicide",
  "suicidal",
  "end my life",
  "want to die",
  "self-harm",
  "hurt myself",
  "don't want to live",
  "better off dead",
];

export interface SafetyCheck {
  isCrisis: boolean;
  matchedKeywords: string[];
}

export function checkForCrisis(text: string): SafetyCheck {
  const lower = text.toLowerCase();
  const matched = CRISIS_KEYWORDS.filter((kw) => lower.includes(kw));
  return { isCrisis: matched.length > 0, matchedKeywords: matched };
}

export const CRISIS_RESPONSE = `I'm really glad you reached out. What you're feeling sounds incredibly heavy, and you deserve support from someone who can help right now.

**Please reach out for immediate support:**
- **988 Suicide & Crisis Lifeline** (US): Call or text 988
- **Crisis Text Line**: Text HOME to 741741
- **Emergency services**: Call 911 if you're in immediate danger

I'm here to listen, but I'm not a substitute for professional crisis support. Would you like to talk about what's going on, or would you prefer I help you find local resources?`;
