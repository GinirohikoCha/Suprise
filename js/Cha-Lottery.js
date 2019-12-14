const ChaLotteryConfig = {
    "host":"http://localhost:22364/",
    "lotteryDisplay":"#lottery-core",
    "lotteryStartBtn":".lottery-start",
    "lotteryCurrentFile":".lottery-current-file",
    "mutiLotteryTimes":"#muti-lottery-times", // 连抽次数输入框
    "mutiLotteryTimesLabel":"#muti-lottery-times-label",
    "mutiDisplayField":"#muti-display-field", // 连抽展示已抽出的名额
    "restDisplayField":"#rest-display-field", // 展示未被抽的名额
    "mutiLotterySwitch":"input[name='muti-lottery']",
    "lotteryAudioStartID":"lottery-audio-start",
    "lotteryAudioEndID":"lottery-audio-end"
};

var lotteryDisplay; // 抽奖展示框
var lotteryStartBtn; // 抽奖按钮
var mutiLotteryTimes;
var mutiLotteryTimesLabel;
var mutiLotterySwitch;
var mutiDisplayField;
var restDisplayField;

var itemsArray = new Array(); // 所有抽奖项数组,
var tempItemsArray = new Array(); // 供操作抽奖箱数组,使得连续抽奖中,删除项时不影响原来数组,以便回滚

$(document).ready(function() {
    lotteryDisplay = $(ChaLotteryConfig["lotteryDisplay"]);
    lotteryStartBtn = $(ChaLotteryConfig["lotteryStartBtn"]);
    mutiLotteryTimes = $(ChaLotteryConfig["mutiLotteryTimes"]);
    mutiLotteryTimesLabel = $(ChaLotteryConfig["mutiLotteryTimesLabel"]);
    mutiLotterySwitch = $(ChaLotteryConfig["mutiLotterySwitch"]);
    mutiDisplayField = $(ChaLotteryConfig["mutiDisplayField"]);
    restDisplayField = $(ChaLotteryConfig["restDisplayField"]);

    initAudio();
});

// 从网页读取文件
function loadLotteryFile(file) {
    var reader = new FileReader();
    reader.onload = function() {
        operateLotteryFileString(this.result);
        // 保存到temp
        var data = {"data": this.result}
        $.post(ChaLotteryConfig["host"]+"file", data, null);
    };
    reader.readAsText(file, 'GBK');
    displayCurrentFileName(file.name);
}
// 以每行一个项目进行分割
function operateLotteryFileString(fileStr) {
    itemsArray = fileStr.split("\n");
    tempItemsArray = itemsArray.concat();
    setDisplayItem(0);
    refreshRestDisplayField();
}

var lotteryInterval;
var lotteryTimeout;
var displayItemIndex = 0; // 当前抽中项序号
var isLotterying = false;
var isMutiLottery = false;
var isRepeatable = false;

function startLottery(times) {
    if (tempItemsArray.length == 0 || (isLotterying && !isMutiLottery)) {
        M.toast({html: "状态错误 无法开始!", displayLength: 2000});
        return;
    }

    isLotterying = true;
    playStartAudio();
    processEasterEgg();

    var lotteryDelaySec = randomInt(3, 8);
    lotteryInterval = setInterval(function() {
        displayItemIndex = randomInt(0, tempItemsArray.length-1);
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

        if (isMutiLottery) {
            mutiLotteryTimes.val(times-1);

            var mutiStr = mutiDisplayField.html()+tempItemsArray[displayItemIndex]+"<br />";
            mutiDisplayField.html(mutiStr);
        }
        if (!isRepeatable)
            tempItemsArray.splice(displayItemIndex, 1);
        refreshRestDisplayField();
        if (times == 1) {
            isLotterying = false;
            switchLotteryStatus(false);
            if (isMutiLottery) {
                switchMutiLotteryStatus(false);
            } else {
                endEasterEgg();
            }
        } else {
            lotteryTimeout = setTimeout(function(){startLottery(times-1);}, 1500);
        }
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

function rollbackData() {
    tempItemsArray = itemsArray.concat();
}

function refreshRestDisplayField() {
    var restStr = "";
    for (var i=0; i<tempItemsArray.length; i++) {
        restStr += tempItemsArray[i] + "<br />";
    }
    restDisplayField.html(restStr);
}
// 音效
var audioStartEle;
var audioEndEle;
var isStartAudioEnable = false;
var isEndAudioEnable = false;
function initAudio() {
    audioStartEle = document.getElementById(ChaLotteryConfig["lotteryAudioStartID"]);
    audioEndEle = document.getElementById(ChaLotteryConfig["lotteryAudioEndID"]);
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

// 彩蛋
var easterEgg = false;
var egging = -1;
var date = new Date();
var dateEgg = true; // 每次启动只执行一次
var ctLtn = ["曹婷", "曹 婷", "婷曹", "婷 曹", "曹婷曹", "婷曹婷", "曹曹曹", "婷婷婷", "曹婷曹婷曹"];
var eggTemp;

function processEasterEgg() {
    if (!easterEgg || isMutiLottery)
        return;

    if (date.getMonth()+1 == 9) {
        if (date.getDate() == 10)
            egging = 2; // 9月10号
    } else if(date.getMonth()+1 == 3) {
        if (date.getDate() == 8)
            egging = 3; // 3月8号
    } else {
        if (randomInt(0, 100) != 1) // 概率1%
            return;

        egging = 1;

        switchMutiLotteryStatus(true);
        tempItemsArray = ctLtn.concat();
        eggTemp = tempItemsArray;
    }
}
function endEasterEgg() {
    switch(egging) {
        case -1: return;
        case 1:
            tempItemsArray = eggTemp;
            lotteryDisplay.text(tempItemsArray[randomInt(0, tempItemsArray.length-1)]);
            switchMutiLotteryStatus(false);
            break;
        case 2:
            if (!dateEgg)
                return;
            lotteryDisplay.text("祝曹老师教师节快乐!!!");
            lotteryStartBtn.text("朕知道了");
            dateEgg = false;
            break;
        case 3:
            if (!dateEgg)
                return;
            lotteryDisplay.text("祝曹老师妇女节快乐!!!");
            lotteryStartBtn.text("朕知道了");
            dateEgg = false;
            break;
    }
    egging = -1;
}
function enableEasterEgg(bool) {
    easterEgg = bool;
}
/* Setting */
$(document).ready(function() {});

function displayCurrentFileName(name) {
    $(ChaLotteryConfig["lotteryCurrentFile"]).text("当前选择文件: "+name);
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
function allowRepeat(bool) {
    isRepeatable = bool;
}
/* SwitchGUIStatus */
function switchLotteryStatus(bool) {
    if (bool) {
        lotteryStartBtn.text("中 止");
        mutiLotterySwitch.attr("disabled", "disabled");
    } else {
        lotteryStartBtn.text("开 始");
        mutiLotterySwitch.removeAttr("disabled");
    }
}
function switchMutiLotteryStatus(bool) {
    if (bool) {
        mutiLotteryTimes.attr("disabled", "disabled");
        mutiLotterySwitch.attr("disabled", "disabled");
        mutiLotteryTimesLabel.text("剩余数量");
    } else {
        mutiLotteryTimes.removeAttr("disabled");
        mutiLotterySwitch.removeAttr("disabled");
        mutiLotteryTimesLabel.text("输入连抽数量");
    }
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
