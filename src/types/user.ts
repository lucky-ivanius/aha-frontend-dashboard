export interface User {
  id: string;
  email: string;
  name: string;
}

export interface UserList {
  id: string;
  name: string;
  registrationDate: number;
  totalLoginCount: number;
  lastActiveTimestamp: number | null;
}

export interface UserPagination {
  data: UserList[];
  total: number;
}

export interface UserStats {
  userSignUp: number;
  todaysActiveSession: number;
  average7dActiveUsers: number;
}

export interface PasswordStatus {
  allowPassword: boolean;
  passwordEnabled: boolean;
}

export interface Session {
  id: string;
  userId: string;
  loginDate: number;
  lastActiveAt: number;
  expiresAt: number;
  ipAddress: string;
  userAgent: string;
}
