/*
  viewer.js is viewing setter for novelconv.py / novelviewer on Node.js
  License MIT -> see novelconv.py or  novelconv.js
  - Write Yokogaki/Tategaki
  - Color setting
  - Font size
  - Font
  - index menu
  - keep setting
*/

let _mode = 0;   // yoko
let _fontelm = null;
let css_path = 'assets/css';
let js_path = 'assets/js';
let apimode = 'cgi';
let titleelm;

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
/*
    menuelm.innerHTML ='\
    <input type="button" id="tateyoko" class="switchbutton button" onClick="changestyle()" value="縦横"> \
    <input type="button" id="fontmenu" class="fontbutton button" onClick="switchFontMenu()" value="Aあ"> \
    <input type="button" id="indexmenu" class="menubutton button" onClick="switchMenu()" value="目次">'
*/
    const tateyokoelm = document.createElement("a");
    tateyokoelm.id = "tateyoko";
    tateyokoelm.innerHTML ="縦横";
    tateyokoelm.classList.add("switchbutton");
    tateyokoelm.classList.add("button");

    const fontmenuelm = document.createElement("a");
    fontmenuelm.id = "fontmenu";
    fontmenuelm.innerHTML = "Aあ";
    fontmenuelm.classList.add ("button");

    const indexmenuelm = document.createElement("a");
    indexmenuelm.id = "indexmenu";
    indexmenuelm.innerHTML = "目次";
    indexmenuelm.classList.add("menubutton");
    indexmenuelm.classList.add("button");

    const fontelm = document.createElement("span");
    fontelm.id = 'font';
    fontelm.innerHTML= '\
    <span class="selector">\
    <select name="Color" class="ColorSelect" id="color" onchange="setColor()">\
    <option value="default" >カラー</option>\
    <option value="dark" background="black" color="white">ダークモード</option>\
    <option value="light">ホワイトモード</option>\
    <option value="cornsilk">デフォルト</option></select><BR>\
    <select name="Font" class="FontSelect" id="fontset" onchange="setFont()" ><option value="default">フォント</option>\
    <option value="serif">明朝</option>\
    <option value="sansserif">ゴシック</option></select><BR>\
    <select name="FontSize" class="SizeSelect" id="fontsize" onchange="setSize()"><option value="default">フォントサイズ</option>\
    <option value="XL">超大</option>\
    <option value="LL">特大</option>\
    <option value="L">大</option>\
    <option value="M">通常</option>\
    <option value="S">小</option></select></span>'
    _fontelm = fontelm;
    fontelm.style.display = 'none';
    const packelm = document.createElement("span");
    packelm.appendChild(fontmenuelm);
    packelm.append(fontelm);
    packelm.classList.add ("fontbutton");

    menuelm.append(tateyokoelm);
    menuelm.append(packelm);
    menuelm.append(indexmenuelm);

    tateyokoelm.addEventListener("click",() => {changestyle();});
    fontmenuelm.addEventListener("click",() => {switchFontMenu();});
    indexmenuelm.addEventListener("click",() => {switchMenu();});


    if (apimode == 'webview') {
        menuelm.innerHTML +='\
        <input type="button" id="reload" class="reloadbutton button" onClick="api_reload()" value="&#x1f504;"> \
        <input type="button" id="browse" class="browsebutton button" onClick="pywebview.api.open_file_dialog()" value="&#x1f4c1;">';
    }

    if (apimode == 'electron') {
        const reloadelm = document.createElement("a");
        reloadelm.id = "reload";
        reloadelm.innerHTML ="&#x1f504;";
        reloadelm.classList.add("reloadbutton");
        reloadelm.classList.add("button");

        const dialogelm = document.createElement("a");
        dialogelm.id = "dialog";
        dialogelm.innerHTML = "&#x1f4c1;";
        dialogelm.classList.add("browsebutton");
        dialogelm.classList.add("button");
        
        menuelm.appendChild(reloadelm);
        menuelm.appendChild(dialogelm);
        const { ipcRenderer } = require('electron');
        ipcRenderer.on('title', (event, arg) => {
            console.log("title");
            const elm = titleelm;
            elm.innerText = arg;
        });
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
            let filenames = dialog.showOpenDialogSync({
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

    titleelm = document.createElement("span");
    titleelm.id = 'header-title';
    headerelm.appendChild(titleelm);

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
    const el = document.getElementById(id);
    const before = getScrollPos(el);
    let css = document.getElementById('viewer-css');
    css.href=(css_path + "/viewer-tate.css");
    setTimeout(function (){
        const after = getScrollPos(el);
        const offset = calcScrollPos(before,after,true);
        console.log(before);
        console.log(after);
        console.log(offset);
        el.scrollLeft = offset;
    },100); 

    _mode = 1;
    setSetting();
}

function changeYoko(id){
    const el =  document.getElementById(id);
    const before = getScrollPos(el);
    let css = document.getElementById('viewer-css');
    css.href=(css_path + "/viewer.css");
    setTimeout(function (){
        const after = getScrollPos(el);
        const offset = calcScrollPos(before,after,false);
        console.log(before);
        console.log(after);
        console.log(offset);
        el.scrollTop = offset;
    },100); 

    _mode = 0;
    setSetting();
}

function getScrollPos(el){
    return {
        scrollTop: el.scrollTop,
        scrollLeft: el.scrollLeft,
        scrollWidth: el.scrollWidth,
        scrollHeight: el.scrollHeight,
        clientWidth: el.clientWidth
    }
}

function calcScrollPos(before,after,mode){
    let offset;
    if(mode) {
        // left
        offset =  after.scrollWidth - (before.scrollTop /  before.scrollHeight * after.scrollWidth) - before.clientWidth;
    } else { 
        //top
        offset =  (before.scrollWidth - before.scrollLeft - before.clientWidth) * after.scrollHeight / before.scrollWidth ;
    }
    return offset;
}

function setColor(){
    const mode = document.getElementById('color').value;
    if(mode !== 'default') setColorSet(mode);
}

function setFont(){
    const mode = document.getElementById('fontset').value;
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
        changeTate("body");
    } else {            //switch yoko
        changeYoko("body");
    }
}

menumode = false;

function switchFontMenu(){
    let elm = _fontelm;
    if(elm.style.display != 'none'){
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
