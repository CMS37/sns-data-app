const path = require("path");
const dotenv = require("dotenv");

const { app, BrowserWindow, ipcMain } = require("electron");
const os = require("os");
const { EDClient } = require("ensembledata");
const ExcelJS = require("exceljs");
const { dialog } = require("electron");

// .env 파일 로드 패키징환경에선 강제로 리소스path에서 꺼내오기

// const envPath = path.join(process.resourcesPath, ".env");

const envPath = process.env.NODE_ENV === "production"
  ? path.join(process.resourcesPath, ".env")
  : path.join(__dirname, ".env");

dotenv.config({ path: envPath });

let win;

app.whenReady().then(() => {
	win = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
		},
	});

	win.loadFile("index.html");
});

const client = new EDClient({ token: process.env.API_TOKEN });

// 엑셀 파일 열기
ipcMain.handle("open-excel-dialog", async (_) => {
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
ipcMain.handle("fetch-data", async (_, sns, selectedKeywords, selectedCountries, period, sorting, matchExactly) => {
	console.log("Data for:", sns);
	console.log("Selected Keywords:", selectedKeywords);
	console.log("Selected Countries:", selectedCountries);
	console.log("Period:", period);
	console.log("Sorting:", sorting);
	console.log("Match Exactly:", matchExactly);

	switch (sns) {
		case "TikTok":
			const { saveTiktokData } = require("./tiktok.js");
			return saveTiktokData(client, selectedKeywords, selectedCountries, period, sorting, matchExactly);
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
		{ header: "다운로드 수", key: "download_count", width: 15 },
		{ header: "생성시간", key: "create_time", width: 25 },
		{ header: "유저 나라", key: "userRegion", width: 15 },
		{ header: "유저 소개글", key: "userBio", width: 30 },
		{ header: "Instagram ID", key: "userInstagram", width: 20 },
		{ header: "Twitter ID", key: "userTwitterID", width: 20 },
		{ header: "Twitter Nickname", key: "userTwitterNickname", width: 20 },
		{ header: "YouTube ID", key: "userYouTubeID", width: 20 },
		{ header: "YouTube Channel", key: "userYouTubeChannel", width: 20 },

	];

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
					download_count: item.aweme_info.statistics.download_count,
					create_time: formattedTime,
					userRegion: item.userInfo.region,
					userBio: item.userInfo.signature,
					userInstagram: item.userInfo.ins_id,
					userTwitterID: item.userInfo.twitter_id,
					userTwitterNickname: item.userInfo.twitter_name,
					userYouTubeID: item.userInfo.youtube_channel_id,
					userYouTubeChannel: item.userInfo.youtube_channel_title
				});
				consloe.log("User Region: ", item.userInfo.region);
				console.log("User Bio: ", item.userInfo.signature);
				console.log("User Instagram: ", item.userInfo.ins_id);
				console.log("User Twitter ID: ", item.userInfo.twitter_id);
				console.log("User Twitter Nickname: ", item.userInfo.twitter_name);
				console.log("User YouTube ID: ", item.userInfo.youtube_channel_id);
				console.log("User YouTube Channel: ", item.userInfo.youtube_channel_title);

			});
		}
	});

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