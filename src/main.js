"use strct";

// version 0.1.1 novelviewer
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
let force_quit = false;

// 全てのウィンドウが閉じたら終了 MACはDockにアプリを残す
app.on("window-all-closed", () => {
  if (process.platform != "darwin") {
    app.quit();
  }
});


let opt = {css_path: './assets/css',js_path: './assets/js',mode: "electron"};


// プロセスを終了させるときにだけmainWindowsを削除する
app.on('will-quit', function () {
  mainWindow = null;
});


// Electronの初期化完了後に実行
app.on("ready", () => {
  const { ipcMain } = require('electron');
 // 初期ウィンドウを800 * 600 に設定
  mainWindow = new BrowserWindow({width: 800, height: 600, useContentSize: true,webPreferences:{nodeIntegration: true}});
//使用するhtmlファイルを指定する
  mainWindow.loadURL(`file://${__dirname}/index.html`);

 
  // ウィンドウが閉じられたらアプリも終了させる
  // MACの場合はウィンドウを隠すだけで終了させない処理が必要になるので
  // closeさせないでhideする
  mainWindow.on("close", (e) => {    
    if (process.platform == "darwin") {
      if(!force_quit){
        e.preventDefault()
        if(mainWindow){
          if(mainWindow.isDestroyed())
            console.log("main window is already destroy");
          else
            mainWindow.hide();
            return;
        } else 
          console.log("mainwindow is already null")
      }
    }
  });

  // MAC用 強制終了処理が入ったときにだけウィンドウを強制終了させるフラグを立てる
  app.on('before-quit', (e) => {
    force_quit = true;
  });

  // MAC用 hideしたwindowを再表示する
  app.on('activate', function(){
    mainWindow.show();
  });

  // ブラウザ側から呼び出された初期化イベントを処理する
  ipcMain.on('init', (event, arg) => {
    if(filename == undefined) {
      try {
        console.log('open dialog');
        let filenames = dialog.showOpenDialogSync({
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

// テキストファイルを読んで　HTMLに変換する
  function loadFile(event) {
//    const fs = require('fs');
//    fs.readFile(filename, {encoding: "utf-8"},function (e,text) {
      console.log(filename);
      charsetAutoDetectFileRead(filename,(e,text) => {  // 文字コードを自動判別してファイルをロードする
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
/* fs.readFileをそのまま置き換えられる様にしたラッパー関数 */
  function charsetAutoDetectFileRead(filename,callback){
    const fs = require('fs');

    const charsetDetect = (filename) => {
      return new Promise((result, reject) => {  //おまじない
        try {
          const fd = fs.openSync(filename, "r");
          let buffer = Buffer.alloc(1024); // 最初の1024byteから文字コードを判別　全部読み出すと処理が重くなるため
          fs.read(fd, buffer, 0, 1024, 0, (err, byteRead, buffer) => {
            if (err)
              reject(err);
            const jschardet = require('jschardet');
            const encoding = jschardet.detect(buffer);  // 文字コードを確認
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
          const stream = fs.createReadStream(filename).pipe(iconv.decodeStream(encoding));  //文字コード変換ルーチン
          let text = '';
          stream.on("data",(chunk) => {text += chunk;})   // データを読み込んだらバッファに追加
          stream.on('end', () => {                        // 読み終わったらコールバック関数に返す
            callback(null,text);
          });
        }
        catch (err) {
          callback(err,null);
//          throw e;
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

