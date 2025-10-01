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
  const sessionData = extractSessionFromCookies(cookieHeader);

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
  }

  return client;
};

// Hono context와 쿠키 헤더를 사용하여 세션 데이터 추출
function extractSessionFromCookies(cookieString: string): { access_token: string; refresh_token: string } | null {
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

  // Supabase 인증 쿠키의 베이스 이름 찾기 (청크 번호 제외)
  const authCookieBase = Array.from(cookieMap.keys()).find(
    (name) => name.includes('-auth-token') && (name.endsWith('.0') || !name.includes('.'))
  );

  if (!authCookieBase) {
    return null;
  }

  // 베이스 이름에서 청크 번호 제거
  const baseName = authCookieBase.replace(/\.\d+$/, '');

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
  try {
    let decoded = decodeURIComponent(combinedValue);

    // base64- 접두사가 있으면 제거하고 base64 디코딩
    if (decoded.startsWith('base64-')) {
      const base64String = decoded.substring('base64-'.length);

      try {
        // Node.js 환경에서 base64 디코딩
        decoded = Buffer.from(base64String, 'base64').toString('utf-8');
      } catch (e) {
        return null;
      }
    }

    // JSON 배열 형식: ["access_token", "refresh_token", ...]
    try {
      const parsed = JSON.parse(decoded);
      if (Array.isArray(parsed) && parsed.length >= 2 && typeof parsed[0] === 'string' && typeof parsed[1] === 'string') {
        return {
          access_token: parsed[0],
          refresh_token: parsed[1],
        };
      }

      if (parsed && typeof parsed === 'object' && parsed.access_token && parsed.refresh_token) {
        return {
          access_token: parsed.access_token,
          refresh_token: parsed.refresh_token,
        };
      }
    } catch (jsonError) {
      void jsonError;
    }
  } catch (e) {
    void e;
  }

  return null;
}
