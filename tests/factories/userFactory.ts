import { CreateUserData } from '../../lib/database';
import bcrypt from 'bcryptjs';

export const createTestUser = (overrides: Partial<CreateUserData> = {}): CreateUserData => ({
  username: 'testuser',
  email: 'test@example.com',
  password_hash: bcrypt.hashSync('TestPassword123', 10),
  display_name: 'Test User',
  registration_method: 'email',
  ...overrides
});

export const createTestUserChinese = (overrides: Partial<CreateUserData> = {}): CreateUserData => ({
  username: '测试用户',
  email: 'test-zh@example.com', 
  password_hash: bcrypt.hashSync('TestPassword123', 10),
  display_name: '测试用户',
  registration_method: 'email',
  ...overrides
});

export const createTestOAuthUser = (provider: 'google' | 'github' = 'google', overrides: Partial<CreateUserData> = {}): CreateUserData => ({
  email: `test-${provider}@example.com`,
  display_name: `${provider} User`,
  registration_method: provider,
  ...overrides
});