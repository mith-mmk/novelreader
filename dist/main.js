"use strct";

// main script for NovelViewer
// Electronのモジュール
const electron = require("electron");

//　コマンドラインパーサー
const commandLineArgs = require('command-line-args');
const novelconv = require('./novelconv');

// アプリケーションをコントロールするモジュール
const app = electron.app;

// ウィンドウを作成するモジュール
const BrowserWindow = electron.BrowserWindow;

// メインウィンドウはGCされないようにグローバル宣言
let mainWindow = null;
let filename = '';

// 全てのウィンドウが閉じたら終了
app.on("window-all-closed", () => {
//  if (process.platform != "darwin") {
    app.quit();
//  }
});

let opt = {css_path: './assets/css',js_path: './assets/js'};


// Electronの初期化完了後に実行
app.on("ready", () => {

 // 初期ウィンドウを800 * 600 に設定
  mainWindow = new BrowserWindow({width: 800, height: 600, useContentSize: true});
  //使用するhtmlファイルを指定する
  mainWindow.loadURL(`file://${__dirname}/index.html`);

// ファイルが指定してなければファイルをロード
  mainWindow.on("show", () => {
    if(filename == undefined) {
      filename = opendialog(mainWindow);
    } else {
      conv = novelconv.fromFile(filename);
      text = novelconv.createHTMLPage(conv,opt);
      console.log(text);
    }
  });
  // ウィンドウが閉じられたらアプリも終了
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
});


 function opendialog(window){
    const dialog = electron.remote.dialog;
    let filenames = dialog.showOpenDoalog(window,{
    properties: ['open'],
    title: '小説ファイルを選択してください',
    filters: [
      {name: 'テキストファイル',extensions:['txt']},
      {name: '全てのファイル',extensions:['*']}
    ]});
    return filenames[0];
  }

  const optionDefinitions = [
    {
      name: 'help',
      alias: 'h',
      description: 'Display this usage',
      type: Boolean
    },
    {
      name: 'debug',
      alias: 'd',
      description: 'Debug mode',
      type: Boolean
    },
    {
      name: 'file',
      description: 'open file',
      type: String,
      default: '',
      defaultOption: true
    },
  
  /*
    {
      name: 'port',
      alias: 'p',
      description: 'localserver pots',
      type: Number
    },
  */
  ];
  const options = commandLineArgs(optionDefinitions);
  filename = options.file;
  console.log(filename);

