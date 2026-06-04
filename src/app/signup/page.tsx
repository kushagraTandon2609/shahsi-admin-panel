"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Phone,
  Sparkles,
  User,
} from "lucide-react";

import { signupUser } from "@/lib/api/auth.api";

export default function SignupPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "Ashish Kumar",
    email: "testashish20260516@gmail.com",
    password: "",
    countryCode: "+91",
    phoneNumber: "",
    userSubType: "CUSTOMER",
  });

  const [message, setMessage] = useState({
    error: "",
    success: "",
  });

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage({ error: "", success: "" });

      const response = await signupUser({
        name: form.name,
        email: form.email,
        password: form.password,
        countryCode: form.countryCode,
        phoneNumber: form.phoneNumber,
        userSubType: form.userSubType,
      });

      setMessage({
        error: "",
        success: response.message || "Signup successful",
      });

      setTimeout(() => {
        router.push("/login");
      }, 700);
    } catch (error: any) {
      setMessage({
        error: error?.message || "Signup failed",
        success: "",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fbfaf6] px-4 py-10 text-neutral-950">
      <div className="mx-auto grid min-h-[calc(100vh-80px)] max-w-[1200px] items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="mx-auto w-full max-w-[560px] rounded-[2.5rem] bg-white p-6 shadow-sm ring-1 ring-neutral-200 md:p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
              Create account
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight">
              Signup to Shahsi
            </h2>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              Signup ke baad login karo, token localStorage me save hoga aur
              Bridal Party APIs authorize ho jayengi.
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

          <form onSubmit={handleSignup} className="mt-7 space-y-5">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                Name
              </span>
              <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-[#fbfaf6] px-4 py-3 focus-within:border-neutral-950">
                <User className="h-4 w-4 text-neutral-500" />
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full bg-transparent text-sm outline-none"
                  placeholder="Ashish Kumar"
                />
              </div>
            </label>

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

            <div className="grid gap-4 sm:grid-cols-[0.38fr_0.62fr]">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                  Country Code
                </span>
                <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-[#fbfaf6] px-4 py-3 focus-within:border-neutral-950">
                  <Phone className="h-4 w-4 text-neutral-500" />
                  <input
                    type="text"
                    required
                    value={form.countryCode}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        countryCode: e.target.value,
                      }))
                    }
                    className="w-full bg-transparent text-sm outline-none"
                    placeholder="+91"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                  Phone Number
                </span>
                <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-[#fbfaf6] px-4 py-3 focus-within:border-neutral-950">
                  <input
                    type="tel"
                    required
                    value={form.phoneNumber}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        phoneNumber: e.target.value,
                      }))
                    }
                    className="w-full bg-transparent text-sm outline-none"
                    placeholder="9876543210"
                  />
                </div>
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                Password
              </span>
              <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-[#fbfaf6] px-4 py-3 focus-within:border-neutral-950">
                <Lock className="h-4 w-4 text-neutral-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, password: e.target.value }))
                  }
                  className="w-full bg-transparent text-sm outline-none"
                  placeholder="Test@123456"
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

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                User Type
              </span>
              <select
                value={form.userSubType}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    userSubType: e.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-neutral-200 bg-[#fbfaf6] px-4 py-3 text-sm outline-none focus:border-neutral-950"
              >
                <option value="CUSTOMER">CUSTOMER</option>
                <option value="BRIDE">BRIDE</option>
                <option value="BRIDESMAID">BRIDESMAID</option>
                <option value="GROOM">GROOM</option>
                <option value="STYLIST">STYLIST</option>
                <option value="VENDOR">VENDOR</option>
                <option value="OTHER">OTHER</option>
              </select>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-neutral-950 px-6 py-4 text-sm font-semibold text-white disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Account
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-neutral-600">
            Already account hai?{" "}
            <Link
              href="/login"
              className="font-semibold text-neutral-950 underline"
            >
              Login karo
            </Link>
          </div>
        </section>

        <section className="hidden overflow-hidden rounded-[2.5rem] bg-neutral-950 text-white lg:block">
          <div className="relative min-h-[760px]">
            <img
              src="https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=1600&auto=format&fit=crop"
              alt="Shahsi signup"
              className="h-full min-h-[760px] w-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-10">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm backdrop-blur">
                <Sparkles className="h-4 w-4" />
                Shahsi Account
              </div>

              <h1 className="max-w-xl text-5xl font-medium tracking-tight">
                Create account to unlock dynamic bridal party workflows.
              </h1>

              <p className="mt-5 max-w-lg leading-7 text-white/70">
                Signup ke baad login karke event create, invite, size, assign
                dress, approve aur payment APIs run kar paoge.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}