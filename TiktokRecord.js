const RecordToSheet = (ss, tasks) => {
	const resultSheetName = getResultSheetName("TikTok");
	const resultSheet = ss.insertSheet(resultSheetName);
	const headers = [
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
		"Bio 링크",
		"Instagram",
		"X",
		"YouTube Channel"
	];
	const allRows = [headers];

	tasks.forEach(task => {
		if (task.keywordResult?.data?.length) {
			task.keywordResult.data.forEach(post => {
				const { aweme_info } = post;
				const uniqueId = aweme_info?.author?.unique_id || "";
				const tiktokHyperlink = uniqueId
					? `=HYPERLINK("https://www.tiktok.com/@${uniqueId}", "${uniqueId}")`
					: "";
		
				const shareUrl = aweme_info?.share_url || "";
				const followerCount = aweme_info?.author?.follower_count || "";
				const playCount = aweme_info?.statistics?.play_count || "";
				const diggCount = aweme_info?.statistics?.digg_count || "";
				const collectCount = aweme_info?.statistics?.collect_count || "";
				const createTime = aweme_info?.create_time
					? new Date(aweme_info.create_time * 1000).toISOString().split("T")[0]
					: "";
	  
				let userRegion = "",
					userBio = "",
					userInstagram = "",
					userX = "",
					userYouTubeChannel = "",
					userbioLink = "";
				if (post.userInfo?.data?.user) {
					const {
						region = "",
						signature = "",
						ins_id = "",
						twitter_name = "",
						youtube_channel_title = "",
						bioLink = ""
					} = post.userInfo.data.user;

					if (Array.isArray(bioLink)) {
						userbioLink = bioLink.map(item => item.link).join("\n");
					} else if (typeof bioLink === "object" && bioLink !== null && bioLink.link) {
						userbioLink = bioLink.link;
					} else {
						userbioLink = bioLink;
					}
					userRegion = region;
					userBio = signature;
					userInstagram = ins_id;
					userX = twitter_name;
					userYouTubeChannel = youtube_channel_title;
				}
	  
				const instaHyperlink = userInstagram
					? `=HYPERLINK("https://www.instagram.com/${userInstagram}", "${userInstagram}")`
					: "";
				const xHyperlink = userX
					? `=HYPERLINK("https://x.com/${userX}", "${userX}")`
					: "";
	  
				allRows.push([
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
					userbioLink,
					instaHyperlink,
					xHyperlink,
					userYouTubeChannel
				]);
			});
		} else {
		  allRows.push([task.country, task.keyword, "데이터 없음"]);
		}
	});

	resultSheet.getRange(1, 1, allRows.length, allRows[0].length).setValues(allRows);
};