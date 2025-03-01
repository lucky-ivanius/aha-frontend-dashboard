import { apiClient } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { PasswordStatus, Session } from "@/types/user";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const { user, getSessionId, signOut } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [passwordStatus, setPasswordStatus] = useState<PasswordStatus | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const [sessionsResponse, passwordStatusResponse] = await Promise.all([
        apiClient.getUserSessions(),
        apiClient.getPasswordStatus(),
      ]);

      if (sessionsResponse.status === 401) return signOut();
      if (passwordStatusResponse.status === 401) return signOut();

      setSessions(sessionsResponse.data);
      setPasswordStatus(passwordStatusResponse.data);
      setLoading(false);
    };

    fetchData();
  }, [signOut]);

  const handleRevokeSession = async (sessionId: string) => {
    const revokeResponse = await apiClient.revokeSession(sessionId);
    if (revokeResponse.status === 401) return signOut();

    setSessions(sessions.filter((session) => session.id !== sessionId));
  };

  const formatDateTime = (dateString: number) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const parseUserAgent = (userAgent: string) => {
    const result = {
      device: "Unknown Device",
      browser: "Unknown Browser",
      icon: "💻",
    };

    // Detect OS/Device
    if (userAgent.includes("iPhone")) {
      result.device = "iPhone";
      result.icon = "📱";
    } else if (userAgent.includes("iPad")) {
      result.device = "iPad";
      result.icon = "📱";
    } else if (userAgent.includes("Android")) {
      result.device = "Android";
      result.icon = "📱";
    } else if (userAgent.includes("Windows")) {
      result.device = "Windows";
      result.icon = "💻";
    } else if (userAgent.includes("Mac OS")) {
      result.device = "Mac";
      result.icon = "💻";
    } else if (userAgent.includes("Linux")) {
      result.device = "Linux";
      result.icon = "💻";
    }

    // Detect Browser
    if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) {
      result.browser = "Chrome";
    } else if (userAgent.includes("Firefox")) {
      result.browser = "Firefox";
    } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
      result.browser = "Safari";
    } else if (userAgent.includes("Edge") || userAgent.includes("Edg")) {
      result.browser = "Edge";
    } else if (userAgent.includes("Opera") || userAgent.includes("OPR")) {
      result.browser = "Opera";
    }

    return result;
  };

  const currentSession = sessions.find(
    (session) => session.id === getSessionId(),
  );
  const otherSessions = sessions.filter(
    (session) => session.id !== getSessionId(),
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <p className="text-lg">Loading profile data...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">User Profile</h1>
        <Button onClick={() => navigate("/profile/edit")}>Edit Profile</Button>
      </div>

      {/* User Information */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="font-medium">{user?.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Password</p>
                {passwordStatus?.passwordEnabled ? (
                  <Button
                    size="sm"
                    className="mt-2"
                    variant="outline"
                    onClick={() => navigate("/profile/password")}
                  >
                    Change Password
                  </Button>
                ) : passwordStatus?.allowPassword ? (
                  <Button
                    size="sm"
                    className="mt-2"
                    variant="outline"
                    onClick={() => navigate("/profile/password")}
                  >
                    Set Password
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Current Session */}
          {currentSession && (
            <div className="mb-6">
              <h3 className="mb-2 font-semibold">Current Session</h3>
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <p className="text-3xl">
                          {parseUserAgent(currentSession.userAgent).icon}
                        </p>
                        <div>
                          <p className="font-medium">
                            {parseUserAgent(currentSession.userAgent).device}
                          </p>
                          <p className="text-xs text-gray-500">
                            {parseUserAgent(currentSession.userAgent).browser}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">IP Address</p>
                      <p>{currentSession.ipAddress}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Created</p>
                      <p>{formatDateTime(currentSession.loginDate)}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Last Active</p>
                      <p>{formatDateTime(currentSession.lastActiveAt)}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Expires</p>
                      <p>{formatDateTime(currentSession.expiresAt)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Other Sessions */}
          <div>
            <h3 className="mb-2 font-semibold">Other Sessions</h3>
            {otherSessions.length === 0 ? (
              <Card className="bg-gray-50">
                <CardContent className="pt-6 text-center text-gray-500">
                  No other active sessions
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {otherSessions.map((session) => (
                  <Card key={session.id} className="border-gray-200">
                    <CardContent className="pt-6">
                      <div className="grid gap-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <p className="text-3xl">
                              {parseUserAgent(session.userAgent).icon}
                            </p>
                            <div>
                              <p className="font-medium">
                                {parseUserAgent(session.userAgent).device}
                              </p>
                              <p className="text-xs text-gray-500">
                                {parseUserAgent(session.userAgent).browser}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRevokeSession(session.id)}
                          >
                            Revoke
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-xs text-gray-500">IP Address</p>
                            <p>{session.ipAddress}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Created</p>
                            <p>{formatDateTime(session.loginDate)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Last Active</p>
                            <p>{formatDateTime(session.lastActiveAt)}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
