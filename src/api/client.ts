// API base URL from environment
const API_BASE_URL = "/api";

export interface ApiClientConfig {
  baseURL?: string;
}

export interface ApiResponse<T = never> {
  data: T;
  status: number;
  ok: boolean;
}

export class ApiClient {
  private baseURL: string;

  constructor(config?: ApiClientConfig) {
    this.baseURL = config?.baseURL || API_BASE_URL;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${path}`;

    // By default include credentials for cookie-based auth
    // For /auth/signin endpoint, this should be overridden with 'omit'
    const fetchOptions: RequestInit = {
      ...options,
      credentials: options.credentials || "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, fetchOptions);

      if (response.status === 204) {
        return { data: {} as T, status: response.status, ok: response.ok };
      }

      const data = await response.json().catch(() => ({}));

      return { data, status: response.status, ok: response.ok };
    } catch (error) {
      console.error("API request error:", error);
      throw error;
    }
  }

  // AUTH ENDPOINTS

  async signIn(
    token: string,
  ): Promise<ApiResponse<{ userId: string; sessionToken: string }>> {
    const response = await this.request<{
      userId: string;
      sessionToken: string;
    }>("/auth/signin", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response;
  }

  async signOut(): Promise<ApiResponse> {
    return this.request("/auth/signout", {
      method: "POST",
    });
  }

  // USER ENDPOINTS

  async getCurrentUser(): Promise<
    ApiResponse<{ id: string; email: string; name: string }>
  > {
    return this.request<{ id: string; email: string; name: string }>(
      "/users/me",
    );
  }

  async updateCurrentUser(data: { name: string }): Promise<ApiResponse> {
    return this.request("/users/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async getAllUsers(
    page = 1,
    limit = 10,
  ): Promise<
    ApiResponse<{
      data: Array<{
        id: string;
        name: string;
        registrationDate: number;
        totalLoginCount: number;
        lastActiveTimestamp: number | null;
      }>;
      total: number;
    }>
  > {
    return this.request<{
      data: Array<{
        id: string;
        name: string;
        registrationDate: number;
        totalLoginCount: number;
        lastActiveTimestamp: number | null;
      }>;
      total: number;
    }>(`/users?page=${page}&limit=${limit}`);
  }

  async getUserStats(): Promise<
    ApiResponse<{
      userSignUp: number;
      todaysActiveSession: number;
      average7dActiveUsers: number;
    }>
  > {
    return this.request<{
      userSignUp: number;
      todaysActiveSession: number;
      average7dActiveUsers: number;
    }>("/users/stats");
  }

  async getPasswordStatus(): Promise<
    ApiResponse<{
      allowPassword: boolean;
      passwordEnabled: boolean;
    }>
  > {
    return this.request<{
      allowPassword: boolean;
      passwordEnabled: boolean;
    }>("/users/password");
  }

  async setPassword(password: string): Promise<ApiResponse> {
    return this.request("/users/password", {
      method: "POST",
      body: JSON.stringify({ password }),
    });
  }

  async changePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<ApiResponse> {
    return this.request("/users/password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // SESSION ENDPOINTS

  async getUserSessions(): Promise<
    ApiResponse<
      Array<{
        id: string;
        userId: string;
        loginDate: number;
        lastActiveAt: number;
        expiresAt: number;
        ipAddress: string;
        userAgent: string;
        isCurrentSession: boolean;
      }>
    >
  > {
    return this.request<
      Array<{
        id: string;
        userId: string;
        loginDate: number;
        lastActiveAt: number;
        expiresAt: number;
        ipAddress: string;
        userAgent: string;
        isCurrentSession: boolean;
      }>
    >("/sessions");
  }

  async revokeSession(sessionId: string): Promise<ApiResponse> {
    return this.request(`/sessions/${sessionId}`, {
      method: "DELETE",
    });
  }
}

// Create a default instance
export const apiClient = new ApiClient();

export default apiClient;
