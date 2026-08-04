"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import logo from "./Image/ommidraai-mark.png"

export default function Login() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    console.log("[v0] Login submitted:", { username })
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-dark via-brand-mid to-brand-light px-4 py-10">
      <div className="w-full max-w-4xl rounded-[2rem] border border-white/20 bg-white/90 p-6 shadow-2xl shadow-brand-dark/25 backdrop-blur-xl">
        <div className="mb-2 flex flex-col items-center text-center">
          <Image
            src={logo}
            alt="Ommidraai logo"
            width={1200}
            height={400}
            className="w-11/12 max-w-[1100px] h-auto object-contain"
            priority
          />
          <p className="mt-2 text-sm uppercase tracking-[0.3em] text-brand-dark/70">Welcome back</p>
          <h2 className="mt-2 text-2xl font-semibold text-balance text-brand-dark">Sign in to your account</h2>
          <p className="mt-2 text-sm text-slate-600">Enter your username and password to continue.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-brand-dark">Username</span>
            <input
              type="text"
              name="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              className="w-full rounded-3xl border border-brand-mid bg-brand-light/90 px-4 py-3 text-base text-brand-dark outline-none transition placeholder:text-brand-dark/50 focus:border-brand-dark focus:ring-2 focus:ring-brand-dark/20"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-brand-dark">Password</span>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="w-full rounded-3xl border border-brand-mid bg-brand-light/90 px-4 py-3 text-base text-brand-dark outline-none transition placeholder:text-brand-dark/50 focus:border-brand-dark focus:ring-2 focus:ring-brand-dark/20"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <button
              type="submit"
              className="rounded-3xl bg-brand-dark px-4 py-3 text-base font-semibold text-white transition hover:bg-[#312a51]"
            >
              Sign In
            </button>
            <button
              type="button"
              className="rounded-3xl border border-brand-mid bg-brand-mid/20 px-4 py-3 text-base font-semibold text-brand-dark transition hover:bg-brand-mid/30"
            >
              Register
            </button>
          </div>

          
        </form>
      </div>
    </main>
  )
}