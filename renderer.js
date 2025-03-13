const { ipcRenderer } = require("electron");

async function selectFile(fileType) {
  const filePath = await ipcRenderer.invoke("open-excel-dialog", fileType);
  if (filePath) {
    document.getElementById(fileType + "-file-path").innerText = filePath;
    window[fileType + "FilePath"] = filePath;
  }
}

document.getElementById("select-keyword-btn").addEventListener("click", () => selectFile("keyword"));
document.getElementById("select-country-btn").addEventListener("click", () => selectFile("country"));

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
