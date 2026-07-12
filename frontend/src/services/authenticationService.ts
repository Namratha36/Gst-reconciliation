import { api } from "@/services/api";
import { unwrap } from "@/services/http";
import type { AuthSession, User } from "@/types/domain";

const ACCESS_TOKEN_KEY = "graphgst.accessToken";
const REFRESH_TOKEN_KEY = "graphgst.refreshToken";
const LEGACY_TOKEN_KEY = "token";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {
  name: string;
  organizationName: string;
}

export interface TokenStore {
  getAccessToken(): string | null;
  getRefreshToken(): string | null;
  setSession(session: AuthSession): void;
  setTokens(tokens: Pick<AuthSession, "accessToken" | "refreshToken">): void;
  clear(): void;
}

export const tokenStore: TokenStore = {
  getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY) ?? localStorage.getItem(LEGACY_TOKEN_KEY);
  },

  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setSession(session) {
    localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
    localStorage.setItem(LEGACY_TOKEN_KEY, session.accessToken);
  },

  setTokens(tokens) {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    localStorage.setItem(LEGACY_TOKEN_KEY, tokens.accessToken);
  },

  clear() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
  },
};

export interface AuthenticationService {
  login(request: LoginRequest): Promise<AuthSession>;
  register(request: RegisterRequest): Promise<AuthSession>;
  startDevSession(): AuthSession;
  refreshSession(): Promise<AuthSession | null>;
  getCurrentUser(): Promise<User | null>;
  logout(): Promise<void>;
  hasSession(): boolean;
}

const devUser: User = {
  id: "DEV-SHELL-USER",
  name: "Developer",
  email: "dev@graphgst.local",
  role: "Admin",
  organizationId: "DEV-ORG",
  organizationName: "GraphGST Dev Shell",
};

function createDevSession(): AuthSession {
  return {
    user: devUser,
    accessToken: "dev-shell-access",
    refreshToken: "dev-shell-refresh",
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}

export const authenticationService: AuthenticationService = {
  async login(request) {
    const response = await api.post<AuthSession | { data: AuthSession }>("/auth/login", request);
    const session = unwrap(response.data);
    tokenStore.setSession(session);
    return session;
  },

  async register(request) {
    const response = await api.post<AuthSession | { data: AuthSession }>("/auth/register", request);
    const session = unwrap(response.data);
    tokenStore.setSession(session);
    return session;
  },

  startDevSession() {
    const session = createDevSession();
    tokenStore.setSession(session);
    return session;
  },

  async refreshSession() {
    const refreshToken = tokenStore.getRefreshToken();
    if (!refreshToken) return null;

    try {
      const response = await api.post<Pick<AuthSession, "accessToken" | "refreshToken" | "expiresAt">>("/auth/refresh", { refreshToken });
      const tokens = response.data;
      tokenStore.setTokens(tokens);
      return {
        user: await this.getCurrentUser() as User,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
      };
    } catch {
      tokenStore.clear();
      return null;
    }
  },

  async getCurrentUser() {
    if (tokenStore.getAccessToken() === "dev-shell-access") {
      return devUser;
    }

    try {
      const response = await api.get<User | { data: User }>("/auth/me");
      return unwrap(response.data);
    } catch {
      return null;
    }
  },

  async logout() {
    const refreshToken = tokenStore.getRefreshToken();
    if (refreshToken) {
      try {
        await api.post("/auth/logout", { refreshToken });
      } catch {
        // Local session still must be cleared if the network/logout endpoint fails.
      }
    }
    tokenStore.clear();
  },

  hasSession() {
    return Boolean(tokenStore.getAccessToken());
  },
};
