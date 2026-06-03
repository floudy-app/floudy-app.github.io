import { describe, it, expect } from 'vitest';
import 
{
  validateUsername,
  validateEmail,
  validatePassword,
  validateMatch,
  validateFilename,
  validateLoginFields,
} 
from '../utils/validation.js';

describe('validateUsername', () => 
{
  it('rejects empty string',         () => expect(validateUsername('')).toBeTruthy());
  it('rejects too short (< 3)',      () => expect(validateUsername('ab')).toBeTruthy());
  it('rejects too long (> 20)',      () => expect(validateUsername('a'.repeat(21))).toBeTruthy());
  it('rejects special characters',   () => expect(validateUsername('ab!')).toBeTruthy());
  it('rejects spaces',               () => expect(validateUsername('hello world')).toBeTruthy());
  it('accepts letters + numbers',    () => expect(validateUsername('user99')).toBeNull());
  it('accepts underscores',          () => expect(validateUsername('my_user')).toBeNull());
  it('accepts mixed case',           () => expect(validateUsername('Alice')).toBeNull());
});

describe('validateEmail', () => 
{
  it('rejects empty',                () => expect(validateEmail('')).toBeTruthy());
  it('rejects no @',                 () => expect(validateEmail('notanemail')).toBeTruthy());
  it('rejects no domain',            () => expect(validateEmail('a@b')).toBeTruthy());
  it('accepts valid email',          () => expect(validateEmail('user@example.com')).toBeNull());
  it('accepts + in local part',      () => expect(validateEmail('a+b@c.io')).toBeNull());
});

describe('validatePassword', () => 
{
  it('rejects empty',                () => expect(validatePassword('')).toBeTruthy());
  it('rejects too short (< 8)',      () => expect(validatePassword('abc123')).toBeTruthy());
  it('rejects no digit',             () => expect(validatePassword('abcdefgh')).toBeTruthy());
  it('accepts 8+ chars with digit',  () => expect(validatePassword('password1')).toBeNull());
  it('accepts long password',        () => expect(validatePassword('correcthorse1battery')).toBeNull());
});

describe('validateMatch', () => 
{
  it('rejects mismatch',             () => expect(validateMatch('abc', 'def')).toBeTruthy());
  it('accepts identical strings',    () => expect(validateMatch('same', 'same')).toBeNull());
  it('rejects case mismatch',        () => expect(validateMatch('Abc', 'abc')).toBeTruthy());
});

describe('validateFilename', () => 
{
  it('rejects empty',                () => expect(validateFilename('')).toBeTruthy());
  it('rejects whitespace only',      () => expect(validateFilename('   ')).toBeTruthy());
  it('rejects forward slash',        () => expect(validateFilename('a/b')).toBeTruthy());
  it('rejects backslash',            () => expect(validateFilename('a\\b')).toBeTruthy());
  it('rejects > 100 chars',          () => expect(validateFilename('a'.repeat(101))).toBeTruthy());
  it('accepts normal filename',      () => expect(validateFilename('report_2024.pdf')).toBeNull());
  it('accepts dots and dashes',      () => expect(validateFilename('my-file.tar.gz')).toBeNull());
});

describe('validateLoginFields', () => 
{
  it('rejects empty username',       () => expect(validateLoginFields('', 'pass')).toBeTruthy());
  it('rejects empty password',       () => expect(validateLoginFields('user', '')).toBeTruthy());
  it('accepts any non-empty pair',   () => expect(validateLoginFields('user', 'pass')).toBeNull());
});
