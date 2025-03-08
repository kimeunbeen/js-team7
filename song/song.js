const CLIENT_ID = "76f79bbdec904545b6ca0414c2c7368a";
const CLIENT_SECRET = "792d3d82903f4bb188b5dec3659b8ee1";

// ✅ 1. Access Token 가져오기
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

// ✅ 2. 아티스트 ID 검색
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
    const artistID = artist.id;
    const artistNameResult = artist.name;
    const artistImage = artist.images[0]?.url || "기본 이미지 URL";

    // ✅ 요소 찾기 (querySelector로 변경)
    const songMainImg = document.querySelector('.song-main-img');  // 클래스 선택
    const songPeople = document.querySelector('.song-people'); // 가수 이름 표시하는 부분

    if (songMainImg) songMainImg.src = artistImage;
    if (songPeople) songPeople.textContent = artistNameResult;

    // 🎵 해당 아티스트의 인기 곡 및 앨범 가져오기
    fetchArtistTracks(artistID);
  } else {
    console.error(" 아티스트를 찾을 수 없습니다.");
  }
};

// ✅ 3. 아티스트의 인기 트랙 가져오기
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
    const songListContainer = document.getElementById("song-list");
    songListContainer.innerHTML = ""; // 기존 목록 초기화

    data.tracks.forEach((track) => {
      appendTrackElement(track, songListContainer);
    });

    const songMainImgSection = document.getElementById("songMainImg"); // 클래스 선택
    if (songMainImgSection) {
      songMainImgSection.innerHTML = `<img src="${data.tracks[0].album.images[0].url}" alt="${data.tracks[0].name}">`;
    }

    const trackSourceDiv = document.getElementById("trackSource");
    if (trackSourceDiv) {
      trackSourceDiv.textContent = data.tracks[0].album.label || "레이블 정보 없음";
    }

    // 첫 번째 트랙 처리
    const DownContainer = document.getElementById("downbarSongTmi");
    DownContainer.innerHTML = ""; // 기존 목록 초기화

    appendTrackElement(data.tracks[0], DownContainer, true); // 첫 번째 트랙만 추가
  } else {
    console.error(" 해당 아티스트의 트랙을 찾을 수 없습니다.");
  }
};

// ✅ 트랙 요소 추가 함수
const appendTrackElement = (track, container, isFirstTrack = false) => {
  const trackElement = document.createElement("div");
  trackElement.classList.add("song-item"); // 스타일 적용할 클래스 추가

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

// ✅ 4. 시간 변환 (밀리초 → 분:초)
const formatTrackDuration = (durationMs) => {
  const minutes = Math.floor(durationMs / 60000);
  const seconds = ((durationMs % 60000) / 1000).toFixed(0);
  return `${minutes}:${(seconds < 10 ? '0' : '') + seconds}`;
};

// 🎯 실행 (예: G-DRAGON 검색)
searchArtistID("지드래곤");
