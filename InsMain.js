const updateInsPostInfoData = (sheet, tasks, originalUrls) => {
	const allRows = tasks.map((task, index) => {
		if (task.error) {
			return [
				originalUrls[index],
				task.error,
				0,
				0,
				0,
				0
			];
		}
		return [
			originalUrls[index],
			task.viewCount,
			task.playCount,
			task.likeCount,
			task.commentCount,
	  	];
	});

	sheet.getRange(2, 1, allRows.length, 5).setValues(allRows);
};

const InsMain = () => {
	try {
		Log("메인 시작");
		const sheetData = postData();
		Log("시트 데이터 수집 완료");
	
		const { token, urls, shortcodes, sheet } = sheetData;
		
		Log("게시물 정보 API 요청 시작");
		const InfoTasks = fetchAllPostData(shortcodes, token);
		Log("게시물 정보 API 요청 완료");
		
		Log("시트 업데이트 시작");
		updateInsPostInfoData(sheet, InfoTasks, urls);
		Log("시트 업데이트 완료");
		
	} catch (error) {
		Log("메인 에러: " + error.toString());
		throw new Error("메인 에러: " + error.toString());
	}
};
