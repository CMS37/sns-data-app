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
			const json  = JSON.parse(response.getContentText());
			const postData = json.data || {};

			const viewCount = 0;
			const likeCount = postData.edge_media_preview_like.count || 0;
			const commentCount = postData.edge_media_to_comment.count || 0;
			const savedCount = 0;

			return {
				viewCount: viewCount,
				likeCount: likeCount,
				commentCount: commentCount,
				savedCount: savedCount
			};
		} catch (error) {
			Log(`게시물 정보 요청 에러: ${error.toString()}`);
			return {
				viewCount: 0,
				likeCount: 0,
				commentCount: 0,
				savedCount: 0,
				error: error.toString()
			};
		}
	});
	return tasks;
};
