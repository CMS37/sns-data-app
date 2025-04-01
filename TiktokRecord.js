function RecordToSheet(ss, tasks) {
	var resultSheetName = getResultSheetName("TikTok");
	var resultSheet = ss.insertSheet(resultSheetName);
	var headers = [
	  "국가",
	  "키워드",
	  "틱톡아이디",
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
	
	tasks.forEach(function(task) {
		if (task.keywordResult && task.keywordResult.data && task.keywordResult.data.length > 0) {
			task.keywordResult.data.forEach(function(post) {
				var nickname = (post.aweme_info && post.aweme_info.author && post.aweme_info.author.nickname) || "";
				var uniqueId = (post.aweme_info && post.aweme_info.author && post.aweme_info.author.unique_id) || "";
				var tiktokHyperlink = uniqueId ? '=HYPERLINK("https://www.tiktok.com/@' + nickname + '", "' + uniqueId + '")' : nickname;
				
				var shareUrl = post.aweme_info.share_url;
				var followerCount = post.aweme_info.author.follower_count;
				var playCount = post.aweme_info.statistics.play_count;
				var diggCount = post.aweme_info.statistics.digg_count;
				var collectCount = post.aweme_info.statistics.collect_count;
				var createTime = post.aweme_info.create_time ?
					  new Date(post.aweme_info.create_time * 1000).toISOString().split("T")[0] : "";
				
				var userRegion = "";
				var userBio = "";
				var userInstagram = "";
				var userX = "";
				var userYouTubeChannel = "";
				if (post.userInfo && post.userInfo.data && post.userInfo.data.user) {
					var user = post.userInfo.data.user;
					userRegion = user.region || "";
					userBio = user.signature || "";
					userInstagram = user.ins_id || "";
					userX = user.twitter_name || "";
					userYouTubeChannel = user.youtube_channel_title || "";
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
			  });
			} else {
			  resultSheet.appendRow([task.country, task.keyword, "데이터 없음"]);
			}
		  });
}