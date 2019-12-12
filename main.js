// Modules to control application life and create native browser window
const {app, BrowserWindow, Tray} = require('electron');
const path = require('path');
const iconv = require("iconv-lite");

const hostname = '127.0.0.1';
const port = 22364;
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow () {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 600,
        center: true,
        minWidth: 800,
        minHeight: 400,
        frame: false,
        show: false,
        maximizable: false,
        icon: './icon.png',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });
    // 让画面准备好了再显示
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // and load the index.html of the app.
    mainWindow.loadFile('index.html');

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
      mainWindow = null;
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) createWindow();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const service = express();
service.use(bodyParser.json()); // for parsing application/json
service.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

service.listen(port, function () {
    console.log("Service started");
});

service.get('/close', function(req, res) {
    mainWindow.close();
});
// 获取选择的文件
service.get('/file', function(req, res) {
    var filePath = req.query.url;
    fs.readFile(filePath, 'utf8', (err, data) => {
        // if (err) throw err;
        // res.send(iconv.decode(data, 'gbk'));
        res.send(data);
    });
});
// 保存文件副本
service.post('/file', function(req, res) {
    fs.writeFile('./temp.txt', req.body["data"], (err) => {
        if (err) throw err;
        console.log('File saved');
        res.send("");
    });
});
// 获取config
service.get('/config', function(req, res) {
    fs.readFile('./config.json', 'utf8', (err, data) => {
        // if (err) throw err;
        res.send(data);
    });
});
// 上传config
service.post('/config', function(req, res) {
    fs.writeFile('./config.json', JSON.stringify(req.body), (err) => {
        if (err) throw err;
        console.log('Config saved');
        res.send("");
    });
});
