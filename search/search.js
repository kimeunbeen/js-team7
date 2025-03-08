let artistID = "";
let artistMain = [];
let artistTracks = [];
let artistAlbums = [];
let artisIncludeAlbums = [];

/* API 연계 START */
const CLIENT_ID = "76f79bbdec904545b6ca0414c2c7368a";
const CLIENT_SECRET = "792d3d82903f4bb188b5dec3659b8ee1";

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

const searchArtistID = async (type, artistName) => {
  const token = await getAccessToken();


  if (type == "name") {
    let url = `https://api.spotify.com/v1/search?q=${artistName}&type=artist&limit=1`;

    let response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });


    console.log("response ", response);
    let data = await response.json();

    artistMain = data.artists.items[0];
    console.log("artistMain ", artistMain);
    //console.log("아티스트 정보:", data.artists.items[0].id);

    artistID = data.artists.items[0].id;
    console.log("artistID", artistID)

  } else if (type == "id") {
    let url = `https://api.spotify.com/v1/artists/${artistName}`;
    let response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    data = await response.json();
    console.log("data", data)
    artistMain = data;
    artistID = data.id;
  }



  renderMain();

  searchArtistInfo(artistID);
  searchArtistAlbums(artistID);
  searchArtistIncludeAlbums(artistID);
};

const searchArtistInfo = async (artistID) => {
  const token = await getAccessToken();

  const url = `https://api.spotify.com/v1/artists/${artistID}/top-tracks`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  //console.log("response ", response);
  const data = await response.json();
  console.log("url", url)
  console.log("artist DATA ", data);

  artistTracks = data.tracks;

  renderPopular();
  //const track = data.tracks.items[0];
  //console.log(`✅ 트랙 ID: ${track.id}`);
};

const searchArtistAlbums = async (artistID) => {
  const token = await getAccessToken();

  const url = `https://api.spotify.com/v1/artists/${artistID}/albums`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  //console.log("response ", response);
  const data = await response.json();
  console.log("url", url)
  console.log("artist albums ", data);

  artistAlbums = data.items;
  renderAlbum();
};

const searchArtistIncludeAlbums = async (artistID) => {
  const token = await getAccessToken();

  const url = `https://api.spotify.com/v1/artists/${artistID}/albums?include_groups=appears_on`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  //console.log("response ", response);
  const data = await response.json();
  console.log("url", url)
  console.log("artist include albums ", data);

  artisIncludeAlbums = data.items;
  renderIncludeAlbum();
};

/* API 연계 END */

// 렌더팅 (메인) 
const renderMain = () => {
  const artistName = artistMain.name;
  const artistHTML = `<div class="artist-Title"><a href="../artist/index.html?artistId=${artistID}">${artistName}</a></div>`;

  document.getElementById("artist-info").innerHTML = artistHTML;
  document.getElementById("sticky-header-info").innerHTML = artistHTML;
}
// 렌더링 (인기)
const renderPopular = () => {
  const mainImage = artistTracks[0].album.images[0].url;
  document.getElementById(
    "main-area"
  ).style.backgroundImage = `url('${mainImage}')`;
  const trackHTML = artistTracks
    .map((track, index) => {
      const trackCover = track.album.images[2].url
        ? track.album.images[2].url
        : "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/300px-No_image_available.svg.png";

      let trackTitle = track.name;
      if (window.innerWidth <= 768) {  // 모바일 화면일 경우
        trackTitle = track.name.length > 15 ? track.name.substring(0, 15) + "..." : track.name;
      }
      const trackTime = formatDuration(track.duration_ms);
      const id = track.id;

      return `<div class="track-item">
          <div class="track-rank">${index + 1}</div>
          <div class="track-cover"><img src=${trackCover}></div>
          <div class="track-info">
              <a class="track-title">${trackTitle}</a>
          </div>
          <div class="track-meta">• ${trackTime}</div>
        </div>`;
    })
    .join("");

  document.getElementById("track-list").innerHTML = trackHTML;
};

