import { NextResponse } from "next/server";

export async function GET(req: Request) {
  // Direct link to the genuine release v1.0.0 APK on GitHub Releases
  const downloadUrl =
    process.env.APK_DOWNLOAD_URL ||
    "https://github.com/hamzaovet/elwagba-elshahia/releases/download/v1.0.0/elwagba-elshahia.apk";

  const targetUrl = downloadUrl.startsWith("http")
    ? downloadUrl
    : new URL(downloadUrl, req.url).toString();

  return NextResponse.redirect(targetUrl, {
    status: 302,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "Content-Disposition": 'attachment; filename="elwagba-elshahia.apk"',
    },
  });
}
