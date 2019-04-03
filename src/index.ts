"use strict";
import * as vscode from "vscode";
import { minify } from "./minify";

export async function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "image.minify",
      async (uri: vscode.Uri, fileList: vscode.Uri[]) => {
        const list = fileList && fileList.length ? fileList : [uri];
        for (const file of list) {
          try {
            await minify(file);
          } catch (err) {
            console.error(err);
          }
        }
      }
    )
  );
}

// this method is called when your extension is deactivated
export function deactivate(context: vscode.ExtensionContext) {
  //
}
