const host = "http://localhost:22364/";

var lotteryDisplay; // 抽奖展示框
var lotteryStartBtn;
var displayItemIndex = 0; // 当前抽中项序号

var itemsArray = new Array(); // 所有抽奖项数组,
var tempItemsArray = new Array(); // 供操作抽奖箱数组,使得连续抽奖中,删除项时不影响原来数组,以便回滚

$(document).ready(function() {
    lotteryDisplay = $("#lottery-core");
    lotteryStartBtn = $(".lottery-start");

    initAudio();
});

// 从网页读取文件
function loadLotteryFile(file) {
    var reader = new FileReader();
    reader.onload = function() {
        operateLotteryFileString(this.result);
        // 保存到temp
        var data = {"data": this.result}
        $.post(host+"file", data, function(data, status){
            // TODO
        });
    };
    reader.readAsText(file, 'GBK');
    displayCurrentFileName(file.name);
}
// 以每行一个项目进行分割
function operateLotteryFileString(fileStr) {
    itemsArray = fileStr.split("\n");
    tempItemsArray = itemsArray.concat();
    setDisplayItem(0);
}

var lotteryInterval;
var lotteryTimeout;
var isLotterying = false;

function startLottery() {
    if (tempItemsArray.length == 0 || isLotterying)
        return;
    isLotterying = true;
    playStartAudio();

    var lotteryDelaySec = randomInt(3, 8);
    lotteryInterval = setInterval(function() {
        displayItemIndex = randomInt(0, tempItemsArray.length);
        if (isWebGLFluidEnabled)
            splats(1);
        setDisplayItem(displayItemIndex);
    }, 50);
    lotteryTimeout = setTimeout(function(){
        stopStartAudio();
        window.clearInterval(lotteryInterval);
        if (isWebGLFluidEnabled)
            splats(parseInt(Math.random() * 20) + 5);
        playEndAudio();
        
        isLotterying = false;
        lotteryStartBtn.text("开 始");
    }, lotteryDelaySec*1000);
}

function stopLottery() {
    isLotterying = false;
    window.clearInterval(lotteryInterval);
    window.clearTimeout(lotteryTimeout);
    stopStartAudio();
}

function setDisplayItem(index) {
    lotteryDisplay.text(tempItemsArray[index]);
}

// 音效
var audioStartEle;
var audioEndEle;
var isStartAudioEnable = false;
var isEndAudioEnable = false;
function initAudio() {
    audioStartEle = document.getElementById("lottery-audio-start");
    audioEndEle = document.getElementById("lottery-audio-end");
    audioStartEle.load();
    audioEndEle.load();
}
function playStartAudio() {
    if (!isStartAudioEnable)
        return;
    audioStartEle.play();
}
function stopStartAudio() {
    audioStartEle.pause();
}
function playEndAudio() {
    if (!isEndAudioEnable)
        return;
    audioEndEle.play();
}

// 流光背景
var isWebGLFluidEnabled = false;
function splats(amount) {
    multipleSplats(amount);
}

/* Setting */
$(document).ready(function() {});

function displayCurrentFileName(name) {
    $("#lottery-current-file").show();
    $("#lottery-current-file").text("当前选择文件: "+name);
}

function enableStartAudio(bool) {
    isStartAudioEnable = bool;
}
function enableEndAudio(bool) {
    isEndAudioEnable = bool;
}
function enableWebGLFluid(bool) {
    isWebGLFluidEnabled = bool;
}

/*
 * 种子随机数生成
 */
var random = new Math.seedrandom(new Date().getTime());
//生成从minNum到maxNum的随机数
function randomInt(minNum, maxNum) {
    switch(arguments.length) {
        case 1:
            return parseInt(random()*minNum+1,10);
        case 2:
            return parseInt(random()*(maxNum-minNum+1)+minNum,10);
        default:
            return 0;
    }
}
