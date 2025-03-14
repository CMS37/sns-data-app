require("dotenv").config();

const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const os = require("os");
const { EDClient } = require("ensembledata");  // <-- ensembledata도 require
const ExcelJS = require("exceljs");
const { dialog } = require("electron");
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

// 엑셀 파일 열기
ipcMain.handle("open-excel-dialog", async (_, fileType) => {
	const title = "키워드 엑셀 파일 선택";
	const result = await dialog.showOpenDialog({
		title: title,
		properties: ['openFile'],
		filters: [{ name: 'Excel Files', extensions: ['xlsx', 'xls'] }]
	});
	if (result.canceled || result.filePaths.length === 0) {
		return null;
	}
	return result.filePaths[0];
});

// 엑셀 파일 데이터 로드
ipcMain.handle("load-excel-data", async (_, filePath) => {
	try {
		const workbook = new ExcelJS.Workbook();
		await workbook.xlsx.readFile(filePath);
		const worksheet = workbook.getWorksheet(1);
		const data = [];
		worksheet.eachRow({ includeEmpty: false }, (row) => {
			data.push(row.getCell(1).value);
		});

		return data;
	} catch (error) {
		console.error("엑셀 데이터 로드 에러:", error);
		return [];
	}
});

// SNS 데이터 가져오기 요청 처리
ipcMain.handle("fetch-data", async (_, sns, selectedKeywords, selectedCountries) => {
	console.log("Data for:", sns);
	console.log("Selected Keywords:", selectedKeywords);
	console.log("Selected Countries:", selectedCountries);

	switch (sns) {
		case "TikTok":
			const { saveTiktokData } = require("./tiktok.js");
			return saveTiktokData(client, selectedKeywords, selectedCountries);
		case "Twitter":
			return { error: "Twitter는 현재 미구현입니다." };
		case "YouTube":
			return { error: "YouTube는 현재 미구현입니다." };
		default:
			return { error: "지원하지 않는 SNS입니다." };
	}
});

// Excel 저장 기능
ipcMain.handle("save-excel", async (_, data, sns) => {
		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet("Data");

		worksheet.columns = [
				{ header: "국가", key: "country", width: 15 },
				{ header: "키워드", key: "keyword", width: 15 },
				{ header: "URL", key: "url", width: 25 },
				{ header: "닉네임", key: "nickname", width: 20 },
				{ header: "팔로워수", key: "followerCount", width: 15 },
				{ header: "게시물 링크", key: "share_url", width: 30 },
				{ header: "재생수", key: "play_count", width: 15 },
				{ header: "좋아요수", key: "digg_count", width: 15 },
				{ header: "생성시간", key: "create_time", width: 25 }
		];
		console.log("Data:", data);
		data.forEach(record => {
				if (Array.isArray(record.data)) {
						record.data.forEach(item => {
				const formattedTime = new Date(item.aweme_info.create_time * 1000).toISOString().split('T')[0];

								worksheet.addRow({
										country: record.country,
										keyword: record.keyword,
										url: "https://www.tiktok.com/@" + item.aweme_info.author.unique_id,
										nickname: item.aweme_info.author.nickname,
										followerCount: item.aweme_info.author.follower_count,
										share_url: item.aweme_info.share_info.share_url,
										play_count: item.aweme_info.statistics.play_count,
										digg_count: item.aweme_info.statistics.digg_count,
										create_time: formattedTime
								});
						});
				}
		});

		// 파일 저장 경로 및 파일명 설정
		const saveResult = await dialog.showSaveDialog({
				title: "엑셀 파일 저장",
				defaultPath: path.join(os.homedir(), "Desktop", `${sns}_data.xlsx`),
				filters: [{ name: "Excel Files", extensions: ["xlsx"] }]
		});
		
		if (saveResult.canceled || !saveResult.filePath) {
				return "저장이 취소되었습니다.";
		}
		
		await workbook.xlsx.writeFile(saveResult.filePath);
		return `파일 저장 완료: ${saveResult.filePath}`;
});