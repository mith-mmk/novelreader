"use strct";

// main script for NovelViewer
// Electronのモジュール
const electron = require("electron");

// アプリケーションをコントロールするモジュール
const app = electron.app;

// ウィンドウを作成するモジュール
const BrowserWindow = electron.BrowserWindow;

// メインウィンドウはGCされないようにグローバル宣言
let mainWindow = null;

// 全てのウィンドウが閉じたら終了
app.on("window-all-closed", () => {
//  if (process.platform != "darwin") {
    app.quit();
//  }
});


// Electronの初期化完了後に実行
app.on("ready", () => {
 // 初期ウィンドウを800 * 600 に設定
  mainWindow = new BrowserWindow({width: 800, height: 600, useContentSize: true});
  //使用するhtmlファイルを指定する
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // ウィンドウが閉じられたらアプリも終了
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
});


