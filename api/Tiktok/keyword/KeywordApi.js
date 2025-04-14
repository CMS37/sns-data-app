const buildKeywordUrl = (country, keyword, period, sorting, token) => {
	const root = "https://ensembledata.com/apis";
	const endpoint = "/tt/keyword/full-search";
	const params = {
		name: keyword,
		period: String(period),
		sorting: String(sorting),
		country: country.toLowerCase(),
		token
	};
	const queryString = Object.keys(params)
		.map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
		.join("&");
	return `${root}${endpoint}?${queryString}`;
};
  
const fetchAllKeywordData = (tasks, period, sorting, token) => {
	tasks.forEach(task => {
		task.url = buildKeywordUrl(task.country, task.keyword, period, sorting, token);
	});
  
	Log(`총 ${tasks.length}개의 키워드 API 요청 시작`);
	const urls = tasks.map(task => task.url);
	const responses = UrlFetchApp.fetchAll(urls);
  
	responses.forEach((response, i) => {
		try {
			const json = JSON.parse(response.getContentText());
			
			const postCount = Array.isArray(json.data) ? json.data.length : 0;
			Log(`Response ${i + 1}: 총 ${postCount}개의 게시물 응답`);

			tasks[i].keywordResult = json;
		} catch (e) {
			tasks[i].keywordResult = { error: e.toString() };
		}
	});
	return tasks;
};
