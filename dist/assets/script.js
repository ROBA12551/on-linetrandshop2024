
const soundList = document.getElementById("soundList");
const searchInput = document.getElementById("searchInput");
const fileInput = document.getElementById("fileInput");
const uploadButton = document.getElementById("uploadButton");
const uploadedList = document.createElement("div"); // アップロードされた音声リスト
uploadedList.id = "uploadedList";
uploadButton.parentElement.appendChild(uploadedList);

let sounds = [];
let sortBy = "newest";
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1331713179562152040/40Ezrf31Bw5p1ZPUuVGFTSq-hFIv3z0XpgD10qpXH2wpEGt9re0xERG-noGVO7uGW8va";

// サウンドリストをサーバーから取得する関数
async function fetchSounds() {
    try {
      const response = await fetch("/upload-sounds");
      if (!response.ok) {
        throw new Error("Failed to fetch sound files.");
      }
      const files = await response.json();
      sounds = files
        .filter(file => ["wav", "mp3", "flm", "zip"].includes(file.split(".").pop().toLowerCase()))
        .map((file, index) => ({ id: index + 1, file }));
      displaySounds();
    } catch (error) {
      console.error("Error fetching sound files:", error);
    }
  }
  

// 音声リストを表示する関数
function displaySounds(filter = "") {
    soundList.innerHTML = "";

    let filteredSounds = sounds.filter(sound => sound.file.includes(filter));
    if (sortBy === "newest") {
        filteredSounds.sort((a, b) => a.file.localeCompare(b.file));
    } else if (sortBy === "oldest") {
        filteredSounds.sort((a, b) => b.file.localeCompare(a.file));
    }

    filteredSounds.forEach(sound => {
        const soundItem = document.createElement("div");
        soundItem.className = "sound-item";
        soundItem.innerHTML = `
            <h3>${sound.file}</h3>
            ${isAudioFile(sound.file) ? `<audio controls><source src="allsound/${sound.file}" type="audio/${getFileType(sound.file)}">Your browser does not support the audio element.</audio>` : ""}
            <button onclick="downloadSound('${sound.file}')">Download</button>
        `;
        soundList.appendChild(soundItem);
    });
}

// ダウンロード処理
function downloadSound(fileName) {
    fetch(`allsound/${fileName}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.blob();
        })
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });
}

// ファイルタイプを取得する関数
function getFileType(fileName) {
    const extension = fileName.split(".").pop().toLowerCase();
    return extension === "mp3" ? "mpeg" : extension;
}

// オーディオファイルかを判定する関数
function isAudioFile(fileName) {
    const extension = fileName.split(".").pop().toLowerCase();
    return ["wav", "mp3"].includes(extension);
}

// Discordへファイルを送信する関数
function sendToDiscord(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("payload_json", JSON.stringify({
        content: "New sound uploaded for review:",
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        label: "Approve",
                        style: 3, // Green button
                        custom_id: `approve_${file.name}`
                    },
                    {
                        type: 2,
                        label: "Reject",
                        style: 4, // Red button
                        custom_id: `reject_${file.name}`
                    }
                ]
            }
        ]
    }));

    fetch(DISCORD_WEBHOOK_URL, {
        method: "POST",
        body: formData
    }).then(response => {
        if (response.ok) {
            alert("File sent for review. Please wait for approval.");
            addUploadedFile(file.name); // アップロードしたファイル名をリストに追加
        } else {
            alert("Failed to send file for review.");
        }
    }).catch(error => {
        console.error("Error sending file to Discord:", error);
    });
}

// アップロードされたファイルをリストに追加
function addUploadedFile(fileName) {
    const fileItem = document.createElement("div");
    fileItem.textContent = fileName;
    fileItem.className = "uploaded-item";
    uploadedList.appendChild(fileItem);
}

// アップロードボタンのクリックイベント
uploadButton.addEventListener("click", () => {
    const file = fileInput.files[0];
    if (!file) {
        alert("Please select a file to upload.");
        return;
    }

    if (file.size > 5 * 60 * 1024 * 1024) {
        alert("File must be less than 5 minutes in size.");
        return;
    }

    sendToDiscord(file);
});

// 検索ボックスの入力イベント
searchInput.addEventListener("input", (e) => {
    displaySounds(e.target.value);
});

// 初期表示
fetchSounds();
