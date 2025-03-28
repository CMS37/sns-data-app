function fetchTikTokDataParallel() {
	var ss = SpreadsheetApp.getActiveSpreadsheet();
	var sheet = ss.getActiveSheet();

	var token = PropertiesService.getScriptProperties().getProperty("API_TOKEN");

	if (!token) {
		throw new Error("Script Properties에 API_TOKEN 값이 설정되어 있지 않습니다.");
	}

	var period = sheet.getRange("C2").getValue();
	var sorting = sheet.getRange("D2").getValue();
	var matchExactly = sheet.getRange("E2").getValue();
	
	var lastRow = sheet.getLastRow();
	if (lastRow < 2) {
		SpreadsheetApp.getUi().alert("입력된 데이터가 없습니다.");
		return;
	}

	var data = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
	var tasks = [];
	
	for (var i = 0; i < data.length; i++) {
		var country = data[i][0];
		var keyword = data[i][1];

		if (!country || !keyword)
			continue;

		var url = buildTikTokApiUrl(country, keyword, period, sorting, matchExactly, token);

		tasks.push({ country: country, keyword: keyword, url: url });
	}

	if (tasks.length === 0) {
	  SpreadsheetApp.getUi().alert("유효한 나라/키워드 데이터가 없습니다.");
	  return;
	}

	testLog("총 " + tasks.length + "개의 요청을 처리합니다.");

	var urls = tasks.map(function(task) { return task.url; });
	var responses = UrlFetchApp.fetchAll(urls);

	var resultSheetName = new Date().toISOString().split('T')[0] + " Tiktok Data";
	var resultSheet = ss.insertSheet(resultSheetName);
	var headers = [
	  "국가",
	  "키워드",
	  "틱톡닉네임",
	  "게시물 링크",
	  "팔로워수",
	  "재생수",
	  "좋아요수",
	  "저장 수",
	  "생성시간",
	  "유저 국가",
	  "유저 소개글",
	  "Instagram",
	  "X",
	  "YouTube Channel"
	];
	resultSheet.appendRow(headers);

	for (var j = 0; j < responses.length; j++) {
		var task = tasks[j];

		try {
			var json = JSON.parse(responses[j].getContentText());

			if (json.data && json.data.length > 0) {
				var post = json.data[0];
				testLog("키워드: " + task.keyword);
				testLog("===데이터===\n" + JSON.stringify(post));

				var nickname = (post.aweme_info && post.aweme_info.author && post.aweme_info.author.nickname) || "";
				var uniqueId = (post.aweme_info && post.aweme_info.author && post.aweme_info.author.unique_id) || "";
				var tiktokHyperlink = uniqueId ? '=HYPERLINK("https://www.tiktok.com/@' + nickname + '", "' + nickname + '")' : nickname;

				var shareUrl = (post.aweme_info && post.aweme_info.share_url) || "";
				var followerCount = (post.aweme_info && post.aweme_info.author && post.aweme_info.author.follower_count) || "";
				var playCount = (post.aweme_info && post.aweme_info.statistics && post.aweme_info.statistics.play_count) || "";
				var diggCount = (post.aweme_info && post.aweme_info.statistics && post.aweme_info.statistics.digg_count) || "";
				var collectCount = (post.aweme_info && post.aweme_info.statistics && post.aweme_info.statistics.collect_count) || "";
				var createTime = (post.aweme_info && post.aweme_info.create_time) ? 
					new Date(post.aweme_info.create_time * 1000).toISOString().split("T")[0] : "";

				var userRegion = "";
				var userBio = "";
				var userInstagram = "";
				var userX = "";
				var userYouTubeChannel = "";


				var secUid = post.aweme_info && post.aweme_info.author && post.aweme_info.author.sec_uid;

				if (secUid) {
					var userJson = fetchUserInfoFromSecUid(secUid, token);
					if (!userJson.error && userJson.data && userJson.data.user) {
						var user = userJson.data.user;
						userRegion = user.region || "";
						userBio = user.signature || "";
						userInstagram = user.ins_id || "";
						userX = user.twitter_name || "";
						userYouTubeChannel = user.youtube_channel_title || "";
					}
				}

				var instaHyperlink = userInstagram ? '=HYPERLINK("https://www.instagram.com/' + userInstagram + '", "' + userInstagram + '")' : "";
				var xHyperlink = userX ? '=HYPERLINK("https://x.com/' + userX + '", "' + userX + '")' : "";
			
				resultSheet.appendRow([
					task.country,
					task.keyword,
					tiktokHyperlink,
					shareUrl,
					followerCount,
					playCount,
					diggCount,
					collectCount,
					createTime,
					userRegion,
					userBio,
					instaHyperlink,
					xHyperlink,
					userYouTubeChannel
				]);
			} else {
				resultSheet.appendRow([task.country, task.keyword, "데이터 없음"]);
			}
		} catch (error) {
			resultSheet.appendRow([task.country, task.keyword, "오류: " + error.toString()]);
		}
	}
}
  
function buildTikTokApiUrl(country, keyword, period, sorting, matchExactly, token) {
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
	
	var queryString = Object.keys(params).map(function(key) {
		return encodeURIComponent(key) + "=" + encodeURIComponent(params[key]);
	}).join("&");
	  
	return root + endpoint + "?" + queryString;
}
  
function fetchUserInfoFromSecUid(secUid, token) {
	var root = "https://ensembledata.com/apis";
	var endpoint = "/tt/user/info-from-secuid";
	
	var params = {
		"secUid": secUid,
		"alternative_method": false, // true로 설정하면 더 많은 정보를 가져올 수 있음?
		"token": token
	};
	
	var queryString = Object.keys(params).map(function(key) {
		return encodeURIComponent(key) + "=" + encodeURIComponent(params[key]);
	}).join("&");
	  
	var url = root + endpoint + "?" + queryString;
	
	try {
		var response = UrlFetchApp.fetch(url);
		var json = JSON.parse(response.getContentText());

		return json;
	} catch (error) {
		return { error: error.toString() };
	}
  }
  
function testLog(str) {
	Logger.log(str);
}