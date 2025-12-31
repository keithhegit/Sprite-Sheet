import { JWTPayload } from '../types';

/**
 * 简单的 JWT 实现（使用 Web Crypto API）
 */

const base64UrlEncode = (data: string): string => {
  return btoa(data)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

const base64UrlDecode = (data: string): string => {
  let base64 = data.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return atob(base64);
};

export const signJWT = async (payload: JWTPayload, secret: string): Promise<string> => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const headerEncoded = base64UrlEncode(JSON.stringify(header));
  const payloadEncoded = base64UrlEncode(JSON.stringify(payload));
  
  const data = `${headerEncoded}.${payloadEncoded}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  const signatureEncoded = base64UrlEncode(
    String.fromCharCode(...new Uint8Array(signature))
  );
  
  return `${data}.${signatureEncoded}`;
};

export const verifyJWT = async (token: string, secret: string): Promise<JWTPayload | null> => {
  try {
    const [headerEncoded, payloadEncoded, signatureEncoded] = token.split('.');
    if (!headerEncoded || !payloadEncoded || !signatureEncoded) {
      return null;
    }
    
    const data = `${headerEncoded}.${payloadEncoded}`;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    
    const signature = Uint8Array.from(base64UrlDecode(signatureEncoded), (c) => c.charCodeAt(0));
    const isValid = await crypto.subtle.verify('HMAC', key, signature, encoder.encode(data));
    
    if (!isValid) {
      return null;
    }
    
    const payload: JWTPayload = JSON.parse(base64UrlDecode(payloadEncoded));
    
    // 检查是否过期
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return payload;
  } catch {
    return null;
  }
};


