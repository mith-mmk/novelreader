# NovelViewer
　なろう系のフォーマットをHTML形式に変換させるスクリプト (novelconv.js)とGUI部品(novelviewer)の組み合わせ

# 要件
 node.js , electron , tsc , electron-download ,command-line-args ,iconv-lite, jschardet

## MACでクロスコンパイルする場合
- Windows版をビルドするにはwineが必要
- Linuxのdebをビルドするにはdebが必要
- Linuxのrpmをビルドするにはrpmが必要

## Windowsでクロスコンパイルする場合
　調査中

# インストール
 distの下にインストール用バイナリが置いてあります。

 ソースから起動する方法は、
 node.js をインストールして要件に書いてあるモジュールをnpmでinstallすればたぶん動く。

# 準備中
- 差し替え用css
- 挿絵機能

# 拡張なろう記法について
- @で始まる行は特殊なコマンドを設定します
 @TITLE=タイトル タイトル名の設定
- \# で始まる行は章タイトル
- \## で始まる行は節タイトル
- [] （半角）でくくられた文字は縦中横で表示

（章と節をみて目次を自動生成します）

# version
0.1.0 2019/02/28 スタンドアロン版
0.1.1 2019/03/01 Build付き
0.2.0-pre 2019/03/01 見た目を変更
0.1.1 2019/03/01 ファイルの配置整理／ビルドマネージャの導入
0.1.2 2019/03/16 UTF-8以外のファイルに対応/その他一部変更/MACの終了処理周りの修正/縦横変更時のスクロールの追従/UIの変更

# 予定
1. 0.1.2 追加予定リスト
    - MACのメニュー周り
        - darwin対応 ☑️
    - UIの改良
        - ボタン周り  ️️☑️
        - 表示周り  ☑️
        - 目次周り ️️ ☑️
1. 0.1.3 追加予定リスト
    - MACのメニュー周り
        - 最近使ったファイル
    - 挿絵の追加
    - ファイルごとに設定を記憶
        - レジューム機能
    - option周りの整理
    - 切り替え機能
    - UIの全面見直し

1. 0.2.0 以降
    - マルチウィンドウ
    - novelconvをプロジェクトから分離（novelconv -> jnovelconv)
        - cgi-mode追加
        - REST API mode追加
        - async read
        - VS Code 拡張機能 mode
    - エディタモード

# Author
MITH@mmk 2019