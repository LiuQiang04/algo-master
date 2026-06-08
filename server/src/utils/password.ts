import bcrypt from 'bcrypt';
import { config } from '../config';

// 加密密码
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, config.bcrypt.saltRounds);
}

// 验证密码
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// 验证密码强度
export function validatePasswordStrength(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('密码长度至少为8位');
  }
  if (password.length > 128) {
    errors.push('密码长度不能超过128位');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('密码必须包含至少一个大写字母');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('密码必须包含至少一个小写字母');
  }
  if (!/\d/.test(password)) {
    errors.push('密码必须包含至少一个数字');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
