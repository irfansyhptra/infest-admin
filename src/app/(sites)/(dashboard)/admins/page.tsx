"use client";

import React, { useCallback, useEffect, useState } from "react";
import { ShieldCheck, Plus, Trash2, X, AlertTriangle, Loader2, Trophy } from "lucide-react";
import { useAdminAuth } from "@/libs/contexts/AdminAuthContext";
// Sengaja klien yang sama dengan seluruh app. Dulu di sini diimpor instance
// kedua dari services/supabaseClient — dua GoTrueClient di satu tab, berebut
// lock auth yang sama dan menjalankan refresh token dobel.
import { supabase } from "@/libs/supabase/client";

type AdminRow = {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: "ADMIN" | "SUPER_ADMIN";
  admin_competition_id: string | null;
  is_active: boolean;
  can_login: boolean;
};

type CompetitionRow = { id: string; name: string };

/** fetch dengan access token sesi — route super admin memverifikasinya di server. */
async function authedFetch(url: string, init: RequestInit = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const res = await fetch(url, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token ?? ""}`,
      ...(init.headers || {}),
    },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `Gagal (${res.status})`);
  return json;
}

const EMPTY_FORM = {
  email: "",
  password: "",
  username: "",
  full_name: "",
  role: "ADMIN" as "ADMIN" | "SUPER_ADMIN",
  admin_competition_id: "",
};

export default function AdminsPage() {
  const { user, isLoading: isAuthLoading } = useAdminAuth();

  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [competitions, setCompetitions] = useState<CompetitionRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState<AdminRow | null>(null);
  const [editForm, setEditForm] = useState({ email: "", password: "", admin_competition_id: "", role: "ADMIN" as "ADMIN" | "SUPER_ADMIN" });
  const [busy, setBusy] = useState(false);

  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [{ admins }, comps] = await Promise.all([
        authedFetch("/api/super-admin/admins"),
        supabase.from("competitions").select("id, name").order("name"),
      ]);
      setAdmins(admins);
      setCompetitions((comps.data as CompetitionRow[]) || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthLoading && isSuperAdmin) load();
    else if (!isAuthLoading) setIsLoading(false);
  }, [isAuthLoading, isSuperAdmin, load]);

  const run = async (fn: () => Promise<void>, successMessage: string) => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await fn();
      setNotice(successMessage);
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const competitionName = (id: string | null) =>
    competitions.find((c) => c.id === id)?.name ?? "—";

  if (isAuthLoading || isLoading) {
    return (
      <div className="surface-page min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted" />
      </div>
    );
  }

  // Penjaga UI. Batas sesungguhnya ada di API route (requireSuperAdmin) —
  // menyembunyikan halaman saja tidak menghentikan siapa pun memanggil endpoint.
  if (!isSuperAdmin) {
    return (
      <div className="surface-page min-h-screen flex items-center justify-center p-6">
        <div className="surface-card border border-subtle rounded-xl p-8 max-w-md w-full text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-[var(--error-soft)] text-error flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h1 className="text-base font-semibold uppercase tracking-wide text-primary">Akses Ditolak</h1>
          <p className="text-sm text-muted">Halaman ini hanya untuk super admin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[var(--tertiary-bg)] border border-subtle flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-primary">Kelola Admin</h1>
            <p className="text-sm text-muted">Akun admin, lomba yang dikelola, email &amp; password</p>
          </div>
        </div>
        <button
          onClick={() => { setForm(EMPTY_FORM); setShowCreate(true); }}
          className="btn-neutral inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Tambah Admin
        </button>
      </div>

      {error && (
        <div className="surface-card border border-subtle rounded-lg p-3 text-sm text-error flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> {error}
        </div>
      )}
      {notice && (
        <div className="surface-card border border-subtle rounded-lg p-3 text-sm text-secondary">{notice}</div>
      )}

      {/* ── Daftar admin ── */}
      <div className="surface-card border border-subtle rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-muted text-xs uppercase tracking-wide">
              <tr className="border-b border-subtle">
                <th className="text-left p-3 font-medium">Admin</th>
                <th className="text-left p-3 font-medium">Role</th>
                <th className="text-left p-3 font-medium">Lomba</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-right p-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.id} className="border-b border-subtle last:border-0">
                  <td className="p-3">
                    <div className="text-primary font-medium">{a.full_name}</div>
                    <div className="text-muted text-xs">{a.email}</div>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-md text-xs font-medium border border-subtle ${a.role === "SUPER_ADMIN" ? "text-secondary" : "text-muted"}`}>
                      {a.role}
                    </span>
                  </td>
                  <td className="p-3 text-muted">
                    {a.role === "SUPER_ADMIN" ? "Semua lomba" : competitionName(a.admin_competition_id)}
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col gap-1">
                      <span className={a.is_active ? "text-secondary text-xs" : "text-muted text-xs"}>
                        {a.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                      {/* Baris admin_users tanpa user auth tidak akan pernah bisa login. */}
                      {!a.can_login && (
                        <span className="text-error text-xs">Tidak bisa login (belum ada akun auth)</span>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditing(a);
                          setEditForm({
                            email: a.email,
                            password: "",
                            admin_competition_id: a.admin_competition_id ?? "",
                            role: a.role,
                          });
                        }}
                        className="btn-outline px-3 py-1.5 rounded-lg text-xs"
                      >
                        Ubah
                      </button>
                      <button
                        disabled={busy || a.id === user?.id}
                        title={a.id === user?.id ? "Tidak bisa menghapus akun sendiri" : "Hapus"}
                        onClick={() => {
                          if (!confirm(`Hapus admin ${a.email}? Akun login-nya ikut terhapus.`)) return;
                          run(() => authedFetch(`/api/super-admin/admins/${a.id}`, { method: "DELETE" }), "Admin dihapus.");
                        }}
                        className="btn-outline px-3 py-1.5 rounded-lg text-xs text-error disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {admins.length === 0 && (
                <tr><td colSpan={5} className="p-6 text-center text-muted">Belum ada admin.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CompetitionEditor competitions={competitions} onDone={(m) => setNotice(m)} onError={(m) => setError(m)} />

      {/* ── Modal tambah ── */}
      {showCreate && (
        <Modal title="Tambah Admin" onClose={() => setShowCreate(false)}>
          <div className="space-y-3">
            <Field label="Nama lengkap" value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} />
            <Field label="Username" value={form.username} onChange={(v) => setForm({ ...form, username: v })} hint="Tanpa tanda hubung — database menolaknya." />
            <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
            <Field label="Password" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} hint="Minimal 8 karakter." />
            <RoleAndCompetition
              role={form.role}
              competitionId={form.admin_competition_id}
              competitions={competitions}
              onRole={(role) => setForm({ ...form, role })}
              onCompetition={(id) => setForm({ ...form, admin_competition_id: id })}
            />
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowCreate(false)} className="btn-outline flex-1 py-2 rounded-lg text-sm">Batal</button>
              <button
                disabled={busy}
                onClick={() =>
                  run(async () => {
                    await authedFetch("/api/super-admin/admins", {
                      method: "POST",
                      body: JSON.stringify({
                        ...form,
                        admin_competition_id: form.role === "SUPER_ADMIN" ? null : form.admin_competition_id,
                      }),
                    });
                    setShowCreate(false);
                  }, "Admin dibuat.")
                }
                className="btn-neutral flex-1 py-2 rounded-lg text-sm disabled:opacity-50"
              >
                {busy ? "Menyimpan…" : "Simpan"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Modal ubah ── */}
      {editing && (
        <Modal title={`Ubah ${editing.full_name}`} onClose={() => setEditing(null)}>
          <div className="space-y-3">
            <Field label="Email" type="email" value={editForm.email} onChange={(v) => setEditForm({ ...editForm, email: v })} />
            <Field
              label="Password baru"
              type="password"
              value={editForm.password}
              onChange={(v) => setEditForm({ ...editForm, password: v })}
              hint="Kosongkan kalau tidak ingin mengganti password."
            />
            <RoleAndCompetition
              role={editForm.role}
              competitionId={editForm.admin_competition_id}
              competitions={competitions}
              onRole={(role) => setEditForm({ ...editForm, role })}
              onCompetition={(id) => setEditForm({ ...editForm, admin_competition_id: id })}
            />
            <div className="flex gap-2 pt-2">
              <button
                disabled={busy}
                onClick={() =>
                  run(async () => {
                    await authedFetch(`/api/super-admin/admins/${editing.id}`, {
                      method: "PATCH",
                      body: JSON.stringify({
                        email: editForm.email !== editing.email ? editForm.email : undefined,
                        password: editForm.password ? editForm.password : undefined,
                        role: editForm.role,
                        admin_competition_id: editForm.role === "SUPER_ADMIN" ? null : editForm.admin_competition_id,
                        is_active: !editing.is_active ? true : undefined,
                      }),
                    });
                    setEditing(null);
                  }, "Perubahan disimpan.")
                }
                className="btn-neutral flex-1 py-2 rounded-lg text-sm disabled:opacity-50"
              >
                {busy ? "Menyimpan…" : "Simpan"}
              </button>
              <button
                disabled={busy}
                onClick={() =>
                  run(async () => {
                    await authedFetch(`/api/super-admin/admins/${editing.id}`, {
                      method: "PATCH",
                      body: JSON.stringify({ is_active: !editing.is_active }),
                    });
                    setEditing(null);
                  }, "Status diubah.")
                }
                className="btn-outline flex-1 py-2 rounded-lg text-sm disabled:opacity-50"
              >
                {editing.is_active ? "Nonaktifkan" : "Aktifkan"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Bagian ubah data kompetisi ──────────────────────────────────────────────

const COMP_FIELDS: { key: string; label: string; type?: string }[] = [
  { key: "name", label: "Nama" },
  { key: "status", label: "Status" },
  { key: "registration_fee", label: "Biaya reguler", type: "number" },
  { key: "early_bird", label: "Early bird", type: "number" },
  { key: "early_bird_end", label: "Akhir early bird", type: "date" },
  { key: "middle_bird_amount", label: "Middle bird", type: "number" },
  { key: "middle_bird_end", label: "Akhir middle bird", type: "date" },
  { key: "registration_start", label: "Pendaftaran mulai", type: "date" },
  { key: "registration_end", label: "Pendaftaran tutup", type: "date" },
  { key: "competition_start", label: "Lomba mulai", type: "date" },
  { key: "competition_end", label: "Lomba selesai", type: "date" },
  { key: "bank_account_name", label: "Bank" },
  { key: "bank_account_number", label: "No. rekening" },
  { key: "bank_account_receiver_name", label: "Nama penerima" },
  { key: "bank_account_name_2", label: "Bank 2" },
  { key: "bank_account_number_2", label: "No. rekening 2" },
  { key: "bank_account_receiver_name_2", label: "Nama penerima 2" },
  { key: "guidebook_url", label: "Link guidebook" },
  { key: "whatsapp_group", label: "Link grup WhatsApp" },
];

function CompetitionEditor({
  competitions,
  onDone,
  onError,
}: {
  competitions: CompetitionRow[];
  onDone: (m: string) => void;
  onError: (m: string) => void;
}) {
  const [selectedId, setSelectedId] = useState("");
  const [values, setValues] = useState<Record<string, any>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!selectedId) return setValues({});
    supabase.from("competitions").select("*").eq("id", selectedId).single().then(({ data }) => {
      if (!data) return;
      const next: Record<string, any> = {};
      for (const f of COMP_FIELDS) {
        const raw = (data as any)[f.key];
        // input[type=date] hanya menerima YYYY-MM-DD, sedangkan kolomnya timestamptz.
        next[f.key] = f.type === "date" && raw ? String(raw).slice(0, 10) : raw ?? "";
      }
      setValues(next);
    });
  }, [selectedId]);

  return (
    <div className="surface-card border border-subtle rounded-xl p-4 sm:p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Trophy className="w-5 h-5 text-secondary" />
        <div>
          <h2 className="text-base font-semibold text-primary">Data Kompetisi</h2>
          <p className="text-xs text-muted">Termasuk rekening pembayaran — hanya super admin.</p>
        </div>
      </div>

      <select
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        className="input-neutral w-full px-3 py-2 rounded-lg text-sm"
      >
        <option value="">Pilih kompetisi…</option>
        {competitions.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      {selectedId && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {COMP_FIELDS.map((f) => (
              <Field
                key={f.key}
                label={f.label}
                type={f.type}
                value={values[f.key] ?? ""}
                onChange={(v) => setValues({ ...values, [f.key]: v })}
              />
            ))}
          </div>
          <button
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await authedFetch(`/api/super-admin/competitions/${selectedId}`, {
                  method: "PATCH",
                  body: JSON.stringify(values),
                });
                onDone("Data kompetisi disimpan.");
              } catch (e: any) {
                onError(e.message);
              } finally {
                setBusy(false);
              }
            }}
            className="btn-neutral px-4 py-2 rounded-lg text-sm disabled:opacity-50"
          >
            {busy ? "Menyimpan…" : "Simpan Kompetisi"}
          </button>
        </>
      )}
    </div>
  );
}

