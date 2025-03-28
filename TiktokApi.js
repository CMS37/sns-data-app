function buildKeywordUrl(country, keyword, period, sorting, matchExactly, token) {
	var root = "https://ensembledata.com/apis";
	var endpoint = "/tt/keyword/full-search";
	
	var params = {
		"name": keyword,
		"period": String(period),
		"sorting": String(sorting),
		"country": country.toLowerCase(),
		"match_exactly": matchExactly,
		"token": token
	};
	
	var queryString = Object.keys(params)
		.map(function(key) {
			return encodeURIComponent(key) + "=" + encodeURIComponent(params[key]);
		}).join("&");
	  
	return root + endpoint + "?" + queryString;
}

function buildUserInfoUrl(secUid, token) {
	var root = "https://ensembledata.com/apis";
	var endpoint = "/tt/user/info-from-secuid";
	
	var params = {
		"secUid": secUid,
		"alternative_method": false,
		"token": token
	};
	
	var queryString = Object.keys(params)
		.map(function(key) {
			return encodeURIComponent(key) + "=" + encodeURIComponent(params[key]);
		}).join("&");
	  
	return root + endpoint + "?" + queryString;
}

function fetchAllKeywordData(tasks, period, sorting, matchExactly, token) {
	tasks.forEach(function(task) {
		task.url = buildKeywordUrl(task.country, task.keyword, period, sorting, matchExactly, token);
	});


	Log("총 " + tasks.length + "개의 키워드 API 요청 시작");
	var urls = tasks.map(function(task) { return task.url; });
	var responses = UrlFetchApp.fetchAll(urls);
	
	for (var i = 0; i < responses.length; i++) {
		try {
			var json = JSON.parse(responses[i].getContentText());

			tasks[i].keywordResult = json;
			if (json.data && json.data.length > 0 && json.data[0].aweme_info &&
				json.data[0].aweme_info.author && json.data[0].aweme_info.author.sec_uid) {
				tasks[i].secUid = json.data[0].aweme_info.author.sec_uid;
			}
		} catch (e) {
			tasks[i].keywordResult = { error: e.toString() };
		}
	}

	return tasks;
}

function fetchAllUserData(tasks, token) {
	var userTasks = [];

	tasks.forEach(function(task, index) {
		if (task.secUid) {
			var userUrl = buildUserInfoUrl(task.secUid, token);

			userTasks.push({ index: index, url: userUrl });
		}
	});
	
	if (userTasks.length === 0) {
	  return tasks;
	}

	Log("총 " + userTasks.length + "개의 유저 API 요청 시작"); //1개라고뜸 이부분 나중에 확인 필요
	var userUrls = userTasks.map(function(task) { return task.url; });
	var responses = UrlFetchApp.fetchAll(userUrls);
	
	for (var j = 0; j < responses.length; j++) {
		var idx = userTasks[j].index;
		try {
			var userJson = JSON.parse(responses[j].getContentText());
			tasks[idx].userInfo = userJson;
		} catch (e) {
			tasks[idx].userInfo = { error: e.toString() };
		}
	}

	return tasks;
}
