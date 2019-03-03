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
0.1.1 2019/03/01 ファイルの配置整理／ビルドマネージャの導入
0.1.2 2019/03/03 UTF-8以外のファイルに対応/その他一部変更/MACの終了処理周りの修正/縦横変更時のスクロールの追従

#予定
- App
    - MACのメニュー周り
    - UIの見直し
        - ボタン周り
        - 表示周り
    - 挿絵の追加
    - ファイルごとに設定を記憶

- Lib
    - cgi-mode追加
    - REST API mode追加
    - async read
    - VS Code 拡張機能 mode

優先度低い
    - 縦横変換したときの位置変換


# Author
MITH@mmk 2019