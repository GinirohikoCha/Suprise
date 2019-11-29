const host = "http://localhost:22364/";

var lotteryDisplay; // 抽奖展示框
var lotteryStartBtn; // 抽奖按钮
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
var isMutiLottery = false;

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
            $("#muti-lottery-times").val(times-1);
            var mutiStr = $("#muti-display-field").html()+tempItemsArray[displayItemIndex]+"<br />";
            $("#muti-display-field").html(mutiStr);
            tempItemsArray.splice(displayItemIndex, 1);
        }
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

// 彩蛋
var easterEgg = false;
var egging = -1;
var date = new Date();
var dateEgg = true; // 每次启动只执行一次
var ctLtn = ["曹婷", "曹 婷", "婷曹", "婷 曹", "曹婷曹", "婷曹婷", "曹曹曹", "婷婷婷", "曹婷曹婷曹"];

function processEasterEgg() {
    if (!easterEgg || isMutiLottery)
        return;

    if (date.getMonth()+1 == 9) {
        if (date.getDate() == 10)
            egging = 2;
    } else if(date.getMonth()+1 == 3) {
        if (date.getDate() == 8)
            egging = 3;
    } else {
        if (randomInt(0, 100) != 1) // 概率1%
            return;

        egging = 1;

        switchMutiLotteryStatus(true);
        tempItemsArray = ctLtn.concat();
    }
}
function endEasterEgg() {
    switch(egging) {
        case -1: return;
        case 1:
            tempItemsArray = itemsArray.concat();
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
    $(".lottery-current-file").text("当前选择文件: "+name);
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

/* SwitchGUIStatus */
function switchLotteryStatus(bool) {
    if (bool) {
        lotteryStartBtn.text("中 止");
    } else {
        lotteryStartBtn.text("开 始");
    }
}
function switchMutiLotteryStatus(bool) {
    if (bool) {
        $("#muti-lottery-times").attr("disabled", "disabled");
        $("input[name='muti-lottery']").attr("disabled", "disabled");
        $("#muti-lottery-times-label").text("剩余数量");
    } else {
        $("#muti-lottery-times").removeAttr("disabled");
        $("input[name='muti-lottery']").removeAttr("disabled");
        $("#muti-lottery-times-label").text("输入连抽数量");
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
