const CLIENT_ID = "76f79bbdec904545b6ca0414c2c7368a";
const CLIENT_SECRET = "792d3d82903f4bb188b5dec3659b8ee1";

let mode = '다음 트랙'; 
let currentArtistID = null;
let currentTrackID = null;

const tabs = document.querySelectorAll(".song-tabs div");
const underLine = document.getElementById("under-line");
const nextTab = document.getElementById("next-tab");

// URL에서 trackID 가져오기
const params = new URLSearchParams(window.location.search);
const trackID = params.get("trackID");

window.addEventListener("load", async () => {
  requestAnimationFrame(() => moveUnderLine(nextTab)); // 언더라인 위치 설정

  if (trackID) {
    await fetchTrackInfo(trackID); // 트랙 정보 불러오기
  } else {
    console.error("trackID가 없습니다.");
  }

  // 새로고침 시 첫 번째 탭에 흰색 색상 적용
  tabs[0].style.color = "white";
});

// 화면 크기 조정 시 언더라인 재계산
window.addEventListener("resize", () => {
  const activeTab = document.querySelector(".song-tabs div[style*='color: white;']");
  if (activeTab) {
    moveUnderLine(activeTab);
  }
});

tabs.forEach((tab) => tab.addEventListener("click", switchTab));

function switchTab(event) {
  mode = event.target.innerText.trim();
  moveUnderLine(event.target);
  render();

  // 모든 탭의 색상을 초기화하고 클릭한 탭의 색상만 변경
  tabs.forEach((tab) => {
    tab.style.color = ""; // 초기 색상으로 되돌리기
  });

  event.target.style.color = "white"; // 클릭한 탭에 흰색 적용

  // '가사' 탭 클릭 시 트랙 ID가 설정되었는지 확인
  if (mode === '가사' && currentTrackID) {
    render();
  }
}

function moveUnderLine(target) {
  if (!target) return; // 타겟이 없을 경우 함수 종료

  underLine.style.left = target.offsetLeft + "px";
  underLine.style.width = target.offsetWidth + "px";
  underLine.style.top = (target.offsetTop + target.offsetHeight - 15) + "px"; // top 조정
}

// Spotify API 요청 처리
async function getAccessToken() {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + btoa(CLIENT_ID + ":" + CLIENT_SECRET),
    },
    body: "grant_type=client_credentials",
  });
  const data = await response.json();
  return data.access_token;
}

// 특정 트랙 정보 가져오기
const fetchTrackInfo = async (trackID) => {
  const token = await getAccessToken();
  const url = `https://api.spotify.com/v1/tracks/${trackID}`;

  const data = await fetchData(url, token);

  if (data) {
    displayTrackDetail(data); // 트랙 정보를 화면에 표시하는 함수 호출
    currentArtistID = data.artists[0].id; // 트랙의 아티스트 ID 저장
    fetchArtistTracks(currentArtistID); // 오른쪽 컨테이너에 관련 곡들 표시
  } else {
    console.error("트랙 정보를 가져올 수 없습니다.");
  }
};

// 트랙 정보를 화면에 표시
const displayTrackDetail = (track) => {
  document.querySelector('.song-main-img').src = track.album.images[0]?.url || "기본 이미지 URL";

  // 다운바에 곡 정보 표시
  const DownContainer = document.getElementById("downbarSongTmi");
  DownContainer.innerHTML = `
    <img class="song-sm-img song-main-img" src="${track.album.images[0]?.url}" alt="${track.name}">
    <div class="song-tmi_space">
      <div class="down_song_title">${track.name}</div>
      <div class="song-people">${track.artists.map(artist => artist.name).join(", ")}</div>
    </div>
  `;

  // 트랙 출처 정보 업데이트
  const trackSourceDiv = document.getElementById("trackSource");
  trackSourceDiv.textContent = track.album.label || "레이블 정보 없음";
};

const fetchArtistTracks = async (artistID) => {
  const token = await getAccessToken();
  const url = `https://api.spotify.com/v1/artists/${artistID}/top-tracks?market=KR`;

  const data = await fetchData(url, token);
  if (data.tracks?.length) {
    displayTracks(data.tracks);
  } else {
    console.error("해당 아티스트의 트랙을 찾을 수 없습니다.");
  }
};

const fetchData = async (url, token) => {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return await response.json();
};

const displayTracks = (tracks) => {
  const songListContainer = document.getElementById("song-list");
  songListContainer.innerHTML = "";

  tracks.forEach((track) => appendTrackElement(track, songListContainer));

  const songMainImgSection = document.getElementById("songMainImg");
  if (songMainImgSection) {
    songMainImgSection.innerHTML = `<img src="${tracks[0].album.images[0].url}" alt="${tracks[0].name}">`;
  }

  const trackSourceDiv = document.getElementById("trackSource");
  if (trackSourceDiv) {
    trackSourceDiv.textContent = tracks[0].album.label || "레이블 정보 없음";
  }

  const DownContainer = document.getElementById("downbarSongTmi");
  DownContainer.innerHTML = "";
  appendTrackElement(tracks[0], DownContainer, true);
};

// 트랙 엘리먼트 추가
const appendTrackElement = (track, container, isFirstTrack = false) => {
  const trackElement = document.createElement("div");
  trackElement.classList.add("song-item");

  const trackName = window.innerWidth <= 768 && track.name.length > 15 ? track.name.substring(0, 15) + "..." : track.name;

  trackElement.innerHTML = `
    <img class="song-sm-img song-main-img" src="${track.album.images[0].url}" alt="${track.name}">
    <div class="song-tmi_space">
      <div class="${isFirstTrack ? 'down_song_title' : 'artist_song_title'}" style="color: white; ${isFirstTrack ? '' : 'width:400px'}">${trackName}</div>
      <div style="font-size: ${isFirstTrack ? '14px' : '13.5px'};" class="song-people">${track.artists.map(artist => artist.name).join(", ")}</div>
    </div>
    ${isFirstTrack ? 
      '<i class="fa-regular fa-thumbs-up icon-song"></i><i class="fa-regular fa-thumbs-down icon-song"></i><i class="fa-solid fa-ellipsis-vertical icon-song"></i>' : 
      '<div class="time-sit">' + formatTrackDuration(track.duration_ms) + '</div>' // 트랙 전체 시간 표시
    }
  `;

  container.appendChild(trackElement);
};

// 트랙 가사 가져오기
const fetchLyrics = async (trackID) => {
  const token = await getAccessToken();
  const url = `https://api.spotify.com/v1/tracks/${trackID}`;

  const data = await fetchData(url, token);

  if (!data || !data.lyrics) {
    return "가사가 없습니다.";
  }

  return data.lyrics;
};

const formatTrackDuration = (durationMs) => {
  const minutes = Math.floor(durationMs / 60000); // 분 계산
  const seconds = ((durationMs % 60000) / 1000).toFixed(0); // 초 계산
  return `${minutes}:${(seconds < 10 ? '0' : '') + seconds}`; // "분:초" 형식으로 반환
};

function render() {
  const songListContainer = document.getElementById("song-list");

  if (mode === '다음 트랙' && currentArtistID) {
    fetchArtistTracks(currentArtistID);
  } else if (mode === '가사' && currentTrackID) {
    fetchLyrics(currentTrackID).then((lyrics) => {
      // 가사가 없을 때는 "가사가 없습니다"를 div로 감싸서 출력
      songListContainer.innerHTML = `<div>${lyrics}</div>`;
    });
  } else if (mode === '관련 항목') {
    songListContainer.innerHTML = "<div>관련 항목이 없습니다.</div>";
  }
}
