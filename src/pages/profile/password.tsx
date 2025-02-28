import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@/api/client";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordStatus } from "@/types/user";

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\\[\]{};':"\\|,.<>\\/?]).{8,}$/;
const passwordRequirements =
  "Password must be at least 8 characters and include at least one lowercase letter, one uppercase letter, one number, and one special character.";

// Schema for setting new password (no current password required)
const setPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." })
      .regex(passwordRegex, { message: passwordRequirements }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Schema for changing existing password
const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: "Current password is required." }),
    newPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." })
      .regex(passwordRegex, { message: passwordRequirements }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SetPasswordValues = z.infer<typeof setPasswordSchema>;
type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export default function PasswordPage() {
  const navigate = useNavigate();
  const [passwordStatus, setPasswordStatus] = useState<PasswordStatus | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPasswordStatus = async () => {
      try {
        const { data } = await apiClient.getPasswordStatus();
        setPasswordStatus(data);
      } catch (error) {
        console.error("Failed to fetch password status:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPasswordStatus();
  }, []);

  const setPasswordForm = useForm<SetPasswordValues>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const changePasswordForm = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleSetPassword = async (values: SetPasswordValues) => {
    try {
      await apiClient.setPassword(values.newPassword);
      navigate("/profile");
    } catch (error) {
      console.error("Failed to set password:", error);
      setPasswordForm.setError("root", {
        message: "Failed to set password. Please try again.",
      });
    }
  };

  const handleChangePassword = async (values: ChangePasswordValues) => {
    try {
      await apiClient.changePassword(
        values.currentPassword,
        values.newPassword,
      );
      navigate("/profile");
    } catch (error) {
      console.error("Failed to change password:", error);
      changePasswordForm.setError("root", {
        message:
          "Failed to change password. Current password may be incorrect.",
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <p className="text-lg">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  // Don't show the page if password auth is not allowed
  if (!passwordStatus?.allowPassword) {
    navigate("/profile");
    return null;
  }

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {passwordStatus?.passwordEnabled ? "Change Password" : "Set Password"}
        </h1>
        <Button variant="outline" onClick={() => navigate("/profile")}>
          Cancel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {passwordStatus?.passwordEnabled
              ? "Change Your Password"
              : "Create a Password"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {passwordStatus?.passwordEnabled ? (
            // Change password form
            <Form {...changePasswordForm}>
              <form
                onSubmit={changePasswordForm.handleSubmit(handleChangePassword)}
                className="space-y-6"
              >
                {changePasswordForm.formState.errors.root && (
                  <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
                    {changePasswordForm.formState.errors.root.message}
                  </div>
                )}

                <FormField
                  control={changePasswordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={changePasswordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-gray-500">
                        {passwordRequirements}
                      </p>
                    </FormItem>
                  )}
                />

                <FormField
                  control={changePasswordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={changePasswordForm.formState.isSubmitting}
                  >
                    {changePasswordForm.formState.isSubmitting
                      ? "Saving..."
                      : "Change Password"}
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            // Set password form
            <Form {...setPasswordForm}>
              <form
                onSubmit={setPasswordForm.handleSubmit(handleSetPassword)}
                className="space-y-6"
              >
                {setPasswordForm.formState.errors.root && (
                  <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
                    {setPasswordForm.formState.errors.root.message}
                  </div>
                )}

                <FormField
                  control={setPasswordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-gray-500">
                        {passwordRequirements}
                      </p>
                    </FormItem>
                  )}
                />

                <FormField
                  control={setPasswordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={setPasswordForm.formState.isSubmitting}
                  >
                    {setPasswordForm.formState.isSubmitting
                      ? "Setting..."
                      : "Set Password"}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
