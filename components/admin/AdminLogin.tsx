"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/(admin)/admin/actions";

const INITIAL: LoginState = { error: null };

export default function AdminLogin() {
  const [state, action, pending] = useActionState(login, INITIAL);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 py-16">
      <form
        action={action}
        className="w-full max-w-sm rounded-lg border border-neutral-200 p-8 shadow-sm"
      >
        <h1 className="text-lg font-semibold">Acceso restringido</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Introduce la contraseña de administración.
        </p>
        <label htmlFor="password" className="mt-6 block text-sm font-medium">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          className="mt-2 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
        />
        {state.error && (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {state.error}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="mt-6 w-full rounded-md bg-neutral-900 py-2.5 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-60"
        >
          {pending ? "Verificando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
