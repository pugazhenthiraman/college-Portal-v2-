import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif"];
const DOC_TYPES = ["image/jpeg", "image/png", "application/pdf"];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const field = formData.get("field") as string | null; // "photo", "certificate", "marksheet"

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    // Decide allowed types based on field
    let allowedTypes: string[] = [];
    let typeLabel = "";
    if (field === "photo") {
      allowedTypes = IMAGE_TYPES;
      typeLabel = "JPG, PNG, or GIF images";
    } else if (field === "certificate" || field === "marksheet") {
      allowedTypes = DOC_TYPES;
      typeLabel = "JPG, PNG, or PDF files";
    } else {
      allowedTypes = IMAGE_TYPES;
      typeLabel = "JPG, PNG, or GIF images";
    }

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `File type not supported. Only ${typeLabel} are allowed.` },
        { status: 400 }
      );
    }

    // Optional: File size limit (e.g., 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File is too large. Maximum allowed size is 5MB." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    // Prevent filename collisions
    const ext = path.extname(file.name);
    const base = path.basename(file.name, ext);
    const timestamp = Date.now();
    const safeFileName = `${base.replace(/[^a-zA-Z0-9_-]/g, "")}_${timestamp}${ext}`;
    const filePath = path.join(uploadDir, safeFileName);

    await fs.writeFile(filePath, buffer);

    // Return the public path to the file
    const response = { path: `/uploads/${safeFileName}` };
    console.log("Sending upload response to frontend:", response);
    return NextResponse.json(response);
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Failed to upload file. Please try again." }, { status: 500 });
  }
}