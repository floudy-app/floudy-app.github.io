import { describe, it, expect } from 'vitest';
import { validateEmail, validateUsername, validatePassword, validateMatch } from '../utils/validation.js';

describe('Registration validation (email integration)', () =>
{
  function validateRegistration(form) {
    return {
      username: validateUsername(form.username),
      email: validateEmail(form.email),
      password: validatePassword(form.password),
      confirm: validateMatch(form.password, form.confirm),
    };
  }

  function isValid(errs) {
    return !Object.values(errs).some(Boolean);
  }

  it('valid registration with all fields returns no errors', () => {
    const errs = validateRegistration({
      username: 'newuser',
      email: 'user@example.com',
      password: 'password1',
      confirm: 'password1'
    });
    expect(isValid(errs)).toBe(true);
  });

  it('missing email is invalid', () => {
    const errs = validateRegistration({
      username: 'newuser',
      email: '',
      password: 'password1',
      confirm: 'password1'
    });
    expect(isValid(errs)).toBe(false);
    expect(errs.email).toBeTruthy();
  });

  it('invalid email format is rejected', () => {
    const errs = validateRegistration({
      username: 'newuser',
      email: 'notanemail',
      password: 'password1',
      confirm: 'password1'
    });
    expect(isValid(errs)).toBe(false);
    expect(errs.email).toBeTruthy();
  });

  it('email without domain is rejected', () => {
    const errs = validateRegistration({
      username: 'newuser',
      email: 'user@localhost',
      password: 'password1',
      confirm: 'password1'
    });
    expect(isValid(errs)).toBe(false);
    expect(errs.email).toBeTruthy();
  });

  it('valid email with subdomain is accepted', () => {
    const errs = validateRegistration({
      username: 'newuser',
      email: 'user@sub.domain.com',
      password: 'password1',
      confirm: 'password1'
    });
    expect(isValid(errs)).toBe(true);
  });

  it('all fields empty returns errors for all', () => {
    const errs = validateRegistration({
      username: '',
      email: '',
      password: '',
      confirm: ''
    });
    expect(errs.username).toBeTruthy();
    expect(errs.email).toBeTruthy();
    expect(errs.password).toBeTruthy();
  });

  it('password mismatch is caught', () => {
    const errs = validateRegistration({
      username: 'newuser',
      email: 'user@example.com',
      password: 'password1',
      confirm: 'password2'
    });
    expect(errs.confirm).toBeTruthy();
  });
});
