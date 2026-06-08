import jwt from 'jsonwebtoken';
import { config } from '../config';

// JWT载荷接口
export interface JwtPayload {
  id: string;
  username: string;
  email: string;
  role: string;
}

// 生成JWT令牌
export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as jwt.SignOptions);
}

// 验证JWT令牌
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwt.secret) as JwtPayload;
}

// 解码JWT令牌（不验证）
export function decodeToken(token: string): JwtPayload | null {
  return jwt.decode(token) as JwtPayload | null;
}

// 生成刷新令牌
export function generateRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: '30d',
  } as jwt.SignOptions);
}
