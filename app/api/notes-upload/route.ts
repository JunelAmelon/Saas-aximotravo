import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const files = formData.getAll("files");
  const savedFiles: string[] = [];

  for (const file of files) {
    if (file instanceof File) {
      // @ts-ignore: File.arrayBuffer is available in edge runtime
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const filename = `${Date.now()}-${file.name}`.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const uploadDir = path.join(process.cwd(), "public", "notes_uploads");
      await fs.mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, filename);
      await fs.writeFile(filePath, uint8Array);
      savedFiles.push(`/notes_uploads/${filename}`);
    }
  }

  return NextResponse.json({ files: savedFiles });
}