// 렌더링 (앨범)
const renderAlbum = () => {
  const albumHTML = artistAlbums
    .map((album) => {
      const albumCover = album.images[1].url
        ? album.images[1].url
        : "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/300px-No_image_available.svg.png";

      let albumTitle = album.name;
      if (window.innerWidth <= 768) {  // 모바일 화면일 경우
        albumTitle = album.name.length > 15 ? album.name.substring(0, 15) + "..." : album.name;
      }

      let albumType = album.album_type;
      if (albumType == "single") {
        albumType = "싱글";
      } else if (albumType == "album") {
        albumType = "앨범";
      }

      const year = album.release_date.substring(0, 4);


      return `<div class="item">
      <div class = "album-card">
            <img src=${albumCover} alt=${albumTitle} />
            <div class="play-button">
              <img src="img/play.png" alt="재생">
            </div>
            </div>
            <p>${albumTitle}</p>
            <div class="albumDetail">${year} •${albumType}</div>
          </div>`;
    })
    .join("");

  document.getElementById("album-container").innerHTML = albumHTML;
};

// 렌더링 (참여앨범)
const renderIncludeAlbum = () => {
  const includeAlbumHTML = artisIncludeAlbums
    .map((album) => {
      const albumCover = album.images[1].url
        ? album.images[1].url
        : "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/300px-No_image_available.svg.png";

      let albumTitle = album.name;
      if (window.innerWidth <= 768) {  // 모바일 화면일 경우
        albumTitle = album.name.length > 15 ? album.name.substring(0, 15) + "..." : album.name;
      }

      let albumType = album.album_type;
      if (albumType == "single") {
        albumType = "싱글";
      } else if (albumType == "album") {
        albumType = "앨범";
      } else {
        albumType = "";
      }

      const year = album.release_date.substring(0, 4);


      return `<div class="item">
      <div class = "album-card">
            <img src=${albumCover} alt=${albumTitle} />
            <div class="play-button">
              <img src="img/play.png" alt="재생">
            </div>
            </div>
            <p>${albumTitle}</p>
            <div class="albumDetail">${year} •${albumType}</div>
          </div>`;
    })
    .join("");

  document.getElementById("featured-container").innerHTML = includeAlbumHTML;
};

// sticky header 이벤트 리스너
const background = document.querySelector('#main-area');
const artistInfo = document.querySelector('#artist-info');
const stickyHeader = document.querySelector('.sticky-header');

window.addEventListener('scroll', () => {
  let scrollY = window.scrollY;
  let triggerPoint = 300; // 헤더가 나타나는 지점

  // 스크롤에 따른 블러 및 확대 효과
  let blurValue = Math.min(scrollY / 20, 10); // 최대 10px 블러
  let scaleValue = 1 + Math.min(scrollY / 1000, 0.1); // 최대 1.1배 확대
  background.style.filter = `blur(${blurValue}px)`;
  background.style.transform = `scale(${scaleValue})`;

  // 아티스트 이름 이동 및 크기 조절
  let fontSize = Math.max(50 - scrollY / 10, 24); // 최소 24px까지 축소
  artistInfo.style.fontSize = `${fontSize}px`;
  artistInfo.style.transform = `translateY(${Math.max(-scrollY / 2, -60)}px)`;

  // 헤더 고정 처리
  if (scrollY > triggerPoint) {
    stickyHeader.style.opacity = '1';
    stickyHeader.style.transform = 'translateY(0)';
  } else {
    stickyHeader.style.opacity = '0';
    stickyHeader.style.transform = 'translateY(-20px)';
  }
});

/*사용자함수 START */
// 밀리초 -> 분초로 변경
function formatDuration(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
/*사용자함수 END */


// URL에서 Query String 가져오기
const params = new URLSearchParams(window.location.search);

// 가져온param에서 artistId값 get
const paramArtistID = params.get("artistId");
const type = params.get("type");

// 내 API or Render 파라미터로 넣어주기
//searchArtistID(type, paramArtistID);
searchArtistID("name", "taylor swift");