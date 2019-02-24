/*
  viewer.js is viewing setter for novelconv.py
  License see novelconv.py
  - Write Yokogaki/Tategaki
  - Color setting
  - Font size
  - Font
  - index menu
  - keep setting
*/

let _mode = 0;   // yoko
let _fontelm = null;
let css_path = 'assets/css'
let js_path = 'assets/js'
let apimode = 'cgi'

window.onload = function loadBody(){
    let json = getSetting();
    try {
        setColorSet(json.body.colorset);
        setFontSet(json.body.fontstyle);
        setFontSize(json.body.fontsize);
    } catch (error) {
        console.log('not Setting data in Blowser')        
    }
    css_path = document.body.getAttribute("css_path");
    js_path = document.body.getAttribute("js_path");
    apimode = document.body.getAttribute("mode");

    const headerelm = document.getElementById("header");
    
    const menuelm = document.createElement("div");
    menuelm.id = 'menu';
    menuelm.className = 'menu';
    menuelm.innerHTML ='\
    <input type="button" id="tateyoko" class="switchbutton button" onClick="changestyle()" value="縦横"> \
    <input type="button" id="fontmenu" class="fontbutton button" onClick="switchFontMenu()" value="Aあ"> \
    <input type="button" id="indexmenu" class="menubutton button" onClick="switchMenu()" value="目次">'

    if (apimode == 'webview') {
        menuelm.innerHTML +='\
        <input type="button" id="reload" class="reloadbutton button" onClick="api_reload()" value="&#x1f504;"> \
        <input type="button" id="browse" class="browsebutton button" onClick="pywebview.api.open_file_dialog()" value="&#x1f4c1;">';
    }

    if (apimode == 'electron') {
        reloadelm = document.createElement("button");
        reloadelm.id = "reload";
        reloadelm.innerHTML ="&#x1f504;";
        reloadelm.classList.add("reloadbutton");
        reloadelm.classList.add("button");

        dialogelm = document.createElement("button");
        dialogelm.id = "dialog";
        dialogelm.innerHTML = "&#x1f4c1;";
        dialogelm.classList.add("browsebutton");
        dialogelm.classList.add("button");
        
        menuelm.appendChild(reloadelm);
        menuelm.appendChild(dialogelm);
        const { ipcRenderer } = require('electron');
        ipcRenderer.on('body', (event, arg) => {
            console.log("body");
            const elm = document.getElementById("novel");
            elm.innerHTML = arg;
        });
        ipcRenderer.on('index', (event, arg) => {
            console.log("index");
            const elm = document.getElementById("footer");
            elm.innerHTML = arg;
        });

        reloadelm.addEventListener("click",function(){
            const { ipcRenderer } = require('electron');
            ipcRenderer.send('reload', true);
        });
        
        dialogelm.addEventListener("click",function (){
            const dialog = require('electron').remote.dialog;
            let filenames = dialog.showOpenDialog({
            properties: ['openFile'],
            title: '小説ファイルを選択してください',
            filters: [
                {'text':'txt'},
                {'All':'*'}
            ]
            });
            if(filenames.length >= 1)
                ipcRenderer.send('fileload', filenames[0]);
        });

        var holder = document;
        holder.ondragover = function () {
          return false;
        };
        holder.ondragleave = holder.ondragend = function () {
          return false;
        };
        holder.ondrop = function (e) {
          e.preventDefault();
          var file = e.dataTransfer.files[0];
          ipcRenderer.send('fileload', file.path);
          return false;
        };

        ipcRenderer.send('init', true);

    }

    const fontelm = document.createElement("div");
    fontelm.id = 'fontmenu';
    fontelm.innerHTML= '\
    <div class="selector">\
    <select name="Color" class="ColorSelect" id="color" onchange="setColor()">\
    <option value="default" >カラー</option>\
    <option value="dark" background="black" color="white">ダークモード</option>\
    <option value="light">ホワイトモード</option>\
    <option value="cornsilk">デフォルト</option></select><BR>\
    <select name="Font" class="FontSelect" id="font" onchange="setFont()" ><option value="default">フォント</option>\
    <option value="serif">明朝</option>\
    <option value="sansserif">ゴシック</option></select><BR>\
    <select name="FontSize" class="SizeSelect" id="fontsize" onchange="setSize()"><option value="default">フォントサイズ</option>\
    <option value="XL">超大</option>\
    <option value="LL">特大</option>\
    <option value="L">大</option>\
    <option value="M">通常</option>\
    <option value="S">小</option></select></div>'

    fontelm.style.display = 'none';
//    elm.style.display = 'table';
    menuelm.appendChild(fontelm);
    _fontelm = fontelm;
    headerelm.appendChild(menuelm);

    setTakeYoko(json);

    if (apimode == 'webview') {
        setTimeout(function (){
            pywebview.api.getPos().then(setScroll);
        },100);  //Workallound for Webview
    }
}

