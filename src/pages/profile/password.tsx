import { apiClient } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PasswordInput } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { PasswordStatus } from "@/types/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\\[\]{};':"\\|,.<>\\/?]).{8,}$/;
const passwordRequirements = (name: string) =>
  `${name} must be at least 8 characters and include at least one lowercase letter, one uppercase letter, one number, and one special character.`;

const password = (name: string) =>
  z
    .string({
      required_error: `${name} is required`,
      invalid_type_error: `${name} must be a string`,
    })
    .min(8, {
      message: `${name} must be at least 8 characters`,
    })
    .max(64, {
      message: `${name} must be at most 64 characters`,
    })
    .regex(passwordRegex, {
      message: passwordRequirements(name),
    });

// Schema for setting new password (no current password required)
const setPasswordSchema = z
  .object({
    newPassword: password("Password"),
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
    newPassword: password("Password"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SetPasswordValues = z.infer<typeof setPasswordSchema>;
type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export default function PasswordPage() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [passwordStatus, setPasswordStatus] = useState<PasswordStatus | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPasswordStatus = async () => {
      const passwordStatusResponse = await apiClient.getPasswordStatus();

      if (passwordStatusResponse.status === 401) return signOut();

      setPasswordStatus(passwordStatusResponse.data);
      setLoading(false);
    };

    fetchPasswordStatus();
  }, [signOut]);

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
    const setPasswordResponse = await apiClient.setPassword(values.newPassword);
    if (setPasswordResponse.status === 401) return signOut();

    navigate("/profile");
  };

  const handleChangePassword = async (values: ChangePasswordValues) => {
    const changePasswordResponse = await apiClient.changePassword(
      values.currentPassword,
      values.newPassword,
    );
    if (changePasswordResponse.status === 401) return signOut();

    navigate("/profile");
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-100 items-center justify-center">
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
                    <FormItem className="w-full lg:w-1/2 xl:w-1/3">
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <PasswordInput {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={changePasswordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem className="w-full lg:w-1/2 xl:w-1/3">
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <PasswordInput {...field} maxLength={64} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={changePasswordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem className="w-full lg:w-1/2 xl:w-1/3">
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <PasswordInput {...field} maxLength={64} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end lg:justify-start">
                  <Button
                    type="submit"
                    className="w-full sm:w-auto"
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
                    <FormItem className="w-full lg:w-1/2 xl:w-1/3">
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <PasswordInput {...field} maxLength={64} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={setPasswordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem className="w-full lg:w-1/2 xl:w-1/3">
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <PasswordInput {...field} maxLength={64} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end lg:justify-start">
                  <Button
                    type="submit"
                    className="w-full sm:w-auto"
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
