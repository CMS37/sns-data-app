function Log(message) {
	Logger.log(message);
}

function getResultSheetName(sns) {
	var now = new Date();
	var formattedDate = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy-MM-dd HHmmss");

	return formattedDate + " " + sns + " data";
}

function getRequiredProperty(key) {
	var value = PropertiesService.getScriptProperties().getProperty(key);

	if (!value)
		throw new Error(`스크립트 속성에 '${key}'가 없습니다.`);

	return value;
}

function fetchAllInBatches(urls, batchSize, delay) {
	var responses = [];

	for (var i = 0; i < urls.length; i += batchSize) {
		var batch = urls.slice(i, i + batchSize);

		responses = responses.concat(UrlFetchApp.fetchAll(batch));

		if (i + batchSize < urls.length) {
		Utilities.sleep(delay);
		}
	}
	return responses;
}