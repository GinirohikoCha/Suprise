// const host = "http://localhost:22364/";
const funcBtnCount = 1; // 功能按键数量

var lotteryConfig; // 配置文件JSONObject
// 绑定
$(document).ready(function() {
    $('.tooltipped').tooltip();
    // 空出功能按键位置
    $(window).resize(function() {
        $(".title-dragable").width($(window).width()-50*funcBtnCount);
    });

    // 关闭按钮
    $(".btn-func-close").click(function() {
        $.get(host+"close", null);
    });

    $(".clickable-item").click(function() {
        $(this).toggleClass("active");
        $(this).toggleClass("clickable-anim");
        $(this).siblings(".collection-item").removeClass("active");
        $(this).siblings(".collection-item").addClass("clickable-anim");
    });

    initConfigListener();

    // 读取本地配置文件
    $.get(host+"config", function(data, status){
        lotteryConfig = JSON.parse(data);

        init();
    });

    $(".lottery-start").click(function() {
        if (isLotterying) {
            if (isMutiLottery) {
                $("#muti-lottery-times-label").text("输入连抽数量");
            } else {
                stopLottery();
            }
            $(this).text("开 始");
        } else {
            if (isMutiLottery) {
                var lotteryNum = $("#muti-lottery-times").val();
                if (isNaN(lotteryNum) || lotteryNum <= 0)
                    return; // TODO
                lotteryNum = Math.ceil(lotteryNum);
                $("#muti-lottery-times").val(lotteryNum)
                if (lotteryNum > tempItemsArray.length)
                    return; // TODO
                $("#muti-lottery-times-label").text("剩余数量");
                startLottery(lotteryNum);
            } else {
                startLottery(1);
            }
            $(this).text("中 止");
        }
    });

    $("input[name='muti-lottery']").change(function() {
        isMutiLottery = this.checked;
        if (this.checked) {
            $(".muti-lottery").animate({width:"300px"});
            $(".lottery").animate({marginLeft:"150px"});
        } else {
            $(".muti-lottery").animate({width:"0px"});
            $(".lottery").animate({marginLeft:"0px"});
        }
    });

    $("#reset-data").click(function() {
        $("#muti-display-field").html("");
        tempItemsArray = itemsArray.concat();
    });
});

// 配置文件初始化
function init() {
    // 抽奖音效开关
    $("input[name='au-start']").prop("checked", lotteryConfig["audio-start"]==="true");
    enableStartAudio(lotteryConfig["audio-start"]==="true");
    // 抽奖结束音效开关
    $("input[name='au-end']").prop("checked", lotteryConfig["audio-end"]==="true");
    enableEndAudio(lotteryConfig["audio-end"]==="true");
    // 流光背景开光lotteryConfig
    $("input[name='glf']").prop("checked", lotteryConfig["fluid"]==="true");
    enableWebGLFluid(lotteryConfig["fluid"]==="true");
    if (lotteryConfig["fluid"]==="true")
        startWebGLFluid();
    // 流光背景设置开关
    $("input[name='glf-st']").prop("checked", lotteryConfig["fluid-settings"]==="true");
    if (lotteryConfig["fluid-settings"]==="true") {
        startGUI();
    }

    if (lotteryConfig["fluid"]!=="true") {
        $("input[name='glf-st']").attr("disabled", "disabled");
        $("input[name='glf-st']").prop("checked", false);
    }

    // 获取之前选择的文件
    $.get(host+"file?url=./temp.txt", function(data, status){
        if (data === null || data === undefined || data === "")
            return;

        operateLotteryFileString(data);
        displayCurrentFileName(lotteryConfig["lottery-file-name"]);
    });
}
// 配置文件监听初始化
function initConfigListener() {
    // 开关设置页面
    $(".cha-btn-settings").click(function() {
        $(".cha-settings-main").slideToggle();
    });

    $("#lottery-file").change(function() {
        var file = event.target.files[0];
        loadLotteryFile(file);
        lotteryConfig["lottery-file-name"] = file.name;
        $.post(host+"config", lotteryConfig, function(data, status){
            // TODO
        });
    });
    // 处理文件拖放
    $("#lottery-file-dropbox").bind('dragover', function(e) {e.preventDefault();});
    $("#lottery-file-dropbox").bind('drop', function(e) {
        var file = e.originalEvent.dataTransfer.files[0];
        loadLotteryFile(file);
        lotteryConfig["lottery-file-name"] = file.name;
        $.post(host+"config", lotteryConfig, function(data, status){
            // TODO
        });
    });

    // 最大限度的支持即时生效,实在无法实现的重启后生效
    // 开关设置页面开关
    $("input[name='au-start']").change(function() {
        if (!this.checked)
            stopStartAudio();
        lotteryConfig["audio-start"] = this.checked;
        enableStartAudio(this.checked);
    });

    $("input[name='au-end']").change(function() {
        lotteryConfig["audio-end"] = this.checked;
        enableEndAudio(this.checked);
    });
    $("input[name='glf']").change(function() {
        lotteryConfig["fluid"] = this.checked;
        if (this.checked) {
            $("input[name='glf-st']").removeAttr("disabled");
            startWebGLFluid();
            enableWebGLFluid(true);
        } else {
            lotteryConfig["fluid-settings"] = false;
            $("input[name='glf-st']").attr("disabled", "disabled");
            $("input[name='glf-st']").prop("checked", false);
            stopGUI();
        }
    });

    $("input[name='glf-st']").change(function() {
        lotteryConfig["fluid-settings"] = this.checked;
        if (this.checked) {
            startGUI();
        } else {
            stopGUI();
        }
    });

    $(".btn-st-confirm").click(function() {
        $.post(host+"config", lotteryConfig, function(data, status){
            // TODO
        });
    });
}
