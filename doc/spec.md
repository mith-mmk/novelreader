注意：作りかけ

# データの保存場所
　ブラウザ
-  Windows
-  MAC ~/Library/Application Support/novelreader
-  Linux

# ホスト側のconfig（未実装）
- ファイル名
- Window possision(x,y)
- Window size(width,height)

# GUI側のコンフィグ
- PATH
- Initial CSS
- FONTFAMIRY
- FONTSIZE
- COLORMODE
- scroll position

===
position change
('body')
left =  scrollWidth - (pre.scrollTop * scrollWidth / pre.scrollHeight) + clientWidth
top =  (pre.scrollWidth -  pre.scrollLeft - clientWidth) *  scrollHeight / pre.scrollWidth

pre.scrollTop 48426 
pre.scrollHeight  218639
scrollWidth 314316

314316 - (48426 * 314316/ 218639) 

(314316 - 243893 - 800) * 218639 / 314316