const CLIENT_ID = "76f79bbdec904545b6ca0414c2c7368a";
const CLIENT_SECRET = "792d3d82903f4bb188b5dec3659b8ee1";

let mode = 'next'; // 기본 모드를 '다음 트랙'으로 설정
let currentArtistID = null; // 현재 검색된 아티스트 ID를 저장할 변수
let currentTrackID = null; // 현재 검색된 트랙 ID를 저장할 변수

const tabs = document.querySelectorAll(".song-tabs div");

tabs.forEach((tab) =>
  tab.addEventListener("click", (event) => switchTab(event))
);

function switchTab(event) {
  mode = event.target.innerText.trim();
  render(); // 탭을 전환할 때마다 렌더링
}

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

const searchArtistID = async (artistName) => {
  const token = await getAccessToken();
  const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (data.artists.items.length > 0) {
    const artist = data.artists.items[0];
    currentArtistID = artist.id;
    const artistNameResult = artist.name;
    const artistImage = artist.images[0]?.url || "기본 이미지 URL";

    const songMainImg = document.querySelector('.song-main-img');
    const songPeople = document.querySelector('.song-people');

    if (songMainImg) songMainImg.src = artistImage;
    if (songPeople) songPeople.textContent = artistNameResult;

    fetchArtistTracks(currentArtistID);
  } else {
    console.error(" 아티스트를 찾을 수 없습니다.");
  }
};

const fetchArtistTracks = async (artistID) => {
  const token = await getAccessToken();
  const url = `https://api.spotify.com/v1/artists/${artistID}/top-tracks?market=KR`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (data.tracks && data.tracks.length > 0) {
    currentTrackID = data.tracks[0].id; // 현재 트랙 ID 저장
    displayTracks(data.tracks);
  } else {
    console.error(" 해당 아티스트의 트랙을 찾을 수 없습니다.");
  }
};

const displayTracks = (tracks) => {
  const songListContainer = document.getElementById("song-list");
  songListContainer.innerHTML = ""; // 기존 목록 초기화

  tracks.forEach((track) => {
    appendTrackElement(track, songListContainer);
  });

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

const appendTrackElement = (track, container, isFirstTrack = false) => {
  const trackElement = document.createElement("div");
  trackElement.classList.add("song-item");

  let trackName = track.name;
  if (window.innerWidth <= 768) {
    trackName = track.name.length > 15 ? track.name.substring(0, 15) + "..." : track.name;
  }

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

const fetchLyrics = async (trackID) => {
  const token = await getAccessToken();
  const url = `https://api.spotify.com/v1/tracks/${trackID}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  return data.lyrics; // 예시로 가사 가져오기 (API 엔드포인트가 다를 수 있습니다)
};

const formatTrackDuration = (durationMs) => {
  const minutes = Math.floor(durationMs / 60000);
  const seconds = ((durationMs % 60000) / 1000).toFixed(0);
  return `${minutes}:${(seconds < 10 ? '0' : '') + seconds}`;
};

function render() {
  const songListContainer = document.getElementById("song-list");
  
  if (mode === '다음 트랙') {
    // 다음 트랙 렌더링
    if (currentArtistID) {
      fetchArtistTracks(currentArtistID); // 현재 아티스트 트랙 렌더링
    }
  } else if (mode === '가사') {
    // 가사 탭일 때 가사 표시
    if (currentTrackID) {
      fetchLyrics(currentTrackID).then(lyrics => {
        songListContainer.innerHTML = `<div>${lyrics}</div>`;
      });
    }
  } else if (mode === '관련 항목') {
    // 관련 항목 탭일 때 빈칸 표시
    songListContainer.innerHTML = "<div>관련 항목이 없습니다</div>";
  }
}

// 🎯 실행 (예: NewJeans 검색)
searchArtistID("뉴진스");
