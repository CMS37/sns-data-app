const { ipcRenderer } = require("electron");

async function fetchData(sns) {
    document.getElementById("output").innerText = `${sns} 데이터 가져오는 중...`;

    const data = await ipcRenderer.invoke("fetch-data", sns);

    if (data.error) {
        document.getElementById("output").innerText = data.error;
    } else {
        document.getElementById("output").innerText = `${sns} 데이터를 ${data.length}개 가져왔습니다.`;
        window.selectedData = data;
        window.selectedSNS = sns;
        document.getElementById("save-btn").style.display = "block";
    }
}

async function saveExcel() {
    const result = await ipcRenderer.invoke("save-excel", window.selectedData, window.selectedSNS);
    alert(result);
}
