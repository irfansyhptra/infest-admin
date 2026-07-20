import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/libs/server/requireSuperAdmin";

/** Daftar semua akun admin. */
export async function GET(request: Request) {
  const guard = await requireSuperAdmin(request);
  if (!guard.ok) return guard.response;

  const { data, error } = await guard.admin
    .from("admin_users")
    .select("id, username, email, full_name, role, admin_competition_id, is_active, last_login, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Akun admin bisa saja punya baris admin_users tanpa user auth pasangannya —
  // baris seperti itu tidak akan pernah bisa login. Ditandai supaya kelihatan
  // di UI, bukan tampak sehat padahal tidak berfungsi.
  const { data: authList } = await guard.admin.auth.admin.listUsers({ perPage: 200 });
  const authIds = new Set((authList?.users || []).map((u) => u.id));

  return NextResponse.json({
    admins: (data || []).map((a) => ({ ...a, can_login: authIds.has(a.id) })),
  });
}

/** Buat akun admin baru (user auth + baris admin_users). */
export async function POST(request: Request) {
  const guard = await requireSuperAdmin(request);
  if (!guard.ok) return guard.response;

  const body = await request.json().catch(() => null);
  const { email, password, username, full_name, role, admin_competition_id } = body || {};

  if (!email || !password || !username || !full_name) {
    return NextResponse.json(
      { error: "email, password, username, dan full_name wajib diisi" },
      { status: 400 }
    );
  }
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "role harus ADMIN atau SUPER_ADMIN" }, { status: 400 });
  }
  if (role === "ADMIN" && !admin_competition_id) {
    return NextResponse.json(
      { error: "Admin lomba wajib punya lomba yang dikelola" },
      { status: 400 }
    );
  }
  if (String(password).length < 8) {
    return NextResponse.json({ error: "Password minimal 8 karakter" }, { status: 400 });
  }

  const { data: created, error: createError } = await guard.admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // domain @infest.usk.ac.id tidak punya inbox
  });
  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 400 });
  }

  const { error: rowError } = await guard.admin.from("admin_users").insert({
    id: created.user.id,
    email,
    username,
    full_name,
    role,
    admin_competition_id: role === "SUPER_ADMIN" ? null : admin_competition_id,
    is_active: true,
  });

  if (rowError) {
    // Jangan tinggalkan user auth yatim yang tidak punya baris admin_users.
    await guard.admin.auth.admin.deleteUser(created.user.id);
    return NextResponse.json({ error: rowError.message }, { status: 400 });
  }

  return NextResponse.json({ id: created.user.id });
}
