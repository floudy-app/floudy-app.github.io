export function validateUsername(v) 
{
  if (!v) return 'Username is required.';
  if (v.length < 3) return 'At least 3 characters.';
  if (v.length > 20) return 'At most 20 characters.';
  if (!/^[a-zA-Z0-9_]+$/.test(v)) return 'Letters, numbers, and _ only.';
  return null;
}

export function validateEmail(v) 
{
  if (!v) return 'Email is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Invalid email format.';
  return null;
}

export function validatePassword(v) 
{
  if (!v) return 'Password is required.';
  if (v.length < 8) return 'At least 8 characters.';
  if (!/\d/.test(v)) return 'Must contain at least one number.';
  return null;
}

export function validateMatch(a, b) 
{
  if (a !== b) return 'Passwords do not match.';
  return null;
}

export function validateFilename(v) 
{
  if (!v || !v.trim()) return 'Filename cannot be empty.';
  if (v.length > 100) return 'Filename too long.';
  if (/[/\\<>:"|?*\0]/.test(v)) return 'Invalid characters in filename.';
  return null;
}

export function validateLoginFields(username, password) 
{
  if (!username) return 'Username or email is required.';
  if (!password) return 'Password is required.';
  return null;
}
