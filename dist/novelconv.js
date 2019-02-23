'use strict';
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var NovelFormatConverter = /** @class */ (function () {
    function NovelFormatConverter() {
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
        this.innersection = 0; // 分割用
        this.inntertext = []; // 分割用
        this.section_change = true;
        this.path = './';
    }
    NovelFormatConverter.prototype.setPath = function (path) {
        this.path = path;
    };
    NovelFormatConverter.prototype.getChapters = function () {
        var c = [];
        for (var chap in this.chapters)
            c.push(this.chapters[chap]);
        return c;
    };
    NovelFormatConverter.prototype.getSections = function (num) {
        var s = [];
        for (var sec in this.sections[num])
            s.push(this.sections[num][sec]);
        return s;
    };
    NovelFormatConverter.prototype.convert = function (text) {
        //    []プラグマ    未実装
        text = text.replace(/\n/, ''); //chop
        if (this.textline == 0) //  仮タイトル
            this.title = text;
        this.textline++;
        //   <　> & の置換
        text = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
        if (text.match(/\[NOVEL\]/))
            return '';
        //    @プラグマ TITLEのみ実装
        if (text.match('@.+$')) {
            var pragma = text.replace(/^\s*@(.+)\s*$/, "$1");
            var args = pragma.split(/\s*=\s*/);
            if (args[0].toUpperCase() == 'TITLE') {
                this.title = args[1];
                return '';
            }
            else if (args[0].toUpperCase() == 'IMAGE')
                return String.raw(__makeTemplateObject(["<img src=\"", "\" class=\"oimage\">"], ["<img src=\"", "\" class=\"oimage\">"]), args[1]);
        }
        //   章・節
        if (text.match('##')) {
            this.section_text = text.replace(/^##\s*/, '');
            this.sections[this.chapter][this.section] = this.section_text;
            var formated_1 = String.raw(__makeTemplateObject(["<a name=\"", "_", "\"></a><h3 class=\"s", "_", "\">", "</h3>"], ["<a name=\"", "_", "\"></a><h3 class=\"s", "_", "\">", "</h3>"]), this.chapter, this.section, this.chapter, this.section, this.secion_text);
            this.section += 1;
            this.innersection += 1;
            this.section_change = true;
            return formated_1;
        }
        if (text.match('#')) {
            this.chapter++;
            this.chapter_text = text.replace(/^#\s*/, '');
            this.chapters[this.chapter] = this.chapter_text;
            var formated_2 = String.raw(__makeTemplateObject(["<a name=\"c", "\"></a><h3 class=\"c", "\">", "</h3>"], ["<a name=\"c", "\"></a><h3 class=\"c", "\">", "</h3>"]), this.chapter, this.chapter, this.chapter_text);
            this.section = 1;
            this.sections[this.chapter] = {};
            this.innersection += 1;
            this.section_change = true;
            return formated_2;
        }
        //   普通の文章
        var formated;
        //   ルビ
        formated = text.replace(/｜(.+?)《(.+?)》/, '<ruby class="ruby">$1<rt>$2</rt></ruby>');
        //   傍点
        formated = formated.replace(/《{2}(.+?)》{2}/, '<span class="em-dot">$1</span>');
        //   縦横中
        formated = formated.replace(/\[(.+?)\]/, '<span class="tcy">$1</span>');
        this.line++;
        var htmltext = String.raw(__makeTemplateObject(["<p id=P", "_", "_ ", ">", "</p>"], ["<p id=P", "_", "_ ", ">", "</p>"]), this.chapter, this.section, this.line, formated);
        return htmltext;
    };
    NovelFormatConverter.prototype.convertAll = function (f) {
        var text = String.raw(__makeTemplateObject(["<div id=\"_", "\">"], ["<div id=\"_", "\">"]), this.innersection);
        this.section_change = false;
        for (var row in f) {
            var s = this.convert(f[row]);
            if (this.section_change) {
                s = String.raw(__makeTemplateObject(["</div><div id=\"_", "\">", ""], ["</div><div id=\"_", "\">", ""]), this.innersection, s);
                this.section_change = false;
            }
            text += s;
        }
        text += '</div>';
        return text;
    };
    ;
    NovelFormatConverter.prototype.convertSection = function (f, num) {
        this.section_change = false;
        var text = '';
        var ret_text = '';
        for (var row in f) {
            var s = this.convert(f[row]);
            if (this.section_change) {
                this.section_change = false;
                if (this.innersection == num + 1)
                    ret_text = text;
                else
                    text = '';
            }
            text += s;
        }
        return ret_text;
    };
    return NovelFormatConverter;
}());
function numHan2Zen(num) {
    var zenhan = ['０', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    num = String(num);
    var str = '';
    for (var i = 0; i < num.length; i++) {
        str += zenhan[Number(num.charAt(i))];
    }
    return str;
}
function template(strings) {
    var keys = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        keys[_i - 1] = arguments[_i];
    }
    return (function () {
        var values = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            values[_i] = arguments[_i];
        }
        var dict = values[values.length - 1] || {};
        var result = [strings[0]];
        keys.forEach(function (key, i) {
            var value = Number.isInteger(key) ? values[key] : dict[key];
            result.push(value, strings[i + 1]);
        });
        return result.join('');
    });
}
//HTMLに成形
function createHTMLPage(text, opt) {
    var style;
    var ftext = '';
    if ('style' in opt) {
        style = opt['style'][0];
    }
    else {
        style = 'full';
    }
    var header = template(__makeTemplateObject(["<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\"\n    \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">\n    <html xmlns=\"http://www.w3.org/1999/xhtml\" xml:lang=\"ja\" lang=\"ja\"><head>\n    <meta http-equiv=\"Content-Type\" content=\"text/html;charset=UTF-8\">\n    <meta http-equiv=\"Content-Script-Type\" content=\"text/javascript\">\n    <script type=\"text/javascript\" src=\"", "/viewer.js\">\n    </script>\n    <title>", "</title>\n    <link rel=\"stylesheet\" href=\"", "/viewer-common.css\" type=\"text/css\" id=\"common-css\">\n    <link rel=\"stylesheet\" href=\"", "/viewer.css\" type=\"text/css\" id=\"viewer-css\">\n    </head>\n    <body colorset=\"default\" fontset=\"default\" fontsize=\"default\" css_path=\"", "\" js_path=\"", "\" mode=\"", "\">\n    <div class =\"header\" id=\"header\"></div>\n    <div id=\"body\" class=\"body\"><div class=\"novel\" id=\"novel\"> "], ["<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\"\n    \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">\n    <html xmlns=\"http://www.w3.org/1999/xhtml\" xml:lang=\"ja\" lang=\"ja\"><head>\n    <meta http-equiv=\"Content-Type\" content=\"text/html;charset=UTF-8\">\n    <meta http-equiv=\"Content-Script-Type\" content=\"text/javascript\">\n    <script type=\"text/javascript\" src=\"", "/viewer.js\">\n    </script>\n    <title>", "</title>\n    <link rel=\"stylesheet\" href=\"", "/viewer-common.css\" type=\"text/css\" id=\"common-css\">\n    <link rel=\"stylesheet\" href=\"", "/viewer.css\" type=\"text/css\" id=\"viewer-css\">\n    </head>\n    <body colorset=\"default\" fontset=\"default\" fontsize=\"default\" css_path=\"", "\" js_path=\"", "\" mode=\"", "\">\n    <div class =\"header\" id=\"header\"></div>\n    <div id=\"body\" class=\"body\"><div class=\"novel\" id=\"novel\"> "]), "js_path", "title", "css_path", "css_path", "css_path", "js_path", "mode");
    var titlehtml = template(__makeTemplateObject(["<h1 class=\"title\" id=\"title\">", "</h1>"], ["<h1 class=\"title\" id=\"title\">", "</h1>"]), "title");
    var prefooter = '</div></div>';
    var footer = template(__makeTemplateObject(["<div id=\"footer\" class=\"footer\"><div class=\"accbox\">", "</div></div>"], ["<div id=\"footer\" class=\"footer\"><div class=\"accbox\">", "</div></div>"]), "footer");
    var postfotter = '</body></html>';
    var label = template(__makeTemplateObject(["<label for=\"label", "\">", " ", "</label><input type=\"radio\" name=\"menu\" id=\"label", "\" class=\"cssacc\" />"], ["<label for=\"label", "\">", " ", "</label><input type=\"radio\" name=\"menu\" id=\"label", "\" class=\"cssacc\" />"]), "chapter", "num", "text", "chapter");
    if (!opt['js_path'])
        opt['js_path'] = './';
    if (!opt['css_path'])
        opt['css_path'] = './';
    if (!opt['mode'])
        opt['mode'] = 'cgi';
    var lines = text.split(/\n/g);
    var conv = new NovelFormatConverter();
    if (opt['section']) {
        text = conv.convertSection(lines, Number(opt['section'][0]));
    }
    else {
        text = conv.convertAll(lines);
    }
    if (style == 'bone') {
        var h_1 = header({ title: conv.title, css_path: opt['css_path'], js_path: opt['js_path'], mode: opt['mode'] });
        var f_1 = footer({ footer: ftext });
        var html_1 = h_1 + prefooter + f_1 + postfotter;
        return html_1;
    }
    //章リスト
    var chapters = conv.getChapters();
    var i = 1;
    var k = 0;
    //目次作成
    for (var chap in chapters) {
        chap = chapters[chap];
        k++;
        var cstr = numHan2Zen(i);
        ftext += label({ chapter: i, num: cstr, text: chap });
        ftext += '<div class="accshow">';
        if (opt['section'])
            ftext += String.raw(__makeTemplateObject(["<a href=\"", "&section=", "\">", "</a> <br>"], ["<a href=\"", "&section=", "\">", "</a> <br>"]), opt['self'], k, chap);
        else
            ftext += String.raw(__makeTemplateObject(["<a href=\"#c", "\">", "</a> <br>"], ["<a href=\"#c", "\">", "</a> <br>"]), i, chap);
        var sec = conv.getSections(i);
        var j = 1;
        for (var ses in sec) {
            ses = sec[ses];
            k++;
            if (opt['section'])
                ftext += String.raw(__makeTemplateObject(["<a href=\"", "&section=", "\">", "</a> <br>"], ["<a href=\"", "&section=", "\">", "</a> <br>"]), opt['self'], k, ses);
            else
                ftext += String.raw(__makeTemplateObject(["<a href=\"#", "_", "\">", "</a> <br>"], ["<a href=\"#", "_", "\">", "</a> <br>"]), i, j, ses);
            j++;
        }
        i++;
        ftext += '</div>';
    }
    var h = header({ title: conv.title, css_path: opt['css_path'], js_path: opt['js_path'], mode: opt['mode'] });
    var f = footer({ footer: ftext });
    var html = '';
    if (style != 'noheader')
        html += h;
    if (style != 'skeleton') {
        html += titlehtml({ title: conv.title });
        if (opt['section']) {
            var n = Number(opt['section'][0]);
            if (n > 0)
                html += String.raw(__makeTemplateObject(["<p><a href=\"", "&section=", "\">\uFF3B\u524D\u3078\uFF3D</a></p>"], ["<p><a href=\"", "&section=", "\">\uFF3B\u524D\u3078\uFF3D</a></p>"]), opt['self'], n - 1);
            html += text;
            if (k > n)
                html += String.raw(__makeTemplateObject(["<p><a href=\"", "&section=", "\">\uFF3B\u6B21\u3078\uFF3D</a></p><p></p>"], ["<p><a href=\"", "&section=", "\">\uFF3B\u6B21\u3078\uFF3D</a></p><p></p>"]), opt['self'], n + 1);
        }
        else
            html += text;
    }
    if (style != 'noheader')
        if (style == 'index')
            html += f;
        else
            html += prefooter + f + postfotter;
    return html;
}
//ファイルから読み込む
function fromFile(filename) {
    var text = '';
    try {
        var fs = require('fs');
        text = fs.readFileSync(filename, { encoding: "utf-8" });
    }
    catch (e) {
        console.log(e);
        if (text == '') {
            text = '　　　　　　　　　　　　　　　　　ファイルが見つかりません　　　　　　　　　　　　　　　　';
        }
    }
    return text;
}
//debug
var opt = { css_path: './assets/css', js_path: './assets/js' };
var text = fromFile('/Users/takeshisaito/Dropbox/創作/中世ファンタジーのリアライズ問題.nvl');
var html = createHTMLPage(text, opt);
console.log(html);
