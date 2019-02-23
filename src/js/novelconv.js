'use strict';

class NovelFormatConverter{
    constructor(){
        this.chapter = 0;
        this.section = 1;
        this.chapter_text = '';
        this.secion_text = '';
        this.line = 0;
        this.textline = 0;
        this.title = 'NOVEL';
        this.sections = {};
        this.sections[this.chapter] = {};
        this.chapters = {};
        this.innersection = 0;   // 分割用
        this.inntertext = [];    // 分割用
        this.section_change = true;
        this.path = './';
    }
     
    setPath(path){
        this.path = path;
    }
    getChapters(){
        let c = [];
        for (let chap in this.chapters)
            c.push(this.chapters[chap]);
        return c;
    }
    
    getSections(num){
        let s = [];
        for (let sec in this.sections[num])
            s.push(this.sections[num][sec]); 
        return s;
    }
     
    convert(text){
//    []プラグマ    未実装
        text = text.replace(/\n/,'');    //chop
     
        if (this.textline == 0)  //  仮タイトル
            this.title = text;
        this.textline ++;
//   <　> & の置換
     
        text = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
     
        if(text.match(/\[NOVEL\]/))
            return '';

//    @プラグマ TITLEのみ実装
        if( text.match('@.+$') ){
            const pragma = text.replace(/^\s*@(.+)\s*$/,"$1");
            const args = pragma.split(/\s*=\s*/);
            if(args[0].toUpperCase() == 'TITLE'){
                this.title = args[1];
                return '';
            }
            else if(args[0].toUpperCase() == 'IMAGE')                
                 return String.raw`<img src="${args[1]}" class="oimage">`;
        }
//   章・節
        if(text.match('##')){
            this.section_text = text.replace(/^##\s*/,'');
            this.sections[this.chapter][this.section] = this.section_text;
            const formated = String.raw`<a name="${this.chapter}_${this.section}"></a><h3 class="s${this.chapter}_${this.section}">${this.secion_text}</h3>`;
            this.section += 1;
            this.innersection += 1;
            this.section_change = true;
            return formated;
        }
        if(text.match('#')){
            this.chapter ++;
            this.chapter_text = text.replace(/^#\s*/,'');
            this.chapters[this.chapter] = this.chapter_text;
            const formated =  String.raw`<a name="c${this.chapter}"></a><h3 class="c${this.chapter}">${this.chapter_text}</h3>`;
            this.section = 1;
            this.sections[this.chapter] = {};
            this.innersection += 1;
            this.section_change = true;
            return formated;
        }
    
//   普通の文章
        let formated;
//   ルビ
        formated = text.replace(/｜(.+?)《(.+?)》/,'<ruby class="ruby">$1<rt>$2</rt></ruby>');
//   傍点
        formated = formated.replace(/《{2}(.+?)》{2}/,'<span class="em-dot">$1</span>');
//   縦横中
        formated = formated.replace(/\[(.+?)\]/,'<span class="tcy">$1</span>');
             
        this.line ++;
        let htmltext = String.raw`<p id=P${this.chapter}_${this.section}_ ${this.line}>${formated}</p>`;
        return htmltext;
    }

    convertAll(f){
        let text = String.raw`<div id="_${this.innersection}">`;
        this.section_change =false;
        for (let row in f) {
            let s =  this.convert(f[row]);
            if(this.section_change){
                s = String.raw`</div><div id="_${this.innersection}">${s}`;
                this.section_change =false;
            }
            text += s;
        }
        text += '</div>';
        return text;
    }

    convertSection(f,num){
        this.section_change =false;
        let text = '';
        let ret_text = '';
        for (let row in f){
            let s = this.convert(f[row]);
            if(this.section_change){
                this.section_change =false;
                if(this.innersection == num + 1)
                    ret_text = text;
                else
                    text = '';
            }
            text += s;
        }
        return ret_text;
    }
}

function numHan2Zen(num){
    const zenhan = ['０','一','二','三','四','五','六','七','八','九'];
    num = String(num);
    let str = '';
    for (let i = 0 ; i < num.length ; i++ ){
        str += zenhan [Number(num.charAt(i))];
    }
    return str;
}

function template(strings, ...keys) {
    return (function(...values) {
      var dict = values[values.length - 1] || {};
      var result = [strings[0]];
      keys.forEach(function(key, i) {
        var value = Number.isInteger(key) ? values[key] : dict[key];
        result.push(value, strings[i + 1]);
      });
      return result.join('');
    });
}

//HTMLに成形

  function createHTMLPage(text,opt) {
    let style;
    let ftext = '';
    if ( 'style' in opt ){
        style = opt['style'][0];
    }else{
        style = 'full';
    }
    const header = template`<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
    "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml" xml:lang="ja" lang="ja"><head>
    <meta http-equiv="Content-Type" content="text/html;charset=UTF-8">
    <meta http-equiv="Content-Script-Type" content="text/javascript">
    <script type="text/javascript" src="${"js_path"}/viewer.js">
    </script>
    <title>${"title"}</title>
    <link rel="stylesheet" href="${"css_path"}/viewer-common.css" type="text/css" id="common-css">
    <link rel="stylesheet" href="${"css_path"}/viewer.css" type="text/css" id="viewer-css">
    </head>
    <body colorset="default" fontset="default" fontsize="default" css_path="${"css_path"}" js_path="${"js_path"}" mode="${"mode"}">
    <div class ="header" id="header"></div>
    <div id="body" class="body"><div class="novel" id="novel">`;
    const titlehtml = template`<h1 class="title" id="title">${"title"}</h1>`;
    const prefooter = '</div></div>';
    const footer =  template`<div id="footer" class="footer"><div class="accbox">${"footer"}</div></div>`;
    const postfotter = '</body></html>';
    if  (!opt['js_path'])  opt['js_path'] = './';
    if  (!opt['css_path'])  opt['css_path'] = './';
    if (!opt['mode'] ) opt['mode'] = 'cgi';

    text = text.split(/\n/g);
    const conv  = new NovelFormatConverter();
    if ( opt['section']){
        text = conv.convertSection(text,Number(opt['section'][0]));
    }  else {
        text = conv.convertAll(text);
    }
    if (style == 'bone'){
        const h = header({title:conv.title,css_path:opt['css_path'],js_path:opt['js_path'],mode:opt['mode']});
        const f = footer({footer:ftext})
        html = h + prefooter + f + postfotter;
        return html;
    }
    //章リスト
    const chapters = conv.getChapters();
    let i=1;
    let k=0;
    //目次作成
    const label = template`<label for="label${"chapter"}">${"num"} ${"text"}</label><input type="radio" name="menu" id="label${"chapter"}" class="cssacc" />`
    for (let chap in chapters){
        chap = chapters[chap];

        k ++;
        const cstr = numHan2Zen(i);
        ftext += label({chapter: i,num: cstr,text: chap});
        ftext += '<div class="accshow">'    
        if ( opt['section'])
            ftext += String.raw`<a href="${opt['self']}&section=${k}">${chap}</a> <br>`;
        else
            ftext += String.raw`<a href="#c${i}">${chap}</a> <br>`;
        const sec = conv.getSections(i);
        let j = 1;
        for (let ses in sec){
            ses = sec[ses];
            k ++;
            if ( opt['section'] )
                ftext += String.raw`<a href="${opt['self']}&section=${k}">${ses}</a> <br>`;
            else
                ftext += String.raw`<a href="#${i}_${j}">${ses}</a> <br>`;
            j ++;
        }
        i ++;
        ftext += '</div>';
    }
    const h = header({title :conv.title,css_path: opt['css_path'],js_path: opt['js_path'],mode: opt['mode']});
    const f = footer({footer: ftext});
    let html = ''
    if (  style != 'noheader')
        html += h;
    if (  style != 'skeleton') {
        html += titlehtml({title: conv.title});
        if ( opt['section']) {
            let  n = Number(opt['section'][0]);
            if(n>0)
                html += String.raw`<p><a href="${opt['self']}&section=${n-1}">［前へ］</a></p>`;
            html += text
            if(k>n)
                html += String.raw`<p><a href="${opt['self']}&section=${n+1}">［次へ］</a></p><p></p>`;
        } else
            html += text;
    }
    if ( style != 'noheader')
        if ( style == 'index')
            html += f;
        else
            html += prefooter + f + postfotter;
    return html;
}

//ファイルから読み込む
function fromFile(filename){
    let text = '';
    try{
        const fs = require('fs');
        text = fs.readFileSync(filename, {encoding: "utf-8"});
    } catch(e) {
        console.log(e);
        if(text == ''){
            text = '　　　　　　　　　　　　　　　　　ファイルが見つかりません　　　　　　　　　　　　　　　　';
        }
    }
    return text;
}

let opt = {};
let text = fromFile('/Users/takeshisaito/Dropbox/創作/中世ファンタジーのリアライズ問題.nvl');
let html = createHTMLPage(text,opt);
console.log(html);
