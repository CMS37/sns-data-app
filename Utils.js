function Log(message) {
	Logger.log(message);
}

function getResultSheetName() {
	var now = new Date();
	var formattedDate = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy-MM-dd HHmmss");

	return formattedDate + " Tiktok Data";
}