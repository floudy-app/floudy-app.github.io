import { describe, it, expect } from 'vitest';
import { validatePassword, validateMatch } from '../utils/validation.js';

describe('Password Reset form validation', () =>
{
  it('accepts matching valid passwords', () => {
    const passErr = validatePassword('NewPassword123');
    const matchErr = validateMatch('NewPassword123', 'NewPassword123');

    expect(passErr).toBeNull();
    expect(matchErr).toBeNull();
  });

  it('rejects passwords under 8 characters', () => {
    const passErr = validatePassword('Short1');
    expect(passErr).toBe('At least 8 characters.');
  });

  it('rejects passwords without a number', () => {
    const passErr = validatePassword('NoNumberPass');
    expect(passErr).toBe('Must contain at least one number.');
  });

  it('rejects mismatched confirm password', () => {
    const passErr = validatePassword('ValidPass123');
    const matchErr = validateMatch('ValidPass123', 'ValidPass321');

    expect(passErr).toBeNull();
    expect(matchErr).toBe('Passwords do not match.');
  });
});
