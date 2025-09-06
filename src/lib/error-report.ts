import { supabase } from '@/integrations/supabase/client';

export type ErrorPayload = {
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  viewport: { w: number; h: number };
  screen: { w: number; h: number };
  ts: string;
  userId?: string;
  sessionId: string;
  fingerprint: string;
  source: 'auto' | 'manual';
  severity: 'low' | 'medium' | 'high' | 'critical';
  console?: string[];
};

export function buildErrorPayload(err: unknown, source: 'auto' | 'manual' = 'auto'): ErrorPayload {
  const e = (err ?? {}) as any;
  const message = String(e?.message ?? e ?? 'Unknown error');
  const stack = e?.stack ? String(e.stack) : undefined;
  const url = location.href;
  const userAgent = navigator.userAgent;
  const viewport = { w: window.innerWidth, h: window.innerHeight };
  const screenSize = { w: window.screen.width, h: window.screen.height };
  const ts = new Date().toISOString();
  const sessionId = (window as any).__kolabSessionId ??= crypto.randomUUID();
  const rawSig = `${message}|${url}|${userAgent}`.slice(0, 512);
  const fingerprint = awaitDigest(rawSig);
  
  return { 
    message, 
    stack, 
    url, 
    userAgent, 
    viewport, 
    screen: screenSize, 
    ts, 
    sessionId, 
    fingerprint, 
    source, 
    severity: 'high' 
  };
}

function awaitDigest(s: string): string {
  // quick non-crypto hash that's stable enough for dedupe
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
  }
  return h.toString(16);
}

export async function sendErrorReport(payload: ErrorPayload) {
  try { 
    await supabase.from('error_reports').insert({
      title: payload.message,
      description: payload.stack || payload.message,
      url: payload.url,
      user_agent: payload.userAgent,
      browser_info: {
        viewport: payload.viewport,
        screen: payload.screen,
        userAgent: payload.userAgent
      },
      error_details: payload,
      severity: payload.severity,
      status: 'open'
    }); 
  } catch (e) {
    console.error('Failed to insert error report:', e);
  }
  
  try { 
    await supabase.functions.invoke('notify-error', { body: payload }); 
  } catch (e) {
    console.error('Failed to send error notification:', e);
  }
}