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
            if (egging > 0)
                M.toast({html: "被魔法控制了!无法终止!", displayLength: 4000});
            if (isMutiLottery)
                switchMutiLotteryStatus(false);
            stopLottery();
            switchLotteryStatus(false);
        } else {
            if (isMutiLottery) {
                var lotteryNum = $("#muti-lottery-times").val();
                if (isNaN(lotteryNum) || lotteryNum <= 0) {
                    M.toast({html: "非有效数字!", displayLength: 2000});
                    return;
                }
                lotteryNum = Math.ceil(lotteryNum);
                $("#muti-lottery-times").val(lotteryNum)
                if (lotteryNum > tempItemsArray.length) {
                    M.toast({html: "数字大于剩余数量!", displayLength: 2000});
                    return;
                }
                switchMutiLotteryStatus(true);
                startLottery(lotteryNum);
            } else {
                startLottery(1);
            }
            switchLotteryStatus(true);
        }
    });

    $("input[name='muti-lottery']").change(function() {
        isMutiLottery = this.checked;
        if (this.checked) {
            $(".muti-lottery").animate({width:"300px"});
            $(".dark-cover-muti-lottery").animate({width:"300px"});
            $(".lottery").animate({marginLeft:"150px"});
        } else {
            $(".muti-lottery").animate({width:"0px"});
            $(".dark-cover-muti-lottery").animate({width:"0px"});
            $(".lottery").animate({marginLeft:"0px"});
        }
    });

    $("#reset-data").click(function() {
        if (isLotterying) {
            M.toast({html: "请先停止抽奖!", displayLength: 2000});
            return;
        }
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
    // 彩蛋
    $("input[name='easter-egg']").prop("checked", lotteryConfig["easter-egg"]==="true");
    if (lotteryConfig["easter-egg"]==="true") {
        enableEasterEgg(true);
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
        if (file.name.indexOf(".txt") == -1) {
            M.toast({html: "目前仅支持TXT文件!", displayLength: 2000});
            return;
        }
        loadLotteryFile(file);
        lotteryConfig["lottery-file-name"] = file.name;
        $.post(host+"config", lotteryConfig, function(data, status){
            if (status == "success")
                M.toast({html: "加载成功!", displayLength: 2000});
        });
    });
    // 处理文件拖放
    $("#lottery-file-dropbox").bind('dragover', function(e) {e.preventDefault();});
    $("#lottery-file-dropbox").bind('drop', function(e) {
        var file = e.originalEvent.dataTransfer.files[0];
        if (file.name.indexOf(".txt") == -1) {
            M.toast({html: "目前仅支持TXT文件!", displayLength: 2000});
            return;
        }
        loadLotteryFile(file);
        lotteryConfig["lottery-file-name"] = file.name;
        $.post(host+"config", lotteryConfig, function(data, status){
            if (status == "success")
                M.toast({html: "加载成功!", displayLength: 2000});
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

    $("input[name='easter-egg']").change(function() {
        if(!this.checked) {
            switch(randomInt(1, 4)) {
                case 1:
                    M.toast({html: "真的真的要关吗??"});break;
                case 2:
                    M.toast({html: "不要关啊啊啊啊!"});break;
                case 3:
                    M.toast({html: "你关不掉的!ಠ౪ಠ"});break;
                default:
                    M.toast({html: "窝窝头!一块钱四个!嘿嘿!"});break;
            }
            $(this).prop("checked", true);
        }
    });

    $(".btn-st-confirm").click(function() {
        $.post(host+"config", lotteryConfig, function(data, status){
            if (status == "success")
                M.toast({html: "保存成功!", displayLength: 2000});
        });
    });
}
