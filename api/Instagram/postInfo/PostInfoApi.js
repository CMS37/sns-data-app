const buildInsPostUrl = (shortcode, token) => {
	const root = "https://ensembledata.com/apis";
	const endpoint = "/instagram/post/details";
	const params = {
	  code: shortcode,
	  n_comments_to_fetch: 0,
	  token: token
	};
	const queryString = Object.keys(params)
	  .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
	  .join("&");
	return `${root}${endpoint}?${queryString}`;
  };
  
  const fetchAllPostData = (shortcodes, token) => {
	Log(`Instagram 게시물 정보 요청: 총 ${shortcodes.length}개`);

	const urls = shortcodes.map(code => buildInsPostUrl(code, token));
	const responses = fetchAllInBatches(urls, 100, 500);

	const tasks = responses.map((response, index) => {
		try {
		  const json = JSON.parse(response.getContentText());
		  Log(`응답 전문 ${index + 1}: ${response.getContentText()}`);
		  const data = json.data || {};
		  const viewCount = data.is_video && data.video_view_count ? data.video_view_count : 0;
		  const likeCount = data.edge_media_preview_like &&
							typeof data.edge_media_preview_like.count === "number"
							? data.edge_media_preview_like.count
							: 0;
		  const commentCount = data.edge_media_to_comment &&
							   typeof data.edge_media_to_comment.count === "number"
							   ? data.edge_media_to_comment.count
							   : 0;
		  // 응답에 저장수(saved_count) 필드가 있을 경우 사용, 없으면 0 처리
		  const savedCount = data.saved_count || 0;
	
		  Log(`단축코드 ${shortcodes[index]}: API 호출 성공`);
	
		  return {
			shortcode: shortcodes[index],
			viewCount: viewCount,
			likeCount: likeCount,
			commentCount: commentCount,
			savedCount: savedCount
		  };
		} catch (error) {
		  Log(`단축코드 ${shortcodes[index]}: 응답 파싱 오류 - ${error.toString()}`);
		  return {
			shortcode: shortcodes[index],
			error: error.toString(),
			viewCount: 0,
			likeCount: 0,
			commentCount: 0,
			savedCount: 0
		  };
		}
	  });
	  return tasks;
	};