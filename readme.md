# NovelViewer
　なろう系のフォーマットをHTML形式に変換させるスクリプト (novelconv.js)とGUI部品(novelviewer)の組み合わせ

# 要件
 node.js , electron , tsc , electron-download ,command-line-args

## MACでクロスコンパイルする場合
- Windows版をビルドするにはwineが必要
- Linuxのdebをビルドするにはdebが必要
- Linuxのrpmをビルドするにはrpmが必要

## Windowsでクロスコンパイルする場合
　調査中

# インストール
 忘れたので調査中……

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
0.1.0 2019/03/01 Build付き
0.2.0-pre 2019/03/
- 見た目を変更
- cgi-mode追加

# Author
MITH@mmk 2019