function setScroll(response) {
    if (_mode != 1){
        document.getElementById('body').scrollTop = response.top;
    } else {
        document.getElementById('body').scrollLeft = response.left;
    }
}

function api_reload(){
    setSetting();
    const params =   {
        top: document.getElementById('body').scrollTop,
        left:  document.getElementById('body').scrollLeft
    }
    pywebview.api.reload(params);
}

function setTakeYoko(json){
    try{
        _mode = json.body.writestyle;
    } catch{
        _mode = 0;
    }

    if(_mode == '1') {
        changeTate('novel');
    } else {
        changeYoko('novel');
    }
}

function changeTate(id){
    let scrollpos = 'header';
    let css = document.getElementById('viewer-css');
    css.href=(css_path + "/viewer-tate.css");
    document.getElementById(scrollpos).scrollIntoView(true) ;
    _mode = 1;
    setSetting();
}

function changeYoko(id){
    let scrollpos = 'header';
    let css = document.getElementById('viewer-css');
    css.href=(css_path + "/viewer.css");
    document.getElementById(scrollpos).scrollIntoView(true) ;
    _mode = 0;
    setSetting();
}

function setColor(){
    const mode = document.getElementById('color').value;
    if(mode !== 'default') setColorSet(mode);
}

function setFont(){
    const mode = document.getElementById('font').value;
    if(mode !== 'default') setFontSet(mode);
}
function setSize(){
    const mode = document.getElementById('fontsize').value;
    if(mode !== 'default') setFontSize(mode);
}

function setColorSet(cmode){
    document.body.setAttribute('colorset',cmode);
    setSetting();
}

function setFontSet(fmode){
    document.body.setAttribute('fontset',fmode);
    setSetting();
}

function setFontSize(fmode){
    document.body.setAttribute('fontsize',fmode);
    setSetting();
}

function changestyle(){
    if(_mode === 0) {    //switch tate
        changeTate("novel");
    } else {            //switch yoko
        changeYoko("novel");
    }
}

menumode = false;

function switchFontMenu(){
    let elm = _fontelm;
    if(elm.style.display !== 'none'){
        elm.style.display = 'none';
    }else{
        elm.style.display = 'block';
    }
}

function switchMenu(){
    let elm = document.getElementById('footer');
    if(menumode){
        elm.style.display = 'none';
        elm.removeEventListener("click",switchMenuHandler);
        menumode = false;
    }else{
        elm.style.display = 'block';
        elm.addEventListener("click",switchMenuHandler);
        menumode = true;
    }
}

function switchMenuHandler(event){
    if(event.target.tagName == 'A'){
        console.log('call method')
        switchMenu();
    }
}

let elf = document.getElementById('footer');


function getSetting(){
    try{
        const setting = localStorage.getItem("settings");
        const json = JSON.parse(setting);
        console.log(json);
        return json;
    }catch{
        return null;
    }
}

function setSetting(){
    let style = document.body.style;
    json = {
        body: {
            colorset: document.body.getAttribute('colorset'),
            fontset: document.body.getAttribute('fontset'),
            fontsize: document.body.getAttribute('fontsize'),
            writestyle: _mode
        },
        header:{

        },
        novel:{
            possition: {
                top: document.getElementById('body').scrollTop,
                left:  document.getElementById('body').scrollLeft
            }
        },
        footer:{
            display : '',

        }
    }
    localStorage.setItem('settings',JSON.stringify(json));
    const _setting = localStorage.getItem("settings");
}
