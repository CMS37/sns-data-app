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
			if (json.data && json.data.length > 0) {
				json.data.forEach(function(post) {
					if (post.aweme_info && post.aweme_info.author && post.aweme_info.author.sec_uid) {
						post.secUid = post.aweme_info.author.sec_uid;
					}
				});
			}
			tasks[i].keywordResult = json;
		} catch (e) {
			tasks[i].keywordResult = { error: e.toString() };
		}
	}
	return tasks;
  }

function fetchAllUserData(tasks, token) {
	var secUidMap = {}; 

	tasks.forEach(function(task, taskIndex) {
		if (task.keywordResult && task.keywordResult.data && task.keywordResult.data.length > 0) {
			task.keywordResult.data.forEach(function(post, postIndex) {
				if (post.secUid) {
					if (!secUidMap[post.secUid]) {
						secUidMap[post.secUid] = [];
					}
					secUidMap[post.secUid].push({ taskIndex: taskIndex, postIndex: postIndex });
				}
			});
		}
	});

	var uniqueSecUids = Object.keys(secUidMap);
	if (uniqueSecUids.length === 0) {
		return tasks;
	}

	Log("총 " + uniqueSecUids.length + "개의 유저 API 요청 시작");

	var userUrls = uniqueSecUids.map(function(secUid) {
		return buildUserInfoUrl(secUid, token);
	});

	var responses = UrlFetchApp.fetchAll(userUrls);

	for (var i = 0; i < responses.length; i++) {
		var secUid = uniqueSecUids[i];
		try {
			var userJson = JSON.parse(responses[i].getContentText());
			secUidMap[secUid].forEach(function(ref) {
				tasks[ref.taskIndex].keywordResult.data[ref.postIndex].userInfo = userJson;
			});
		} catch (e) {
			secUidMap[secUid].forEach(function(ref) {
				tasks[ref.taskIndex].keywordResult.data[ref.postIndex].userInfo = { error: e.toString() };
			});
		}
	}

	return tasks;
}
