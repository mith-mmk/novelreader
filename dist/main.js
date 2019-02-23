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
const dialog = electron.dialog;

// メインウィンドウはGCされないようにグローバル宣言
let mainWindow = null;
let filename = '';

// 全てのウィンドウが閉じたら終了
app.on("window-all-closed", () => {
//  if (process.platform != "darwin") {
    app.quit();
//  }
});

let opt = {css_path: './assets/css',js_path: './assets/js',mode: "electron"};

// Electronの初期化完了後に実行
app.on("ready", () => {
  const { ipcMain } = require('electron');
 // 初期ウィンドウを800 * 600 に設定
  mainWindow = new BrowserWindow({width: 800, height: 600, useContentSize: true});
  //使用するhtmlファイルを指定する
  mainWindow.loadURL(`file://${__dirname}/index.html`);

// ファイルが指定してなければファイルをロード
  mainWindow.on("show", () => {

  });
  // ウィンドウが閉じられたらアプリも終了
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  ipcMain.on('init', (event, arg) => {
    if(filename == undefined) {
      let filenames = dialog.showOpenDialog({
        properties: ['openFile'],
        title: '小説ファイルを選択してください',
        filters: [
          {'text':'txt'},
          {'All':'*'}]
      });
      filename = filenames[0];
    }
    loadFile(event);
  });

  ipcMain.on('fileload', (event, arg) => {
    console.log(arg);
    console.log("load " + arg);
    filename = arg;
    loadFile(event);
  });

  ipcMain.on('reload', (event, arg) => {
    console.log("reload");
    loadFile(event);
  });

  function loadFile(event) {
    try {
      conv = novelconv.fromFile(filename);
      opt['style'] = ['noheader'];
      text = novelconv.createHTMLPage(conv,opt);
      event.sender.send('body', text);
      opt['style'] = ['index'];
      text = novelconv.createHTMLPage(conv,opt);
      event.sender.send('index', text);
    } catch (e){
      console.log(e);
    }
  }

});



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

