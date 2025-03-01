import { apiClient } from "@/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/context/auth-context";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { UserList, UserStats } from "@/types/user";
import { useEffect, useState } from "react";
import { formatInTimeZone } from "date-fns-tz";

export default function Dashboard() {
  const { signOut } = useAuth();
  const [serverTime, setServerTime] = useState<{
    timestamp: number;
    timezone: string;
  } | null>(null);
  const [users, setUsers] = useState<UserList[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const fetchUsers = async (page: number) => {
    setLoading(true);

    const usersResponse = await apiClient.getAllUsers(page, pageSize);

    if (usersResponse.status === 401) return signOut();

    setUsers(usersResponse.data.data);
    setTotalUsers(usersResponse.data.total);
    setLoading(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch server time
        const serverTimeResponse = await apiClient.getServerTime();
        setServerTime(serverTimeResponse.data);

        // Fetch stats once
        const statsResponse = await apiClient.getUserStats();
        if (statsResponse.status === 401) return signOut();

        setStats(statsResponse.data);

        // Fetch users with pagination
        await fetchUsers(currentPage);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage, pageSize]);

  useEffect(() => {
    const serverTimeUpdate = setInterval(() => {
      setServerTime((prev) => {
        if (!prev) return null;

        return {
          ...prev,
          timestamp: prev.timestamp + 1000,
        };
      });
    }, 1000);

    return () => {
      clearInterval(serverTimeUpdate);
    };
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const totalPages = Math.ceil(totalUsers / pageSize);

  if (loading && !users.length) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <p className="text-lg">Loading dashboard data...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex mb-4">
        <p className="text-sm text-foreground/80">
          Server time:{" "}
          {serverTime?.timestamp
            ? formatInTimeZone(
                new Date(serverTime.timestamp),
                serverTime.timezone,
                "PPpp",
              )
            : ""}{" "}
          ({serverTime?.timezone})
        </p>
      </div>
      {/* Stats Cards */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.userSignUp || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Active Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.todaysActiveSession || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Active Users (7 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.average7dActiveUsers?.toFixed(2) || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Registration Date</TableHead>
              <TableHead className="text-right">Total Logins</TableHead>
              <TableHead>Last Active</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-bold">{user.name}</TableCell>
                  <TableCell>{formatDate(user.registrationDate)}</TableCell>
                  <TableCell className="text-right">
                    {user.totalLoginCount}
                  </TableCell>
                  <TableCell>
                    {user.lastActiveTimestamp
                      ? formatDate(user.lastActiveTimestamp)
                      : "Never"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* User count summary */}
      <div className="mt-2 text-sm text-gray-500">
        Showing {users.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{" "}
        {Math.min(currentPage * pageSize, totalUsers)} of {totalUsers} users
      </div>
    </DashboardLayout>
  );
}
