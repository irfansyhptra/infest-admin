import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/libs/server/requireSuperAdmin";

type Params = { params: Promise<{ id: string }> };

// Daftar putih kolom yang boleh diubah. Tanpa ini, body request bisa menulis
// kolom apa pun di tabel (termasuk id atau created_at).
const EDITABLE = [
  "name",
  "slug",
  "description",
  "short_description",
  "status",
  "registration_fee",
  "early_bird",
  "early_bird_end",
  "middle_bird_amount",
  "middle_bird_end",
  "registration_start",
  "registration_end",
  "competition_start",
  "competition_end",
  "qualification_end",
  "final_date",
  "final_announcement",
  "guidebook_url",
  "poster_image_url",
  "whatsapp_group",
  "first_prize_amount",
  "first_prize_description",
  "second_prize_amount",
  "second_prize_description",
  "third_prize_amount",
  "third_prize_description",
  "bank_account_name",
  "bank_account_number",
  "bank_account_receiver_name",
  "bank_account_name_2",
  "bank_account_number_2",
  "bank_account_receiver_name_2",
  "is_google_form_registration",
  "google_form_registration_url",
] as const;

/** Ubah data kompetisi. Super admin saja — tabel ini memuat nomor rekening. */
export async function PATCH(request: Request, { params }: Params) {
  const guard = await requireSuperAdmin(request);
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });

  const updates: Record<string, unknown> = {};
  for (const key of EDITABLE) {
    if (body[key] !== undefined) updates[key] = body[key] === "" ? null : body[key];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Tidak ada kolom yang bisa diubah" }, { status: 400 });
  }

  const { data, error } = await guard.admin
    .from("competitions")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ competition: data });
}
