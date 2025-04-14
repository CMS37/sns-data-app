const main = () => {
	const ss = SpreadsheetApp.getActiveSpreadsheet();

	const sheet = ss.getSheetByName("발송파일");
	const reportSheet = ss.getSheetByName("포스팅 자동체크");
	const tagSheet = ss.getSheetByName("키워드목록");


	if (!sheet) {
		throw new Error("발송파일 시트가 존재하지 않습니다.");
	}
	const lastRow = sheet.getLastRow();
	if (lastRow < 2) {
		throw new Error("발송파일 시트에 데이터가 없습니다.");
	}
	
	if (!reportSheet) {
		throw new Error("포스팅 자동체크 시트가 존재하지 않습니다.");
	}
	if (!tagSheet) {
		throw new Error("키워드목록 시트가 존재하지 않습니다.");
	}

	const urlRange = sheet.getRange(2, 8, lastRow - 1, 1).getValues();
	const usernames = [];

	Log("유저네임 추출 시작");
	urlRange.forEach(row => {
		const url = row[0];
		
		if (url) {
			const parts = url.split("@");
			if (parts.length > 1) {
				let username = parts[1].trim();
				if (username.indexOf("/") !== -1) {
					username = username.split("/")[0];
				}
				usernames.push({name: username});
			}
		}
	})
	Log("유저네임 추출 종료");

	Log("관련 태그 목록 추출 시작");
	const values = tagSheet.getRange(2, 1, tagSheet.getLastRow() - 1, 1).getValues();
	const tags = values.map(row => row[0] ? row[0].toString().trim().toLowerCase() : "").filter(tag => tag !== "");
	Log("추출 완료");

	Log("유저 게시글 API 요청 시작");
	fetchUserPosts(usernames,reportSheet, tags);
	Log("유저 게시글 API 요청 종료");
}