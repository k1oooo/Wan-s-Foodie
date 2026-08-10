"use client";

import { useState, type FormEvent } from "react";
import {
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface UsersClientProps {
  currentEmail: string;
  lastSignInAt: string | null;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function UsersClient({
  currentEmail,
  lastSignInAt,
}: UsersClientProps) {
  // Email form
  const [newEmail, setNewEmail] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);

  // Password form
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const passwordTooShort = newPassword.length > 0 && newPassword.length < 8;
  const passwordsMismatch =
    confirmPassword.length > 0 && newPassword !== confirmPassword;

  async function handleEmailSubmit(e: FormEvent) {
    e.preventDefault();
    if (!newEmail.trim() || newEmail.trim() === currentEmail) return;

    setSavingEmail(true);
    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({
      email: newEmail.trim(),
    });

    setSavingEmail(false);

    if (error) {
      toast.error(error.message || "Couldn't update email. Please try again.");
      return;
    }

    toast.success(
      `Confirmation link sent to ${newEmail.trim()}. Your email won't change until you click it.`,
    );
    setNewEmail("");
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    if (!newPassword || passwordTooShort || passwordsMismatch) return;

    setSavingPassword(true);
    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setSavingPassword(false);

    if (error) {
      toast.error(
        error.message || "Couldn't update password. Please try again.",
      );
      return;
    }

    toast.success("Password updated successfully");
    setNewPassword("");
    setConfirmPassword("");
  }

  return (
    <div className="max-w-2xl space-y-4">
      {/* Account overview */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4.5 w-4.5 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-900">Your account</h2>
        </div>
        <dl className="mt-3 space-y-1.5 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-slate-500">Email</dt>
            <dd className="font-medium text-slate-900">{currentEmail}</dd>
          </div>
          {lastSignInAt && (
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Last signed in</dt>
              <dd className="text-slate-700">{formatDate(lastSignInAt)}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Change email */}
      <form
        onSubmit={handleEmailSubmit}
        className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5"
      >
        <div className="flex items-center gap-2">
          <Mail className="h-4.5 w-4.5 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-900">Change email</h2>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          You&apos;ll get a confirmation link at the new address — the change
          only takes effect once you click it.
        </p>

        <div className="mt-3">
          <label
            htmlFor="new-email"
            className="text-xs font-medium text-slate-600"
          >
            New email
          </label>
          <input
            id="new-email"
            type="email"
            required
            autoComplete="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder={currentEmail}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <button
          type="submit"
          disabled={
            savingEmail || !newEmail.trim() || newEmail.trim() === currentEmail
          }
          className="mt-3.5 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {savingEmail && <Loader2 className="h-4 w-4 animate-spin" />}
          Send confirmation link
        </button>
      </form>

      {/* Change password */}
      <form
        onSubmit={handlePasswordSubmit}
        className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5"
      >
        <div className="flex items-center gap-2">
          <KeyRound className="h-4.5 w-4.5 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-900">
            Change password
          </h2>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          You&apos;re already signed in, so no current password is needed — just
          choose a new one.
        </p>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="new-password"
              className="text-xs font-medium text-slate-600"
            >
              New password
            </label>
            <div className="relative mt-1">
              <input
                id="new-password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                aria-invalid={passwordTooShort}
                className={`w-full rounded-lg border px-3 py-2 pr-9 text-sm focus:outline-none focus:ring-2 ${
                  passwordTooShort
                    ? "border-red-300 focus:ring-red-100"
                    : "border-slate-200 focus:border-slate-400 focus:ring-slate-200"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {passwordTooShort && (
              <p className="mt-1 text-xs text-red-500">
                At least 8 characters.
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="text-xs font-medium text-slate-600"
            >
              Confirm new password
            </label>
            <input
              id="confirm-password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              aria-invalid={passwordsMismatch}
              className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                passwordsMismatch
                  ? "border-red-300 focus:ring-red-100"
                  : "border-slate-200 focus:border-slate-400 focus:ring-slate-200"
              }`}
            />
            {passwordsMismatch && (
              <p className="mt-1 text-xs text-red-500">
                Passwords don&apos;t match.
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={
            savingPassword ||
            !newPassword ||
            !confirmPassword ||
            passwordTooShort ||
            passwordsMismatch
          }
          className="mt-3.5 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {savingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
          Update password
        </button>
      </form>
    </div>
  );
}
