// Simple auth store for demo purposes
// In production, use proper authentication with hashed passwords

const ADMIN_CREDENTIALS = {
  email: 'admin@linksnap.com',
  password: 'admin123'
}

export function validateCredentials(email: string, password: string): boolean {
  return email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password
}

export function getAdminEmail(): string {
  return ADMIN_CREDENTIALS.email
}
