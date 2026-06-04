"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Lock, Mail, Sparkles } from "lucide-react";

import { loginUser } from "@/lib/api/auth.api";

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: "testashish20260513@gmail.com",
    password: "",
  });

  const [message, setMessage] = useState({
    error: "",
    success: "",
  });

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage({ error: "", success: "" });

      const response = await loginUser({
        email: form.email,
        password: form.password,
      });

      setMessage({
        error: "",
        success: response.message || "Login successful",
      });

      setTimeout(() => {
        router.push("/bridal-party");
      }, 600);
    } catch (error: any) {
      setMessage({
        error: error?.message || "Login failed",
        success: "",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fbfaf6] px-4 py-10 text-neutral-950">
      <div className="mx-auto grid min-h-[calc(100vh-80px)] max-w-[1200px] items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="hidden overflow-hidden rounded-[2.5rem] bg-neutral-950 text-white lg:block">
          <div className="relative min-h-[720px]">
            <img
              src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1600&auto=format&fit=crop"
              alt="Shahsi bridal login"
              className="h-full min-h-[720px] w-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-10">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm backdrop-blur">
                <Sparkles className="h-4 w-4" />
                Shahsi Bridal Party
              </div>

              <h1 className="max-w-xl text-5xl font-medium tracking-tight">
                Login to manage bridal party events, members, dress selection and payments.
              </h1>

              <p className="mt-5 max-w-lg leading-7 text-white/70">
                Token login ke baad localStorage me save hoga aur protected APIs
                automatically authorize ho jayengi.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[520px] rounded-[2.5rem] bg-white p-6 shadow-sm ring-1 ring-neutral-200 md:p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
              Welcome back
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight">
              Login to Shahsi
            </h2>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              Bridal Party APIs use karne ke liye pehle login zaroori hai.
            </p>
          </div>

          {message.error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {message.error}
            </div>
          )}

          {message.success && (
            <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              {message.success}
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-7 space-y-5">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                Email
              </span>
              <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-[#fbfaf6] px-4 py-3 focus-within:border-neutral-950">
                <Mail className="h-4 w-4 text-neutral-500" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full bg-transparent text-sm outline-none"
                  placeholder="you@example.com"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                Password
              </span>
              <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-[#fbfaf6] px-4 py-3 focus-within:border-neutral-950">
                <Lock className="h-4 w-4 text-neutral-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, password: e.target.value }))
                  }
                  className="w-full bg-transparent text-sm outline-none"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-neutral-500"
                  aria-label="Toggle password"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-neutral-950 px-6 py-4 text-sm font-semibold text-white disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Login
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-neutral-600">
            Account nahi hai?{" "}
            <Link href="/signup" className="font-semibold text-neutral-950 underline">
              Signup karo
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}