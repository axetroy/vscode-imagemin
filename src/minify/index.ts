import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs-extra";
import imagemin from "imagemin";

export async function minify(uri: vscode.Uri) {
  const ext = path.extname(uri.fsPath);
  const plugins: imagemin.Plugin[] = [];

  switch (ext) {
    case ".jpg":
    case ".jpeg":
      plugins.push(require("imagemin-jpegtran")());
      break;
    case ".svg":
      plugins.push(require("imagemin-svgo")());
      break;
    case ".gif":
      plugins.push(require("imagemin-gifsicle")());
      break;
    case ".png":
      plugins.push(
        require("imagemin-pngquant")({
          quality: [0.6, 0.8]
        })
      );
      break;
  }

  const [result] = await imagemin([uri.fsPath], {
    plugins
  });

  const format = vscode.workspace
    .getConfiguration("imagemin")
    .get("format") as string;

  const filename = path.basename(uri.fsPath, ext);
  const outputPath = path.join(
    path.dirname(uri.fsPath),
    format
      .replace("$FileName", filename)
      .replace("$FileExtensionName", ext.replace(/^\./, ""))
      .trim() || filename + ".min" + ext.replace(/^\./, "")
  );

  await fs.writeFile(outputPath, result.data);
}
