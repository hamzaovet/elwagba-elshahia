import { NextResponse } from "next/server";

export async function GET(req: Request) {
  // Direct link to the hosted APK in /downloads/elwagba-elshahia.apk
  const downloadUrl =
    process.env.APK_DOWNLOAD_URL ||
    "/downloads/elwagba-elshahia.apk";

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
