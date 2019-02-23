'use strict';
// version 0.0.1
class NovelFormatConverter{
    chapter: number;
    section: number;
    chapter_text: string;
    section_text: string;
    line: number;
    textline: number;
    title: string;
    sections: {[key: number]: string}[];lines: string[];
    chapters: string[];
    innersection: number;
    inntertext: string[];
    section_change: boolean;
    path: string;
    converted: boolean;
    convertedText: string;

    constructor(lines :string[]){
        this.lines = lines;
        this.chapter = 0;
        this.section = 1;
        this.chapter_text = '';
        this.section_text = '';

        this.line = 0;
        this.textline = 0;
        this.title = 'NOVEL';
        this.sections = [] ;
        this.sections[this.chapter] = {};
        this.chapters = [];
        this.innersection = 0;   // 分割用
        this.inntertext = [];    // 分割用
        this.section_change = true;
        this.path = './';
        this.converted = false;
        this.convertedText = '';
    }
     
    setPath(path: string):void{
        this.path = path;
    }

    getChapters() :string[]{
        let c :string[] = [];
        for (let chap in this.chapters)
            c.push(this.chapters[chap]);
        return c;
    }
     
    getSections(num: number):string[]{
        let s :string[]= [];
        for (let sec in this.sections[num])
            s.push(this.sections[num][sec]); 
        return s;
    }
     
    convert(text: string): string{
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
            const formated = String.raw`<a name="${this.chapter}_${this.section}"></a><h3 class="s${this.chapter}_${this.section}">${this.section_text}</h3>`;
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
        let formated: string;
//   ルビ
        formated = text.replace(/｜(.+?)《(.+?)》/g,'<ruby class="ruby">$1<rt>$2</rt></ruby>');
//   傍点
        formated = formated.replace(/《{2}(.+?)》{2}/g,'<span class="em-dot">$1</span>');
//   縦横中
        formated = formated.replace(/\[(.+?)\]/g,'<span class="tcy">$1</span>');
             
        this.line ++;
        let htmltext = String.raw`<p id=P${this.chapter}_${this.section}_ ${this.line}>${formated}</p>`;
        return htmltext;
    }

    convertAll(): string {
        if(this.converted)
             return this.convertedText; 
        let text = String.raw`<div id="_${this.innersection}">`;
        this.section_change =false;
        for (let row in this.lines) {
            let s =  this.convert(this.lines[row]);
            if(this.section_change){
                s = String.raw`</div><div id="_${this.innersection}">${s}`;
                this.section_change =false;
            }
            text += s;
        }
        text += '</div>';
        this.converted = true;
        this.convertedText;
        return text;
    };

    convertSection(num: number): string {
        this.section_change =false;
        let text = '';
        let ret_text = '';        
        for (let row in this.lines){
            let s = this.convert(this.lines[row]);
            if(this.section_change){
                this.section_change =false;
                if(this.innersection == num + 1)
                    ret_text = text;
                else
                    text = '';
            }
            text += s;
        }
        this.converted = false;
        return ret_text;
    }

    getConverted():boolean {
        return this.converted;
    }

    createIndex(opt :any) :string {
        const label = NovelFormatConverter.template`<label for="label${"chapter"}">${"num"} ${"text"}</label><input type="radio" name="menu" id="label${"chapter"}" class="cssacc" />`
        let ftext :string;
        ftext = '';
         //章リスト
        const chapters = this.getChapters();
        let i=1;
        let k=0;
        //目次作成
        for (let chap in chapters){
            chap = chapters[chap];

            k ++;
            const cstr = NovelFormatConverter.numHan2Zen(i);
            ftext += label({chapter: i,num: cstr,text: chap});
            ftext += '<div class="accshow">'
            if ( opt['section'])
                ftext += String.raw`<a href="${opt['self']}&section=${k}">${chap}</a> <br>`;
            else
                ftext += String.raw`<a href="#c${i}">${chap}</a> <br>`;
            const sec = this.getSections(i);
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
        return ftext;
    }

    static numHan2Zen(num: string | number) :string{
        const zenhan = ['０','一','二','三','四','五','六','七','八','九'];
        num = String(num);
        let str = '';
        for (let i = 0 ; i < num.length ; i++ ){
            str += zenhan [Number(num.charAt(i))];
        }
        return str;
    }

    static template(strings :any, ...keys :any) {
        return (function(...values: {}[]) :string {
          var dict :any = values[values.length - 1] || {};
          var result = [strings[0]];
          keys.forEach(function(key :any, i:number) {
            var value = Number.isInteger(key) ? values[key] : dict[key];
            result.push(value, strings[i + 1]);
          });
          return result.join('');
        });
    }
}


//HTMLに成形

function createHTMLPage(obj: string | NovelFormatConverter,opt: { [x: string]: any; }) : string {
    let style: string;
    let text: string;
    if ( 'style' in opt ){
        style = opt['style'][0];
    }else{
        style = 'full';
    }

    const header = NovelFormatConverter.template`<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
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
    <div id="body" class="body"><div class="novel" id="novel"> `;
    const titlehtml = NovelFormatConverter.template`<h1 class="title" id="title">${"title"}</h1>`;
    const prefooter = '</div></div><div id="footer" class="footer">';
    const footer =  NovelFormatConverter.template`<div class="accbox">${"footer"}</div>`;
    const postfotter = '</div></body></html>';

    const label = NovelFormatConverter.template`<label for="label${"chapter"}">${"num"} ${"text"}</label><input type="radio" name="menu" id="label${"chapter"}" class="cssacc" />`



    if  (!opt['js_path'])  opt['js_path'] = './';
    if  (!opt['css_path'])  opt['css_path'] = './';
    if (!opt['mode'] ) opt['mode'] = 'cgi';

    let conv;
    if ( typeof obj  === 'string') {
        let text:string = obj;
        const lines:Array<string> = text.split(/\n/g);
        conv  = new NovelFormatConverter(lines);
    } else {
        conv = obj;
    }

    if ( opt['section']){
        text = conv.convertSection(Number(opt['section'][0]));
    }  else {
        text = conv.convertAll();
    }

    let ftext = conv.createIndex(opt);

    if (style == 'bone'){
        const h = header({title:conv.title,css_path:opt['css_path'],js_path:opt['js_path'],mode:opt['mode']});
        const f = footer({footer:ftext})
        const html = h + prefooter + f + postfotter;
        return html;
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
            if(conv.innersection>n)
                html += String.raw`<p><a href="${opt['self']}&section=${n+1}">［次へ］</a></p><p></p>`;
        } else
            html += text;
    }
    if ( style != 'noheader')
        if ( style == 'index')
            html = f;
        else
            html += prefooter + f + postfotter;
    return html;
}

//ファイルから読み込む
function fromFile(filename: string){
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
    const lines:Array<string> = text.split(/\n/g);
    const conv  = new NovelFormatConverter(lines);
    return conv;
}


exports.NovelFormatConverter = NovelFormatConverter;
exports.fromFile = fromFile;
exports.createHTMLPage = createHTMLPage;