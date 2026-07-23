# Admin Panel INFEST USK 2026

Backoffice administration panel untuk Informatics Festival XII 2026 yang diselenggarakan oleh Himpunan Mahasiswa Informatika USK.

## 🚀 Fitur Utama

### ✅ Sudah Implementasi
- **Dashboard** - Menampilkan statistik real-time dari database
  - Total peserta terdaftar
  - Kompetisi aktif
  - Registrasi pending
  - Tim terdaftar
- **Manajemen User** - Kelola user yang sudah mendaftar
  - List user dengan informasi lengkap
  - Status keanggotaan tim
  - Filter dan pencarian
  - Pagination
- **Manajemen Kompetisi** - Kelola kompetisi dan registrasi
  - List kompetisi dengan statistik
  - Detail registrasi tim per kompetisi
  - Approve/reject registrasi
  - Verifikasi pembayaran

### 🔄 Dalam Pengembangan
- **Manajemen Registrasi** - Review dan kelola semua registrasi
- **Manajemen Tim** - Kelola tim dan anggota
- **Reports & Analytics** - Laporan dan analitik komprehensif
- **Settings** - Konfigurasi sistem

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS + Custom CSS Variables
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Notifications**: React Hot Toast
- **Authentication**: Supabase Auth

## 📊 Database Schema

Project ini menggunakan database yang sama dengan frontpage (web-infest) dengan schema:

- `user_profiles` - Profil pengguna
- `teams` - Tim kompetisi
- `competitions` - Data kompetisi
- `competition_registrations` - Registrasi tim ke kompetisi
- Views: `teams_with_member_count`, `active_competitions`, dll.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Yarn atau NPM
- Akses ke Supabase database INFEST USK 2026

### Installation

1. Clone repository
```bash
git clone <repository-url>
cd admin-infest
```

2. Install dependencies
```bash
yarn install
# atau
npm install
```

3. Setup environment variables
```bash
cp .env.example .env.local
```

Edit `.env.local` dengan konfigurasi Supabase Anda:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run development server
```bash
yarn dev
# atau
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## 📱 UI/UX Design

### Design System
- **Palette**: Calm, professional blue/black/white theme
- **Typography**: Geist Sans & Geist Mono
- **Components**: Premium cards dengan glass effects
- **Responsive**: Mobile-first design
- **Accessibility**: WCAG 2.1 compliant

### Color Scheme
```css
--primary-bg: #0a0c10 (Dark background)
--accent-blue: #3b82f6 (Primary blue)
--text-primary: #f1f3f7 (Light text)
--success: #10b981 (Green)
--warning: #f59e0b (Orange)
--error: #ef4444 (Red)
```

## 📁 Project Structure

```
admin-infest/
├── src/
│   ├── app/
│   │   ├── (sites)/           # Protected routes
│   │   │   ├── page.tsx       # Dashboard
│   │   │   ├── users/         # User management
│   │   │   ├── competitions/  # Competition management
│   │   │   └── layout.tsx     # Sites layout
│   │   ├── css/
│   │   │   └── globals.css    # Global styles
│   │   └── fonts/
│   ├── components/
│   │   └── layout/
│   │       └── AdminLayout.tsx
│   ├── libs/
│   │   ├── contexts/          # React contexts
│   │   ├── hooks/             # Custom hooks
│   │   ├── services/          # API services
│   │   └── supabase/          # Supabase client
│   └── types/                 # TypeScript types
├── public/                    # Static assets
└── package.json
```

## 🔐 Authentication & Authorization

- **Authentication**: Supabase Auth
- **Authorization**: Role-based (admin/super_admin)
- **Session Management**: JWT dengan refresh tokens
- **Protection**: Route-level protection dengan hooks

## 📊 Data Management

### Services
- `adminDashboardService` - Dashboard statistics & data
- `adminAuthService` - Authentication operations

### Hooks
- `useAdminDashboard()` - Dashboard stats
- `useAdminUsers()` - User management
- `useAdminCompetitions()` - Competition data

## 🔧 Development Commands

```bash
# Development
yarn dev


## Email Broadcast (Admin)

We provide a Node script to send broadcast emails to:

- Users without a team
- Users with a team but not registered to any competition

Requirements:

- Environment variables:
  - NEXT_PUBLIC_SUPABASE_URL
  - SUPABASE_SERVICE_ROLE_KEY (server-side secret; never expose to client)
  - EMAIL_USER, EMAIL_PASS (use an App Password if Gmail)
  - EMAIL_FROM (optional, defaults to EMAIL_USER)

Dry run (no emails sent):

```
npm run broadcast:dry
```

Send emails (be careful):

```
npm run broadcast:send
```

Options:

- `--segment=without-team|with-team-no-registration|both` (default: both)
- `--limit=50` to send to the first N recipients
- `--filter-email=@example.com` to limit to addresses containing a substring
- `--concurrency=5` set parallel sends per batch (default 5)
- `--pause-ms=1500` pause between batches in ms (default 1500)

Examples:

```
# Dry run, target users without a team
npm run broadcast:dry -- --segment=without-team

# Actually send to first 20 users who have a team but no registrations
npm run broadcast:send -- --segment=with-team-no-registration --limit=20
```

Best practices:

- Always test with dry run + limit before sending broadly.
- Use filter-email to test against your own domain first.
- Respect provider limits; adjust concurrency and pause accordingly.
- Consider scheduling off-peak times for large broadcasts.
# Build for production
yarn build

# Start production server
yarn start

# Lint check
yarn lint

# Create admin user (if needed)
yarn create-admin
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect repository to Vercel
2. Set environment variables di Vercel dashboard
3. Deploy automatically dari main branch

### Manual Deployment
```bash
yarn build
yarn start
```

## 📈 Performance & Monitoring

- **Bundle Size**: Optimized dengan Next.js
- **Loading States**: Skeleton loaders untuk semua data fetching
- **Error Handling**: Comprehensive error boundaries
- **Caching**: Automatic caching dengan Supabase dan Next.js

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

Project ini adalah bagian dari INFEST USK 2026 - Himpunan Mahasiswa Informatika USK.

---

**Developed with ❤️ for INFEST USK 2026**

*Informatics Festival XII - Bringing Innovation to Life*
