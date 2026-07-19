import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { sponsors, mediaPartners } from "../../../libs/data/sponsors";

// Configure your email transporter (example using Gmail)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Normalize logo URLs for email clients (support relative and Google Drive links)
const ASSET_BASE = "https://infest.hmifusk.org";
function normalizeLogoUrl(url: string): string {
  if (!url) return "";
  if (url.includes("drive.google.com/file/d/")) {
    const match = url.match(/drive\.google\.com\/file\/d\/([^/]+)\//);
    const id = match?.[1];
    return id ? `https://drive.google.com/uc?export=view&id=${id}` : url;
  }
  if (url.startsWith("/")) return `${ASSET_BASE}${url}`;
  return url;
}

function buildLogoGridSection(
  title: string,
  items: Array<{ name: string; logoUrl: string }>
) {
  if (!items?.length) return "";

  const cells = items
    .map((it) => {
      const src = normalizeLogoUrl((it as any).logoUrl);
      const alt = (it as any).name || "Logo";
      return `
        <div style="display:inline-block;vertical-align:middle;min-width:70px;max-width:100px;margin:4px;box-sizing:border-box;">
          <img src="${src}" alt="${alt}" width="80" style="width:100%;max-width:80px;height:auto;display:block;margin:0;border-radius:6px;border:1px solid #f3f4f6;background:#fff;" />
        </div>
      `;
    })
    .join("");

  return `
    <div style="margin:20px 0; max-width:600px; padding:12px; background:#ffffff; border-radius:8px;">
      <h3 style="margin:0 0 12px 0; font-size:16px; color:#111;">${title}</h3>
      <div style="font-size:0;">
        ${cells}
      </div>
    </div>
  `;
}

const generateEmailTemplate = (data: {
  teamName: string;
  teamLeaderName: string;
  competitionName: string;
  status: "approved" | "rejected";
  adminNotes?: string;
  whatsappGroupLink?: string;
}) => {
  const isApproved = data.status === "approved";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${
          isApproved ? "#10b981" : "#ef4444"
        }; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .footer { padding: 15px; text-align: center; color: #666; font-size: 14px; }
        .whatsapp-link { background: #25d366; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
        .dashboard-link { background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Pendaftaran ${isApproved ? "Disetujui" : "Ditolak"}</h1>
        </div>
        <div class="content">
          <p>Halo <strong>${data.teamLeaderName}</strong>,</p>
          
          <p>Pendaftaran tim <strong>${
            data.teamName
          }</strong> untuk kompetisi <strong>${
    data.competitionName
  }</strong> telah <strong>${isApproved ? "disetujui" : "ditolak"}</strong>.</p>
          
          ${
            data.adminNotes
              ? `
            <div style="background: #fff; padding: 15px; border-left: 4px solid ${
              isApproved ? "#10b981" : "#ef4444"
            }; margin: 15px 0;">
              <h4>Catatan Admin:</h4>
              <p>${data.adminNotes}</p>
            </div>
          `
              : ""
          }
          
          <div style="background: #fff; padding: 15px; border: 1px solid #ddd; margin: 15px 0;">
            <h4>Dashboard Kompetisi:</h4>
            <p>Anda dapat melihat status pendaftaran dan informasi terbaru kompetisi di dashboard peserta:</p>
            <a href="https://infest.hmifusk.org/dashboard?menu=kompetisi" class="dashboard-link" style="color: white;">Lihat Dashboard Kompetisi</a>
          </div>
          
          ${
            isApproved && data.whatsappGroupLink
              ? `
            <div style="background: #fff; padding: 15px; border: 1px solid #ddd; margin: 15px 0;">
              <h4>Bergabung dengan WhatsApp Group:</h4>
              <p>Silakan bergabung dengan grup WhatsApp kompetisi untuk mendapatkan informasi terbaru:</p>
              <a href="${data.whatsappGroupLink}" class="whatsapp-link" style="color: white;">Bergabung ke WhatsApp Group</a>
            </div>
          `
              : ""
          }

          <div style="margin: 20px 0;">
            ${buildLogoGridSection("Sponsors", sponsors as any)}
            ${buildLogoGridSection("Media Partners", mediaPartners as any)}
          </div>
          
          <p>Terima kasih telah berpartisipasi dalam INFEST 2025!</p>
          
          <p>Salam,<br>INFEST 2025</p>
        </div>
        <div class="footer">
          <p>Email ini dikirim secara otomatis. Mohon tidak membalas email ini.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const {
      teamName,
      teamLeaderName,
      teamLeaderEmail,
      competitionName,
      status,
      adminNotes,
      whatsappGroupLink,
    } = data;

    if (!teamLeaderEmail || !teamName || !competitionName || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const subject = `INFEST 2025 - Pendaftaran ${
      status === "approved" ? "Disetujui" : "Ditolak"
    }: ${teamName}`;
    const htmlContent = generateEmailTemplate(data);

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: teamLeaderEmail,
      subject,
      html: htmlContent,
    });

    return NextResponse.json({
      success: true,
      message: "Email notification sent successfully",
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email notification" },
      { status: 500 }
    );
  }
}
