import { NextResponse } from "next/server"
import { randomUUID } from "crypto"
import path from "path"
import { promises as fs } from "fs"

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024

function getExtensionFromMime(mime: string | undefined) {
  switch (mime) {
    case "image/jpeg":
      return "jpg"
    case "image/png":
      return "png"
    case "image/webp":
      return "webp"
    case "image/gif":
      return "gif"
    default:
      return null
  }
}

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const file = form.get("file")

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Fichier manquant", message: "Veuillez sélectionner une image" }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: "Fichier trop volumineux", message: "Taille max: 2MB" }, { status: 400 })
    }

    const ext = getExtensionFromMime(file.type)
    if (!ext) {
      return NextResponse.json(
        { error: "Format non supporté", message: "Formats acceptés: JPG, PNG, WEBP, GIF" },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadsDir = path.join(process.cwd(), "public", "uploads")
    await fs.mkdir(uploadsDir, { recursive: true })

    const filename = `${randomUUID()}.${ext}`
    const filepath = path.join(uploadsDir, filename)
    await fs.writeFile(filepath, buffer)

    return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Une erreur est survenue", message: "Veuillez réessayer plus tard" }, { status: 500 })
  }
}
