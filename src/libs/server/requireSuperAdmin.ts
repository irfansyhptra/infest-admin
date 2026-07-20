import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/libs/services/supabaseClient";

/**
 * Penjaga otorisasi sisi server untuk route super admin.
 *
 * Wajib diverifikasi di server, bukan di komponen. Pengecekan role di React
 * hanya menyembunyikan tombol — siapa pun tetap bisa memanggil endpoint-nya
 * langsung. Route ini memakai service role key (melewati RLS), jadi di sinilah
 * satu-satunya batas yang benar-benar menahan.
 *
 * Role dibaca dari tabel admin_users, TIDAK PERNAH dari user_metadata —
 * user_metadata bisa ditulis sendiri oleh pemilik akun.
 */
export async function requireSuperAdmin(request: Request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  if (!token) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Tidak ada token autentikasi" }, { status: 401 }),
    };
  }

  const admin = getSupabaseAdmin();

  // Memvalidasi token ke Supabase — signature, kedaluwarsa, dan user-nya.
  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData.user) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Token tidak valid" }, { status: 401 }),
    };
  }

  const { data: record, error: recordError } = await admin
    .from("admin_users")
    .select("role, is_active")
    .eq("id", userData.user.id)
    .single();

  if (recordError || !record || record.is_active === false || record.role !== "SUPER_ADMIN") {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "Hanya super admin yang boleh melakukan aksi ini" },
        { status: 403 }
      ),
    };
  }

  return { ok: true as const, admin, callerId: userData.user.id };
}
