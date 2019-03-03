"use strct";

// version 0.1.0 novelviewer
// License MIT  (C) 2019 MITH@mmk

// main script for NovelViewer
// Electronのモジュール
const electron = require("electron");

//　コマンドラインパーサー
const commandLineArgs = require('command-line-args');
const novelconv = require('./js/novelconv');

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
  if (process.platform != "darwin") {
    app.quit();
  }
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
      try {
        let filenames = dialog.showOpenDialog({
          properties: ['openFile'],
          title: '小説ファイルを選択してください',
          filters: [
            {'text':'txt'},
           {'All':'*'}]
        });
        filename = filenames[0];
      } catch {
        return;
      }
    }
    loadFile(event);
  });

  // ファイルを読む
  ipcMain.on('fileload', (event, arg) => {
    console.log(arg);
    console.log("load " + arg);
    filename = arg;
    loadFile(event);
  });

  // リロード
  ipcMain.on('reload', (event, arg) => {
    console.log("reload");
    loadFile(event);
  });

  function loadFile(event) {
    const fs = require('fs');
//    fs.readFile(filename, {encoding: "utf-8"},function (e,text) {
      charsetAutoDetectFileRead(filename,(e,text) => {
        if(e) throw err;
        const lines = text.split(/\n/g);
        const conv  = new novelconv.NovelFormatConverter(lines); 
        opt['style'] = ['noheader'];
        text = novelconv.createHTMLPage(conv,opt);
        event.sender.send('body', text);  //本文
        opt['style'] = ['index'];
        text = novelconv.createHTMLPage(conv,opt);
        event.sender.send('index', text); //目次
        event.sender.send('title', conv.getTitle()); //タイトル
      });
  }

  function charsetAutoDetectFileRead(filename,callback){
    const fs = require('fs');

    const charsetDetect = (filename) => {
      return new Promise((result, reject) => {
        try {
          const fd = fs.openSync(filename, "r");
          let buffer = Buffer.alloc(1024); // 最初の1024byteだけ呼んで文字コードを判別
          fs.read(fd, buffer, 0, 1024, 0, (err, byteRead, buffer) => {
            if (err)
              reject(err);
            const jschardet = require('jschardet');
            const encoding = jschardet.detect(buffer);
            fs.closeSync(fd); // 一回閉じる
            result({filename: filename, encoding: encoding.encoding,callback: callback});
          });
        }
        catch (e) {
          reject(e);
        }
      });
    };
    charsetDetect(filename)
      .then((result)=>{
        const filename = result.filename;
        const encoding = result.encoding;
        const callback = result.callback;
          
        try {
          const iconv = require('iconv-lite');
          const stream = fs.createReadStream(filename).pipe(iconv.decodeStream(encoding));
          let text = '';
          stream.on("data",(chunk) => {text += chunk;})
          stream.on('end', () => {
            callback(null,text);
          });
        }
        catch (e) {
          throw e;
        }
      })
      .catch( (e) => {console.log("error" + e)});

  }
});


// コマンドライン
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

