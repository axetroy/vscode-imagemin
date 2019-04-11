import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs-extra";
import imagemin from "imagemin";

export async function minify(uri: vscode.Uri) {
  const ext = path.extname(uri.fsPath);
  const plugins: imagemin.Plugin[] = [];

  const configuration = vscode.workspace.getConfiguration("imagemin");

  switch (ext) {
    case ".jpg":
    case ".jpeg":
      const jpgOptions = {
        progressive: configuration.get("jpg.progressive"),
        arithmetic: configuration.get("jpg.arithmetic")
      };
      plugins.push(require("imagemin-jpegtran")(jpgOptions));
      break;
    case ".svg":
      const svgOptions = configuration.get("imagemin.svg.options") || {};
      plugins.push(require("imagemin-svgo")(svgOptions));
      break;
    case ".gif":
      const gifOptions = {
        interlaced: configuration.get("gif.interlaced"),
        optimizationLevel: configuration.get("gif.optimizationLevel"),
        colors: configuration.get("gif.colors")
      };
      plugins.push(require("imagemin-gifsicle")(gifOptions));
      break;
    case ".png":
      const pngOptions = {
        speed: configuration.get("png.speed"),
        strip: configuration.get("png.strip"),
        dithering: configuration.get("png.dithering"),
        posterize: configuration.get("png.posterize"),
        quality: [
          configuration.get("png.quality.min"),
          configuration.get("png.quality.max")
        ]
      };
      plugins.push(require("imagemin-pngquant")(pngOptions));
      break;
  }

  const buffer = await imagemin.buffer(await fs.readFile(uri.fsPath), {
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

  await fs.writeFile(outputPath, buffer);
}
