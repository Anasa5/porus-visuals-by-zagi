// app/api/auth/route.js
// Auth is disabled in this project. This file is kept only so the route
// exists — nothing calls it.

import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { ok: false, error: "auth_disabled" },
    { status: 501, headers: { "Cache-Control": "no-store" } }
  );
}

export async function GET() {
  return NextResponse.json(
    { ok: true, authenticated: true },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { ok: true },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}