import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Context } from 'hono';
import { getCookie } from 'hono/cookie';

export type ServiceClientConfig = {
  url: string;
  serviceRoleKey: string;
  anonKey: string;
};

export const createServiceClient = ({
  url,
  serviceRoleKey,
}: Omit<ServiceClientConfig, 'anonKey'>): SupabaseClient =>
  createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });

export const createAuthenticatedClient = async (
  c: Context,
  { url, anonKey }: Pick<ServiceClientConfig, 'url' | 'anonKey'>
): Promise<SupabaseClient> => {
  // Supabase 세션 쿠키에서 토큰 추출
  const cookieHeader = c.req.header('cookie') || '';
  const sessionData = extractSessionFromCookies(c, cookieHeader);

  // 디버깅 로그
  console.log('[Supabase Auth] Cookie header:', cookieHeader ? 'exists' : 'missing');
  console.log('[Supabase Auth] Session data:', sessionData ? 'found' : 'not found');
  if (sessionData?.access_token) {
    console.log('[Supabase Auth] Token preview:', sessionData.access_token.substring(0, 20) + '...');
  }

  const client = createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  // 세션이 있으면 수동으로 설정
  if (sessionData?.access_token && sessionData?.refresh_token) {
    await client.auth.setSession({
      access_token: sessionData.access_token,
      refresh_token: sessionData.refresh_token,
    });
    console.log('[Supabase Auth] Session set successfully');
  }

  return client;
};

// Hono context와 쿠키 헤더를 사용하여 세션 데이터 추출
function extractSessionFromCookies(c: Context, cookieString: string): { access_token: string; refresh_token: string } | null {
  if (!cookieString) return null;

  // 쿠키 문자열을 파싱하여 모든 쿠키를 객체로 변환
  const cookieMap = new Map<string, string>();
  const cookies = cookieString.split(';').map((c) => c.trim());

  cookies.forEach((cookie) => {
    const [name, ...valueParts] = cookie.split('=');
    const value = valueParts.join('=');
    if (name && value) {
      cookieMap.set(name, value);
    }
  });

  console.log('[Cookie Debug] All cookies:', Array.from(cookieMap.keys()));

  // Supabase 인증 쿠키의 베이스 이름 찾기 (청크 번호 제외)
  const authCookieBase = Array.from(cookieMap.keys()).find(
    (name) => name.includes('-auth-token') && (name.endsWith('.0') || !name.includes('.'))
  );

  if (!authCookieBase) {
    console.log('[Cookie Debug] No Supabase auth token found');
    return null;
  }

  // 베이스 이름에서 청크 번호 제거
  const baseName = authCookieBase.replace(/\.\d+$/, '');
  console.log('[Cookie Debug] Found Supabase cookie base:', baseName);

  // 모든 청크를 순서대로 합치기
  const chunks: string[] = [];
  let chunkIndex = 0;

  while (true) {
    const chunkName = `${baseName}.${chunkIndex}`;
    const chunkValue = cookieMap.get(chunkName);

    if (!chunkValue) break;

    chunks.push(chunkValue);
    chunkIndex++;
  }

  console.log('[Cookie Debug] Found', chunks.length, 'chunks');

  if (chunks.length === 0) {
    // 청크가 없으면 baseName 자체를 시도
    const singleValue = cookieMap.get(baseName);
    if (singleValue) {
      chunks.push(singleValue);
    } else {
      return null;
    }
  }

  // 모든 청크를 합침
  const combinedValue = chunks.join('');
  console.log('[Cookie Debug] Combined value length:', combinedValue.length);

  try {
    let decoded = decodeURIComponent(combinedValue);
    console.log('[Cookie Debug] Decoded value preview:', decoded.substring(0, 50));

    // base64- 접두사가 있으면 제거하고 base64 디코딩
    if (decoded.startsWith('base64-')) {
      console.log('[Cookie Debug] Detected base64- prefix, decoding...');
      const base64String = decoded.substring('base64-'.length);

      try {
        // Node.js 환경에서 base64 디코딩
        decoded = Buffer.from(base64String, 'base64').toString('utf-8');
        console.log('[Cookie Debug] Base64 decoded, new preview:', decoded.substring(0, 50));
      } catch (e) {
        console.error('[Cookie Debug] Failed to decode base64:', e);
        return null;
      }
    }

    // JSON 배열 형식: ["access_token", "refresh_token", ...]
    try {
      const parsed = JSON.parse(decoded);
      console.log('[Cookie Debug] Parsed JSON:', Array.isArray(parsed) ? `array with ${parsed.length} items` : typeof parsed);

      if (Array.isArray(parsed) && parsed.length >= 2 && typeof parsed[0] === 'string' && typeof parsed[1] === 'string') {
        console.log('[Cookie Debug] Returning session from array');
        return {
          access_token: parsed[0],
          refresh_token: parsed[1],
        };
      }

      if (parsed && typeof parsed === 'object' && parsed.access_token && parsed.refresh_token) {
        console.log('[Cookie Debug] Returning session from object');
        return {
          access_token: parsed.access_token,
          refresh_token: parsed.refresh_token,
        };
      }
    } catch (jsonError) {
      console.log('[Cookie Debug] Failed to parse JSON:', jsonError);
    }
  } catch (e) {
    console.error('[Cookie Debug] Failed to process cookie:', e);
  }

  console.log('[Cookie Debug] Could not extract token');
  return null;
}
