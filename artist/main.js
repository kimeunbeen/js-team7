/* API 연계 START */
const CLIENT_ID = "c8d711dc82634030b278a15c3fc61d2d";
const CLIENT_SECRET = "10955bf5083b4c5c8fd51ddd71c2302f";

// Access Token 가져오기
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
  return data.access_token; // ✅ Access Token 반환
}

// artistID로 아티스트 트랙 검색
const searchArtistInfo = async (artistID) => {
  console.log("검색할 아티스트 ID: ", artistID); // artistID가 제대로 전달되었는지 확인
  const token = await getAccessToken();
  const url = `https://api.spotify.com/v1/artists/${artistID}/top-tracks?market=us`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  console.log(data); // API 응답을 콘솔에 출력하여 제대로 응답이 오는지 확인

  // 아티스트 정보가 있는지 확인
  if (data && data.tracks && data.tracks.length > 0) {
    const tracks = data.tracks;

    // 아티스트 이미지와 이름 업데이트
    const artistInfo = data.tracks[0].artists[0]; // 첫 번째 트랙의 아티스트 정보
    document.getElementById('artist_name').textContent = artistInfo.name;
    document.getElementById('artist_img').src = artistInfo.images[0]?.url || "기본 이미지 URL";

    // 곡 리스트를 동적으로 추가
    const container = document.getElementById("artist_songs_container");
    container.innerHTML = ""; // 기존 트랙 초기화

    tracks.forEach((track) => {
      const trackElement = document.createElement("div");
      trackElement.classList.add("artist_song");

      let trackName = track.name;
      if (window.innerWidth <= 768) {  // 모바일 화면일 경우
        trackName = track.name.length > 15 ? track.name.substring(0, 15) + "..." : track.name;
      }

      trackElement.innerHTML = `
        <img src="${track.album.images[0].url}" alt="${track.name}" class="track_image">
        <div class="artist_space">
          <div>${trackName}</div>
          <div>${track.artists.map(artist => artist.name).join(", ")}</div>
        </div>
        <div class="artist_time">${formatTrackDuration(track.duration_ms)}</div>
      `;

      trackElement.addEventListener("click", () => {
        window.location.href =`../song/song.html?trackId=${encodeURIComponent(track.id)}&trackName=${encodeURIComponent(track.name)}&artistName=${encodeURIComponent(track.artists[0].name)}&albumImg=${encodeURIComponent(track.album.images[0].url)}`;
      });

      container.appendChild(trackElement);
    });
  } else {
    console.error("아티스트의 트랙을 찾을 수 없습니다.");
  }
};

// 밀리초를 분:초 형식으로 변환하는 함수
const formatTrackDuration = (durationMs) => {
  const minutes = Math.floor(durationMs / 60000);
  const seconds = ((durationMs % 60000) / 1000).toFixed(0);
  return `${minutes}:${(seconds < 10 ? '0' : '') + seconds}`;
};

// artistID로 아티스트 앨범 검색 (여러 개의 앨범을 로드)
const artistAlbumList = async (artistID) => {
  const token = await getAccessToken();
  const limit = 10; // 한 번에 불러올 앨범 수
  let offset = 0; // 첫 번째 페이지의 offset 값

  let hasMoreAlbums = true;
  const container = document.getElementById("artist_albums");
  container.innerHTML = ""; // 기존 앨범 초기화

  while (hasMoreAlbums) {
    const url = `https://api.spotify.com/v1/artists/${artistID}/albums?include_groups=album&market=us&limit=${limit}&offset=${offset}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (data.items && data.items.length > 0) {
      const albums = data.items;

      albums.forEach((album) => {
        const albumElement = document.createElement("div");
        albumElement.classList.add("artist_feat_title");

        let albumTitle;
        if (window.innerWidth <= 768) {
          albumTitle = album.name.length > 20 ? album.name.substring(0, 20) + "..." : album.name;
        } else {
          albumTitle = album.name;
        }
        albumElement.innerHTML = `
          <p><img class="artist_feat" src="${album.images[0].url}" alt="${album.name}" /></p>
          <div>${album.name}</div>
        `;

        container.appendChild(albumElement);
      });

      offset += limit;
    } else {
      hasMoreAlbums = false;
    }
  }
};

// URL에서 artistId 추출
const params = new URLSearchParams(window.location.search);
const artistID = params.get("artistId");

if (artistID) {
  console.log("artistId: ", artistID); // artistId가 제대로 받아졌는지 확인
  searchArtistInfo(artistID);  // artistID를 이용해 아티스트의 트랙 검색
  artistAlbumList(artistID);   // artistID를 이용해 아티스트의 앨범 검색
} else {
  console.error("artistId가 URL에 없습니다.");
}

/* API 연계 END */

