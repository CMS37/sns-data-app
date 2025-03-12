require("dotenv").config();

const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const os = require("os");
const { EDClient } = require("ensembledata");  // <-- ensembledata도 require
const ExcelJS = require("exceljs");


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
    console.log("fetch-data", sns);

    const result = await client.tiktok.fullKeywordSearch({
        keyword: "St. Ives",
        country: "US",
        period: 0, //주어진 기간보다 최근 게시물 = "0", "1", "7", "30", "90", "180" (일)
        sorting: 0, // 0: 관련성, 1: 좋아요순
        matchExactly: false, // 정확히 일치하는 게시물만 가져오기 (true/false)
    });

    if (result.error) {
        console.log("Error");
        return result.error;
    }
    console.log("Data Success");
    return result.data;
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
