require("dotenv").config();

const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const os = require("os");
const { EDClient } = require("ensembledata");  // <-- ensembledata도 require
const ExcelJS = require("exceljs");
const { error } = require("console");


// 프로그램 창 설정
let win;

app.whenReady().then(() => {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true, //api 사용 가능
            contextIsolation: false, //
        },
    });

    win.loadFile("index.html");
});

const client = new EDClient({ token: process.env.API_TOKEN });

// SNS 데이터 가져오기 요청 처리
ipcMain.handle("fetch-data", async (_, sns) => {
    console.log("Data for : ", sns);

    switch (sns) {
        case "TikTok":
            const { saveTiktokData } = require("./tiktok.js");
            console.log("load data? ====", saveTiktokData);
            return saveTiktokData(client);
        case "Twitter":
            return { error: "Twitter는 현재 미구현입니다."};
        case "YouTube":
            return { error: "YouTube는 현재 미구현입니다."};
        default:
            return { error: "지원하지 않는 SNS입니다."};
    }
});

// Excel 저장 기능
ipcMain.handle("save-excel", async (_, data, sns) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Data");

    worksheet.columns = Object.keys(data[0]).map(key => ({
        header: key,
        key: key,
        width: 20,
    }));

    data.forEach(item => worksheet.addRow(item));

    //파일 저장 경로 및 파일명 설정
    const filePath = path.join(os.homedir(), "Desktop", `${sns}_data.xlsx`);
    await workbook.xlsx.writeFile(filePath);

    return `파일 저장 완료: ${filePath}`;
});

/*

*/