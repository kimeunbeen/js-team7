const CLIENT_ID = "76f79bbdec904545b6ca0414c2c7368a";
const CLIENT_SECRET = "792d3d82903f4bb188b5dec3659b8ee1";

const REDIRECT_URI = 'http://localhost:5500/login/index.html'; 

let mode = 'next'; // 기본 모드를 '다음 트랙'으로 설정
let currentArtistID = null; // 현재 검색된 아티스트 ID를 저장할 변수
let currentTrackID = null; // 현재 검색된 트랙 ID를 저장할 변수

// 탭 클릭 시 모드 변경
const tabs = document.querySelectorAll(".song-tabs div");
tabs.forEach((tab) => tab.addEventListener("click", switchTab));

function switchTab(event) {
  mode = event.target.innerText.trim();
  render(); // 탭을 전환할 때마다 렌더링
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

// 아티스트 검색
const searchArtistID = async (artistName) => {
  const token = await getAccessToken();
  const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1`;

  const data = await fetchData(url, token);
  if (data.artists.items.length > 0) {
    const artist = data.artists.items[0];
    currentArtistID = artist.id;
    updateArtistInfo(artist);
    fetchArtistTracks(currentArtistID);
  } else {
    console.error(" 아티스트를 찾을 수 없습니다.");
  }
};

// 아티스트 정보 업데이트
const updateArtistInfo = (artist) => {
  const artistNameResult = artist.name;
  const artistImage = artist.images[0]?.url || "기본 이미지 URL";
  document.querySelector('.song-main-img').src = artistImage;
  document.querySelector('.song-people').textContent = artistNameResult;
};

// 아티스트의 트랙 가져오기
const fetchArtistTracks = async (artistID) => {
  const token = await getAccessToken();
  const url = `https://api.spotify.com/v1/artists/${artistID}/top-tracks?market=KR`;

  const data = await fetchData(url, token);
  if (data.tracks?.length) {
    currentTrackID = data.tracks[0].id;
    displayTracks(data.tracks);
  } else {
    console.error(" 해당 아티스트의 트랙을 찾을 수 없습니다.");
  }
};

// API 데이터 받아오기 (중복 코드 제거)
const fetchData = async (url, token) => {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return await response.json();
};

// 트랙 리스트 출력
const displayTracks = (tracks) => {
  const songListContainer = document.getElementById("song-list");
  songListContainer.innerHTML = ""; // 기존 목록 초기화

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
    ${isFirstTrack ? '<i class="fa-regular fa-thumbs-up icon-song"></i><i class="fa-regular fa-thumbs-down icon-song"></i><i class="fa-solid fa-ellipsis-vertical icon-song"></i>' : '<div class="time-sit">' + formatTrackDuration(track.duration_ms) + '</div>'}
  `;

  container.appendChild(trackElement);
};

// 트랙 가사 가져오기
const fetchLyrics = async (trackID) => {
  const token = await getAccessToken();
  const url = `https://api.spotify.com/v1/tracks/${trackID}`;

  const data = await fetchData(url, token);
  return data.lyrics; // 예시로 가사 가져오기 (API 엔드포인트가 다를 수 있습니다)
};

// 트랙 시간 포맷팅
const formatTrackDuration = (durationMs) => {
  const minutes = Math.floor(durationMs / 60000);
  const seconds = ((durationMs % 60000) / 1000).toFixed(0);
  return `${minutes}:${(seconds < 10 ? '0' : '') + seconds}`;
};

// 렌더링 함수
function render() {
  const songListContainer = document.getElementById("song-list");

  if (mode === '다음 트랙' && currentArtistID) {
    fetchArtistTracks(currentArtistID);
  } else if (mode === '가사' && currentTrackID) {
    fetchLyrics(currentTrackID).then((lyrics) => {
      songListContainer.innerHTML = `<div>${lyrics}</div>`;
    });
  } else if (mode === '관련 항목') {
    songListContainer.innerHTML = "<div>관련 항목이 없습니다</div>";
  }
}

// 예시 실행 (예: NewJeans 검색)
searchArtistID("뉴진스");