// ── Komponen kecil ──────────────────────────────────────────────────────────

function Field({
  label, value, onChange, type = "text", hint,
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string; hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs text-muted">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-neutral w-full px-3 py-2 rounded-lg text-sm mt-1"
      />
      {hint && <span className="text-[11px] text-muted mt-1 block">{hint}</span>}
    </label>
  );
}

function RoleAndCompetition({
  role, competitionId, competitions, onRole, onCompetition,
}: {
  role: "ADMIN" | "SUPER_ADMIN";
  competitionId: string;
  competitions: CompetitionRow[];
  onRole: (r: "ADMIN" | "SUPER_ADMIN") => void;
  onCompetition: (id: string) => void;
}) {
  return (
    <>
      <label className="block">
        <span className="text-xs text-muted">Role</span>
        <select
          value={role}
          onChange={(e) => onRole(e.target.value as "ADMIN" | "SUPER_ADMIN")}
          className="input-neutral w-full px-3 py-2 rounded-lg text-sm mt-1"
        >
          <option value="ADMIN">ADMIN (satu lomba)</option>
          <option value="SUPER_ADMIN">SUPER_ADMIN (semua lomba)</option>
        </select>
      </label>
      {role === "ADMIN" && (
        <label className="block">
          <span className="text-xs text-muted">Lomba yang dikelola</span>
          <select
            value={competitionId}
            onChange={(e) => onCompetition(e.target.value)}
            className="input-neutral w-full px-3 py-2 rounded-lg text-sm mt-1"
          >
            <option value="">Pilih lomba…</option>
            {competitions.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
      )}
    </>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="surface-card border border-subtle rounded-xl p-5 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-primary">{title}</h3>
          <button onClick={onClose} className="text-muted hover:text-primary"><X className="w-5 h-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
