"use client";

import { useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { Topbar } from "@/components/dashboard/topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Save, Shield, User } from "lucide-react";
import { toast } from "sonner";

export default function AccountPage() {
  const { user, signOut } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setUpdatingPassword(true);
    try {
      const res = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update password");

      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update password"
      );
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Account" />
      <div className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Account Settings
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage your account preferences and security.
          </p>
        </div>

        <div className="max-w-2xl space-y-4 sm:space-y-6">
          <Card className="transition-all duration-200 hover:shadow-sm">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/10 to-indigo-500/10">
                  <User className="h-4 w-4 text-purple-500" />
                </div>
                <div>
                  <CardTitle>Profile</CardTitle>
                  <CardDescription>
                    Your account information.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user?.email ?? ""} disabled className="transition-all duration-200" />
                <p className="text-xs text-muted-foreground">
                  Your email address is managed through your authentication
                  provider.
                </p>
              </div>
              <div className="space-y-2">
                <Label>User ID</Label>
                <Input value={user?.id ?? ""} disabled className="font-mono text-xs transition-all duration-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="transition-all duration-200 hover:shadow-sm">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/10 to-indigo-500/10">
                  <Shield className="h-4 w-4 text-purple-500" />
                </div>
                <div>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="transition-all duration-200 focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="transition-all duration-200 focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="transition-all duration-200 focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={handleUpdatePassword}
                  disabled={updatingPassword || !newPassword || !confirmPassword}
                  className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 border-0 text-white transition-all duration-300"
                >
                  {updatingPassword ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Update Password
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-all duration-200 hover:shadow-sm border-destructive/20">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle>Danger Zone</CardTitle>
              <CardDescription>
                Irreversible account actions.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <Separator className="mb-4" />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium">Sign out</p>
                  <p className="text-xs text-muted-foreground">
                    Sign out of your account on this device.
                  </p>
                </div>
                <Button variant="outline" onClick={signOut} className="w-full sm:w-auto">
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
