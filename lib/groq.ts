/**
 * Groq AI service for the check-in chat flow.
 * Uses LLaMA 3.3 70B for medical reasoning quality.
 *
 * NOTE: For production, move the API key to a Supabase Edge Function.
 * Client-side key is acceptable for MVP only.
 */

import { dbg } from '@/lib/debug';

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY!;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChildContext {
  name: string;
  age: string;
  weight?: number;
  height?: number;
  allergies: string[];
  conditions: string[];
  medications: { name: string; dosage?: string; frequency?: string }[];
}

export function buildSystemPrompt(child: ChildContext): string {
  const allergyList = child.allergies.length > 0
    ? child.allergies.join(', ')
    : 'None known';
  const conditionList = child.conditions.length > 0
    ? child.conditions.join(', ')
    : 'None known';
  const medList = child.medications.length > 0
    ? child.medications.map(m => `${m.name}${m.dosage ? ` ${m.dosage}` : ''}${m.frequency ? ` (${m.frequency})` : ''}`).join(', ')
    : 'None';

  return `You are a warm, professional pediatric health assistant helping a parent prepare for a doctor visit. You are collecting symptoms — NOT diagnosing.

CHILD PROFILE:
- Name: ${child.name}
- Age: ${child.age}
- Weight: ${child.weight ? `${child.weight} kg` : 'Not recorded'}
- Height: ${child.height ? `${child.height} cm` : 'Not recorded'}
- Known allergies: ${allergyList}
- Chronic conditions: ${conditionList}
- Current medications: ${medList}

RULES:
1. Ask 5–8 focused follow-up questions, ONE at a time.
2. Cover: onset, severity, location, associated symptoms, triggers, fluid/food intake, what has been tried.
3. Be warm but clinical. Use the child's name naturally.
4. NEVER diagnose, prescribe, or suggest medication.
5. NEVER frighten the parent — stay calm and reassuring.
6. When you have enough information to prepare a summary, end your FINAL message with EXACTLY this marker on its own line:
   [CHECKIN_COMPLETE]
7. Keep responses concise (2–3 sentences max per question).
8. If the parent mentions a known allergy or condition from the profile, acknowledge it.
9. For questions where the parent can answer from a limited set of choices, append EXACTLY this line AFTER your question (on its own line):
   [QUICK_OPTIONS: Option 1, Option 2, Option 3, Option 4]
   Use this for:
   - Yes/No/Not sure questions → [QUICK_OPTIONS: Yes, No, Not sure]
   - Duration → [QUICK_OPTIONS: Just started, Since yesterday, 2-3 days, A week or more]
   - Severity → [QUICK_OPTIONS: Mild, Moderate, Severe]
   - Fever temperature → [QUICK_OPTIONS: Below 100°F, 100-101°F, 101-103°F, Above 103°F]
   - Eating/drinking → [QUICK_OPTIONS: Eating normally, Eating less, Refusing to eat]
   - Cough type → [QUICK_OPTIONS: Dry cough, Wet/phlegmy, Barking cough, No cough]
   - Energy level → [QUICK_OPTIONS: Active as usual, A bit tired, Very tired, Lethargic]
   - Sleep impact → [QUICK_OPTIONS: Sleeping normally, Waking up often, Can't sleep]
   Do NOT include [QUICK_OPTIONS] for free-text questions like "Tell me more about..." or the first open-ended question.`;
}

export function buildSummaryPrompt(child: ChildContext): string {
  return `You are a medical summarization assistant. Given the parent-AI conversation about ${child.name}'s symptoms, produce a structured JSON summary. Respond ONLY with valid JSON, no markdown or extra text.

Format:
{
  "chiefComplaint": "Brief one-line complaint",
  "details": [
    { "label": "When it started", "value": "..." },
    { "label": "Severity", "value": "..." },
    { "label": "What makes it worse", "value": "..." },
    { "label": "Associated symptoms", "value": "..." },
    { "label": "Fluids/Food intake", "value": "..." }
  ],
  "relevantHistory": "Any relevant past medical history or null",
  "allergyNote": "Allergy warning for the doctor or null",
  "suggestedUrgency": "routine | soon | urgent"
}

Child allergies: ${child.allergies.join(', ') || 'None'}
Child conditions: ${child.conditions.join(', ') || 'None'}`;
}

export async function chatCompletion(messages: GroqMessage[]): Promise<string> {
  dbg.groq('chatCompletion', { messageCount: messages.length, model: MODEL });

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.6,
      max_tokens: 512,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    dbg.groqError('chatCompletion HTTP error', `${response.status}: ${errorText}`);
    throw new Error(`Groq API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();

  if (!data.choices?.[0]?.message?.content) {
    dbg.groqError('chatCompletion empty response', data);
    throw new Error('Groq returned an empty response');
  }

  dbg.groq('chatCompletion success', { tokens: data.usage?.total_tokens });
  return data.choices[0].message.content;
}

export async function generateSummary(
  messages: GroqMessage[],
  child: ChildContext
): Promise<{
  chiefComplaint: string;
  details: { label: string; value: string }[];
  relevantHistory: string | null;
  allergyNote: string | null;
  suggestedUrgency: 'routine' | 'soon' | 'urgent';
}> {
  const summaryMessages: GroqMessage[] = [
    { role: 'system', content: buildSummaryPrompt(child) },
    ...messages.filter(m => m.role !== 'system'),
    { role: 'user', content: 'Now generate the structured summary JSON based on the conversation above.' },
  ];

  const response = await chatCompletion(summaryMessages);

  // Extract JSON from response — handle markdown code fences
  let jsonStr = response;

  // Strip markdown code fences if present
  const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    jsonStr = fenceMatch[1].trim();
  } else {
    // Try to extract a JSON object
    const objMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (objMatch) {
      jsonStr = objMatch[0];
    }
  }

  try {
    const parsed = JSON.parse(jsonStr);

    // Validate required fields
    if (!parsed.chiefComplaint || !Array.isArray(parsed.details)) {
      throw new Error('Missing required fields in summary');
    }

    return {
      chiefComplaint: String(parsed.chiefComplaint),
      details: parsed.details.map((d: { label: string; value: string }) => ({
        label: String(d.label),
        value: String(d.value),
      })),
      relevantHistory: parsed.relevantHistory ?? null,
      allergyNote: parsed.allergyNote ?? null,
      suggestedUrgency: ['routine', 'soon', 'urgent'].includes(parsed.suggestedUrgency)
        ? parsed.suggestedUrgency
        : 'routine',
    };
  } catch (e) {
    throw new Error(`Failed to parse AI summary: ${e instanceof Error ? e.message : 'Invalid JSON'}`);
  }
}
