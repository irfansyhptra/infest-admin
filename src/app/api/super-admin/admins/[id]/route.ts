import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/libs/server/requireSuperAdmin";

type Params = { params: Promise<{ id: string }> };

/**
 * Ubah akun admin: email, password, lomba yang dikelola, role, aktif/nonaktif.
 * Email & password harus lewat sini — mengubah kredensial user lain adalah
 * operasi admin API yang butuh service role, tidak bisa dari browser.
 */
export async function PATCH(request: Request, { params }: Params) {
  const guard = await requireSuperAdmin(request);
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });

  const { email, password, full_name, username, role, admin_competition_id, is_active } = body;

  if (role && role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "role harus ADMIN atau SUPER_ADMIN" }, { status: 400 });
  }
  if (password !== undefined && String(password).length < 8) {
    return NextResponse.json({ error: "Password minimal 8 karakter" }, { status: 400 });
  }

  // Cegah super admin mengunci dirinya sendiri keluar sistem: kalau dia satu-
  // satunya super admin aktif, dia tidak boleh menurunkan role atau
  // menonaktifkan akunnya sendiri — tidak akan ada lagi yang bisa mengembalikan.
  const losingOwnAccess =
    id === guard.callerId && (role === "ADMIN" || is_active === false);
  if (losingOwnAccess) {
    const { count } = await guard.admin
      .from("admin_users")
      .select("id", { count: "exact", head: true })
      .eq("role", "SUPER_ADMIN")
      .eq("is_active", true);

    if ((count ?? 0) <= 1) {
      return NextResponse.json(
        { error: "Anda satu-satunya super admin aktif — aksi ini akan mengunci Anda keluar" },
        { status: 400 }
      );
    }
  }

  // Kredensial ada di auth.users, bukan admin_users.
  if (email !== undefined || password !== undefined) {
    const credentials: { email?: string; password?: string } = {};
    if (email !== undefined) credentials.email = email;
    if (password !== undefined) credentials.password = password;

    const { error } = await guard.admin.auth.admin.updateUserById(id, credentials);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (email !== undefined) updates.email = email; // dijaga sinkron dengan auth.users
  if (full_name !== undefined) updates.full_name = full_name;
  if (username !== undefined) updates.username = username;
  if (is_active !== undefined) updates.is_active = is_active;
  if (role !== undefined) {
    updates.role = role;
    // Super admin tidak terikat satu lomba.
    if (role === "SUPER_ADMIN") updates.admin_competition_id = null;
  }
  if (admin_competition_id !== undefined && role !== "SUPER_ADMIN") {
    updates.admin_competition_id = admin_competition_id;
  }

  if (Object.keys(updates).length > 0) {
    const { error } = await guard.admin.from("admin_users").update(updates).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

/** Hapus akun admin (baris admin_users + user auth-nya). */
export async function DELETE(request: Request, { params }: Params) {
  const guard = await requireSuperAdmin(request);
  if (!guard.ok) return guard.response;

  const { id } = await params;
  if (id === guard.callerId) {
    return NextResponse.json(
      { error: "Tidak bisa menghapus akun Anda sendiri" },
      { status: 400 }
    );
  }

  const { error } = await guard.admin.from("admin_users").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await guard.admin.auth.admin.deleteUser(id);
  return NextResponse.json({ ok: true });
}
