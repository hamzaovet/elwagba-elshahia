import { NextResponse } from "next/server";

export async function GET() {
  // Direct link to the latest الوجبة الشهية APK on GitHub Releases
  const downloadUrl =
    process.env.APK_DOWNLOAD_URL ||
    "https://github.com/hamzaovet/elwagba-elshahia/releases/download/v1.0.0/elwagba-elshahia.apk";

  return NextResponse.redirect(downloadUrl, {
    status: 302,
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
