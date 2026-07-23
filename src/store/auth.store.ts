import {
  getAuthenticatedUser,
  login as loginRequest,
  register as registerRequest,
  type LoginPayload,
  type RegisterPayload,
  type User,
} from '../services/auth.service';

import {
  getToken,
  removeToken,
  saveToken,
} from '../services/token.service';

let currentUser: User | null = null;
let currentToken: string | null = null;

export function getCurrentUser(): User | null {
  return currentUser;
}

export function getCurrentToken(): string | null {
  return currentToken;
}

export async function loginUser(payload: LoginPayload): Promise<User> {
  const response = await loginRequest(payload);

  currentToken = response.token;
  currentUser = response.user;

  await saveToken(response.token);

  return response.user;
}

export async function registerUser(
  payload: RegisterPayload
): Promise<User> {
  const response = await registerRequest(payload);

  currentToken = response.token;
  currentUser = response.user;

  await saveToken(response.token);

  return response.user;
}

export async function restoreSession(): Promise<User | null> {
  const storedToken = await getToken();

  if (!storedToken) {
    return null;
  }

  try {
    const response = await getAuthenticatedUser(storedToken);

    currentToken = storedToken;
    currentUser = response.user;

    return response.user;
  } catch {
    currentToken = null;
    currentUser = null;

    await removeToken();

    return null;
  }
}

export async function logoutUser(): Promise<void> {
  currentToken = null;
  currentUser = null;

  await removeToken();
}
