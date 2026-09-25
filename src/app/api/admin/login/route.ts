import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE,
} from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const username = typeof body?.username === "string" ? body.username : "";
  const password = typeof body?.password === "string" ? body.password : "";

  const adminUser = process.env.ADMIN_USER;
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!adminUser || !adminPasswordHash) {
    return NextResponse.json(
      { error: "Credenciais de admin não configuradas no servidor." },
      { status: 500 },
    );
  }

  if (username !== adminUser) {
    return NextResponse.json(
      { error: "Usuário ou senha inválidos." },
      { status: 401 },
    );
  }

  const passwordOk = await bcrypt.compare(password, adminPasswordHash);
  if (!passwordOk) {
    return NextResponse.json(
      { error: "Usuário ou senha inválidos." },
      { status: 401 },
    );
  }

  const token = await createSessionToken(username);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return response;
}
