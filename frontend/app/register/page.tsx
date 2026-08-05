"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"

export default function Register() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    setError("")
    console.log("[v0] Register submitted:", { username })
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-dark via-brand-mid to-brand-light px-4 py-10">
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: `url(/images/Register_Background.png)` }}
        aria-hidden="true"
      />
      <div className="w-full max-w-md overflow-hidden rounded-[2rem] border border-white/30 bg-white/95 shadow-2xl shadow-brand-dark/25 backdrop-blur-sm">
        <div className="p-8">
          <div className="mb-6 flex flex-col items-center text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-brand-dark/70">Join us</p>
          <h2 className="mt-2 text-3xl font-semibold text-balance text-brand-dark">Create your account</h2>
          <p className="mt-3 text-sm text-slate-600">Choose a username and password to get started.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-brand-dark">Username</span>
            <input
              type="text"
              name="username"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              className="w-full rounded-3xl border border-brand-mid bg-brand-light/90 px-4 py-3 text-base text-brand-dark outline-none transition placeholder:text-brand-dark/70 focus:border-brand-dark focus:ring-2 focus:ring-brand-dark/20"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-brand-dark">Password</span>
            <input
              type="password"
              name="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              className="w-full rounded-3xl border border-brand-mid bg-brand-light/90 px-4 py-3 text-base text-brand-dark outline-none transition placeholder:text-brand-dark/70 focus:border-brand-dark focus:ring-2 focus:ring-brand-dark/20"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-brand-dark">Confirm Password</span>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
              className="w-full rounded-3xl border border-brand-mid bg-brand-light/90 px-4 py-3 text-base text-brand-dark outline-none transition placeholder:text-brand-dark/70 focus:border-brand-dark focus:ring-2 focus:ring-brand-dark/20"
            />
          </label>

          {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

          <button
            type="submit"
            className="rounded-3xl bg-brand-dark px-4 py-3 text-base font-semibold text-white transition hover:bg-[#312a51]"
          >
            Create Account
          </button>

          <p className="text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-brand-dark underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
    </main>
  )
}
