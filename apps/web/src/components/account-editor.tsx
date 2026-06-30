"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/components/auth-provider";
import { ApiClientError, updateMe } from "@/lib/api-client";
import type { Account, AccountUpdate } from "@/lib/account-types";

function toFormState(account: Account) {
  return {
    display_name: account.display_name,
    title: account.title ?? "",
    avatar_url: account.avatar_url ?? "",
    bio: account.bio ?? "",
    first_name: account.first_name ?? "",
    last_name: account.last_name ?? "",
    phone: account.phone ?? "",
  };
}

export function AccountEditor({ account }: { account: Account }) {
  const router = useRouter();
  const { refresh, signOut } = useAuth();
  const [form, setForm] = useState(() => toFormState(account));
  const [savedForm, setSavedForm] = useState(() => toFormState(account));
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const next = toFormState(account);
    setForm(next);
    setSavedForm(next);
  }, [account]);

  function updateField(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSuccess(null);
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const body: AccountUpdate = {
      display_name: form.display_name.trim() || undefined,
      title: form.title.trim() || null,
      avatar_url: form.avatar_url.trim() || null,
      bio: form.bio.trim() || null,
      first_name: form.first_name.trim() || null,
      last_name: form.last_name.trim() || null,
      phone: form.phone.trim() || null,
    };

    try {
      const updated = await updateMe(body);
      const next = toFormState(updated);
      setForm(next);
      setSavedForm(next);
      await refresh();
      setSuccess("Changes saved.");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.detail ?? err.message : "Could not save.");
    } finally {
      setLoading(false);
    }
  }

  function handleDiscard() {
    setForm(savedForm);
    setError(null);
    setSuccess(null);
  }

  async function handleSignOut() {
    try {
      await signOut();
    } catch {
      // signOut clears local state in finally; still navigate away.
    }
    router.replace("/feed");
  }

  return (
    <form onSubmit={(e) => void handleSave(e)} className="space-y-8">
      <fieldset className="space-y-4">
        <legend className="font-display text-lg tracking-tight">Display information</legend>
        <p className="text-sm text-muted">Visible to others on your profile.</p>

        <Field label="Display name" id="display_name" required>
          <input
            id="display_name"
            value={form.display_name}
            onChange={(e) => updateField("display_name", e.target.value)}
            required
            className={inputClass}
          />
        </Field>

        <Field label="Title" id="title">
          <input
            id="title"
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
            className={inputClass}
            placeholder="Optional"
          />
        </Field>

        <Field label="Avatar URL" id="avatar_url">
          <input
            id="avatar_url"
            type="url"
            value={form.avatar_url}
            onChange={(e) => updateField("avatar_url", e.target.value)}
            className={inputClass}
            placeholder="https://"
          />
        </Field>

        <Field label="Bio" id="bio">
          <textarea
            id="bio"
            value={form.bio}
            onChange={(e) => updateField("bio", e.target.value)}
            rows={3}
            className={inputClass}
            placeholder="A short line about you"
          />
        </Field>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-display text-lg tracking-tight">Personal information</legend>
        <p className="text-sm text-muted">Private. Not shown on your public profile.</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name" id="first_name">
            <input
              id="first_name"
              value={form.first_name}
              onChange={(e) => updateField("first_name", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Last name" id="last_name">
            <input
              id="last_name"
              value={form.last_name}
              onChange={(e) => updateField("last_name", e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Phone" id="phone">
          <input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Email" id="email">
          <input
            id="email"
            type="email"
            value={account.email}
            readOnly
            className={`${inputClass} text-muted`}
            aria-describedby="email-help"
          />
          <p id="email-help" className="mt-1 text-xs text-muted">
            Your sign-in email. Contact us to change it.
          </p>
        </Field>
      </fieldset>

      {error ? (
        <p role="alert" className="text-sm text-accent">
          {error}
        </p>
      ) : null}
      {success ? (
        <p role="status" className="text-sm text-ink">
          {success}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex rounded-full border border-accent bg-accent px-5 py-2 text-sm text-paper transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={handleDiscard}
          className="inline-flex rounded-full border border-line px-5 py-2 text-sm text-muted transition hover:border-ink hover:text-ink"
        >
          Discard
        </button>
      </div>

      <div className="border-t border-line pt-8">
        <h2 className="font-display text-lg tracking-tight">Sign out</h2>
        <p className="mt-1 text-sm text-muted">End your session on this device.</p>
        <button
          type="button"
          onClick={() => void handleSignOut()}
          className="mt-4 inline-flex rounded-full border border-line px-5 py-2 text-sm text-muted transition hover:border-ink hover:text-ink"
        >
          Sign out
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  id,
  children,
  required,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm text-muted">
        {label}
        {required ? <span className="sr-only"> (required)</span> : null}
      </label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

const inputClass =
  "w-full rounded-sm border border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition focus:border-ink";
