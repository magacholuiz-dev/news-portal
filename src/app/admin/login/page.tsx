"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Falha ao entrar.");
        setLoading(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Não foi possível conectar ao servidor.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-md border border-neutral-200 bg-white p-8 shadow-sm"
      >
        <h1 className="mb-1 font-serif text-2xl font-black text-neutral-900">
          Área administrativa
        </h1>
        <p className="mb-6 text-sm text-neutral-500">
          Entre com suas credenciais de administrador.
        </p>

        {error && (
          <p className="mb-4 rounded-sm bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <label className="mb-3 block text-sm">
          <span className="mb-1 block font-medium text-neutral-700">
            Usuário
          </span>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-sm border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-900"
            autoComplete="username"
          />
        </label>

        <label className="mb-6 block text-sm">
          <span className="mb-1 block font-medium text-neutral-700">
            Senha
          </span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-sm border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-900"
            autoComplete="current-password"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-sm bg-neutral-900 py-2 font-semibold text-white transition-colors hover:bg-neutral-800 disabled:opacity-50"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
