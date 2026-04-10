const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email) {
  if (!email || !email.trim()) return 'Email is required';
  if (!EMAIL_RE.test(email.trim())) return 'Enter a valid email';
  return null;
}

export function validatePassword(password) {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return null;
}

export function validateRequired(value, fieldName) {
  if (!value || !String(value).trim()) return `${fieldName} is required`;
  return null;
}

export function validatePhone(phone) {
  if (!phone || !String(phone).trim()) return 'Phone is required';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length < 8) return 'Enter a valid phone number';
  return null;
}

export function validateRegisterForm({ fullName, email, phone, password, confirmPassword }) {
  const errors = {};
  const fn = validateRequired(fullName, 'Full name');
  if (fn) errors.fullName = fn;
  const em = validateEmail(email);
  if (em) errors.email = em;
  const ph = validatePhone(phone);
  if (ph) errors.phone = ph;
  const pw = validatePassword(password);
  if (pw) errors.password = pw;
  const cp = validateRequired(confirmPassword, 'Confirm password');
  if (cp) errors.confirmPassword = cp;
  else if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
  return errors;
}

export function validateLoginForm({ email, password }) {
  const errors = {};
  const em = validateEmail(email);
  if (em) errors.email = em;
  const pw = validatePassword(password);
  if (pw) errors.password = pw;
  return errors;
}
