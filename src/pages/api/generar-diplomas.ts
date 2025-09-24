import formidable from "formidable";
import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";
import * as XLSX from "xlsx";
import { createCanvas, loadImage } from "canvas";

export const prerender = false;

export async function POST(context: any) {
  const req = context.locals?.node?.req ?? (context.request as any).node?.req;
  if (!req) {
    return new Response("❌ No se pudo acceder al request nativo de Node", { status: 500 });
  }

  const form = formidable({
    multiples: false,
    uploadDir: "/tmp",
    keepExtensions: true,
  });

  return new Promise((resolve) => {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return resolve(new Response("❌ Error al procesar el formulario: " + err.message, { status: 500 }));
      }

      try {
        const dataFile = (files.excel as any)?.filepath;
        const plantillaPath = (files.plantilla as any)?.filepath;
        if (!dataFile || !plantillaPath) {
          return resolve(new Response("❌ Faltan archivos", { status: 400 }));
        }

        // Detectar extensión
        const ext = path.extname(dataFile).toLowerCase();
        let data: any[] = [];

        if (ext === ".xlsx" || ext === ".xls") {
          const workbook = XLSX.readFile(dataFile);
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          data = XLSX.utils.sheet_to_json(sheet);
        } else if (ext === ".csv") {
          const csvStr = fs.readFileSync(dataFile, "utf8");
          data = XLSX.utils.sheet_to_json(XLSX.read(csvStr, { type: "string" }).Sheets.Sheet1);
        } else if (ext === ".txt") {
          const txtStr = fs.readFileSync(dataFile, "utf8");
          const lines = txtStr.split("\n").map(l => l.trim()).filter(Boolean);
          data = lines.map(line => {
            const parts = line.includes("\t") ? line.split("\t") : line.split(",");
            return { Nombre: parts[0], Título: parts[1] || "" };
          });
        } else {
          return resolve(new Response("❌ Formato no soportado", { status: 400 }));
        }

        // Generar diplomas
        const zip = new AdmZip();
        const plantilla = await loadImage(plantillaPath);

        for (const row of data) {
          const nombre = row["Nombre"];
          const titulo = row["Título"];

          const canvas = createCanvas(plantilla.width, plantilla.height);
          const ctx = canvas.getContext("2d");

          ctx.drawImage(plantilla, 0, 0);

          ctx.font = "bold 70px Arial";
          ctx.fillStyle = "black";
          ctx.textAlign = "center";
          ctx.fillText(nombre, plantilla.width / 2, plantilla.height * 0.55);

          ctx.font = "italic 50px Arial";
          ctx.fillText(`"${titulo}"`, plantilla.width / 2, plantilla.height * 0.63);

          const buffer = canvas.toBuffer("image/jpeg");
          zip.addFile(`${nombre.replace(/ /g, "_")}.jpg`, buffer);
        }

        const zipData = zip.toBuffer();

        return resolve(new Response(zipData, {
          headers: {
            "Content-Type": "application/zip",
            "Content-Disposition": "attachment; filename=diplomas.zip",
          },
        }));
      } catch (e: any) {
        return resolve(new Response("❌ Error al generar diplomas: " + e.message, { status: 500 }));
      }
    });
  });
}
