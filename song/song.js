const CLIENT_ID = "76f79bbdec904545b6ca0414c2c7368a";
const CLIENT_SECRET = "792d3d82903f4bb188b5dec3659b8ee1";

let mode = '다음 트랙'; 
let currentArtistID = null;
let currentTrackID = null;

const tabs = document.querySelectorAll(".song-tabs div");
const underLine = document.getElementById("under-line");
const nextTab = document.getElementById("next-tab");

const params = new URLSearchParams(window.location.search);
const trackID = params.get("trackId");
// const trackID = "1QV6tiMFM6fSOKOGLMHYYg"; 

window.addEventListener("load", async () => {
  requestAnimationFrame(() => moveUnderLine(nextTab)); // 언더라인 위치 설정

  if (trackID) {
    await fetchTrackInfo(trackID); // 트랙 정보 불러오기
  } else {
    console.error("trackID가 없습니다.");
  }

  tabs[0].style.color = "white";
});

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
  tabs.forEach((tab) => {
    tab.style.color = "";
  });

  event.target.style.color = "white";
}

function moveUnderLine(target) {
  if (!target) return;

  underLine.style.left = target.offsetLeft + "px";
  underLine.style.width = target.offsetWidth + "px";
  underLine.style.top = (target.offsetTop + target.offsetHeight - 15) + "px"; 
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

const fetchTrackInfo = async (trackID) => {
  const token = await getAccessToken();
  const url = `https://api.spotify.com/v1/tracks/${trackID}`;

  const data = await fetchData(url, token);
  console.log(data); 
  
  if (data) {
    displayTrackDetail(data); 
    currentArtistID = data.artists[0].id; 
    currentTrackID = trackID; 
    fetchArtistTracks(currentArtistID); 
  } else {
    console.error("트랙 정보를 가져올 수 없습니다.");
  }
};

const displayTrackDetail = (track) => {
  const songImgContainer = document.querySelector('.song-img');
  if (songImgContainer) {
    songImgContainer.innerHTML = ''; 
    const imgElement = document.createElement('img'); 
    imgElement.src = track.album.images[0]?.url || "기본 이미지 URL"; 
    imgElement.alt = track.name; 
    songImgContainer.appendChild(imgElement);
  }

  const DownContainer = document.getElementById("downbarSongTmi");  

  DownContainer.innerHTML = `
    <img class="song-sm-img song-main-img" src="${track.album.images[0]?.url}" alt="${track.name}">
    <div class="song-tmi_space">
      <div class="down_song_title">${track.name}</div>
      <div class="song-people">${track.artists.map(artist => artist.name).join(", ")}</div>
    </div>
    <i class="fa-regular fa-thumbs-up icon-song min-none"></i>
    <i class="fa-regular fa-thumbs-down icon-song min-none"></i>
    <i class="fa-solid fa-ellipsis-vertical icon-song min-none2 "></i>
  `;
  
  // 전체 시간 표시
  const trackTimeElement = document.getElementById("track-time");
  trackTimeElement.textContent = formatTrackDuration(track.duration_ms);
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

  if (currentTrackID) {
    const currentTrack = tracks.find(track => track.id === currentTrackID);
    if (currentTrack) {
      appendTrackElement(currentTrack, songListContainer, true);  
    }
  }

  tracks.forEach((track, index) => {
    if (track.id !== currentTrackID) {
      appendTrackElement(track, songListContainer, index === 0);
    }
  });
};

const appendTrackElement = (track, container, isFirstTrack = false) => {
  const trackElement = document.createElement("div");
  trackElement.classList.add("song-item");
  
  trackElement.innerHTML = `
    <img class="song-sm-img song-main-img" src="${track.album.images[0].url}" alt="${track.name}">
    <div class="song-tmi_space">
      <div class="${isFirstTrack ? 'down_song_title' : 'artist_song_title'}" style="color: white; ${isFirstTrack ? '' : 'width:400px'}">${track.name}</div>
      <div style="font-size: ${isFirstTrack ? '14px' : '13.5px'};" class="song-people">${track.artists.map(artist => artist.name).join(", ")}</div>
    </div>
    <div class="time-sit min-none4">${formatTrackDuration(track.duration_ms)}</div>
  `;
  
  // 클릭 이벤트 추가
  trackElement.addEventListener("click", () => {
    fetchTrackInfo(track.id);  // 클릭된 트랙 정보 로드
  });

  container.appendChild(trackElement);
};

function render() {
  const songListContainer = document.getElementById("song-list");

  if (mode === '다음 트랙' && currentArtistID) {
    fetchArtistTracks(currentArtistID);
  } else if (mode === '가사' && currentTrackID) {
    fetchLyrics(currentTrackID).then((lyrics) => {
      songListContainer.innerHTML = `<div class="no-lyrics">${lyrics}</div>`;
    });
  } else if (mode === '관련 항목') {
    songListContainer.innerHTML = "<div>관련 항목이 없습니다.</div>";
  }
}

const fetchLyrics = async (trackID) => {
  const token = await getAccessToken();
  const url = `https://api.lyrics.ovh/v1/${trackID}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.lyrics) {
      return data.lyrics;
    } else {
      return "가사가 없습니다.";  
    }
  } catch (error) {
    console.error("가사를 가져올 수 없습니다.", error);
    return "가사를 가져올 수 없습니다.";  
  }
};

const formatTrackDuration = (durationMs) => {
  const minutes = Math.floor(durationMs / 60000); 
  const seconds = ((durationMs % 60000) / 1000).toFixed(0);
  return `${minutes}:${(seconds < 10 ? '0' : '') + seconds}`;
};
