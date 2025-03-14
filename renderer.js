const { ipcRenderer } = require("electron");
const countryMapping = require("./country_mapping.json");

let keywordlist = [];
let selectedSNS = null;


// SNS 선택 버튼
document.getElementById("sns-tiktok").addEventListener("click", () => {
	window.selectedSNS = "TikTok";
	transitionToFileSelection();
});

document.getElementById("sns-twitter").addEventListener("click", () => {
	window.selectedSNS = "Twitter";
	transitionToFileSelection();
});

document.getElementById("sns-youtube").addEventListener("click", () => {
	window.selectedSNS = "YouTube";
	transitionToFileSelection();
});

// 키워드 파일 선택 버튼
document.getElementById("select-keyword-btn").addEventListener("click", async () => {
	const filePath = await ipcRenderer.invoke("open-excel-dialog", "keyword");
	if (filePath) {
		document.getElementById("keyword-file-path").innerText = filePath;
		window.keywordFilePath = filePath;
	}
});

// 확인 버튼: 키워드 파일이 선택되었으면 해당 파일에서 키워드 목록을 불러오고, 다음 화면으로 전환
document.getElementById("confirm-keyword-btn").addEventListener("click", async () => {
	if (!window.keywordFilePath) {
		alert("키워드 파일을 선택해주세요.");
		return;
	}
	keywordList = await ipcRenderer.invoke("load-excel-data", window.keywordFilePath);
	document.getElementById("file-selection").style.display = "none";
	transitionToSelectionScreen();
});

// 선택 완료 버튼: 사용자가 입력한 키워드와 나라를 태그로 표시
document.getElementById("confirm-selection-btn").addEventListener("click", () => {
	const keywordValue = document.getElementById("keyword-input").value;
	const countryValue = document.getElementById("country-input").value;

	if (!keywordValue || !countryValue) {
		alert("키워드와 나라를 모두 입력해주세요.");
		return;
	}

	// 선택된 태그들을 표시할 영역에 태그 추가
	const tagsContainer = document.getElementById("selected-tags");
	tagsContainer.innerHTML = ""; // 이전 태그 지우기

	const keywordTag = document.createElement("span");
	keywordTag.innerText = keywordValue;
	keywordTag.classList.add("tag");

	const countryTag = document.createElement("span");
	countryTag.innerText = countryValue;
	countryTag.classList.add("tag");

	tagsContainer.appendChild(keywordTag);
	tagsContainer.appendChild(countryTag);

	window.selectedKeyword = keywordValue;
	window.selectedCountry = countryValue;
});

function transitionToSelectionScreen() {
	const keywordInput = document.getElementById("keyword-input");
	const countryInput = document.getElementById("country-input");

	// 키워드 입력 필드에 Awesomplete 초기화 (엑셀 파일에서 불러온 키워드 목록 사용)
	new Awesomplete(keywordInput, {
		list: keywordList,
		minChars: 0,
		autoFirst: true
	});

	// 나라 입력 필드에 Awesomplete 초기화 (mapping.json의 나라 목록 사용)
	const countryList = Object.values(countryMapping).map(item => item.name);
	new Awesomplete(countryInput, {
		list: countryList,
		minChars: 0,
		autoFirst: true
	});

	// 선택 화면 보이기
	document.getElementById("selection-screen").style.display = "block";
}
//SNS선택후 파일선택 전환
function transitionToFileSelection() {
	document.getElementById("sns-selection").style.display = "none";
	document.getElementById("file-selection").style.display = "block";
}


async function fetchData(sns) {
	// 두 파일 경로가 모두 선택되었는지 확인
	if (!window.keywordFilePath || !window.countryFilePath) {
		document.getElementById("output").innerText = "키워드 파일과 나라 파일을 모두 선택해주세요.";
		return;
	}

	document.getElementById("output").innerText = `${sns} 데이터 가져오는 중...`;
	// 파일 경로를 함께 전달합니다.
	const data = await ipcRenderer.invoke("fetch-data", sns, window.keywordFilePath, window.countryFilePath);

	if (data.error) {
		document.getElementById("output").innerText = data.error;
	} else {
		document.getElementById("output").innerText = `${sns} 데이터 가져오기 완료 (${data.length} items)`;
		window.selectedData = data;
		window.selectedSNS = sns;
		document.getElementById("save-btn").style.display = "block";
	}
}

async function saveExcel() {
	const result = await ipcRenderer.invoke("save-excel", window.selectedData, window.selectedSNS);
	alert(result);
}
