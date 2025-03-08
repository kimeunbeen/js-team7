const CLIENT_ID = "fe8baa24fefb4d52b8c5e87d473c8ffe"; // 여기에 Client ID 입력
const CLIENT_SECRET = "fd23b19e7af64e92b5e2c85c975df942"; // 여기에 Client Secret 입력

// Base64 인코딩
const encodedCredentials = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);

// const params = new URLSearchParams(window.location.search);
// const artistId = params.get("id");

// 🔑 Access Token 요청
const getAccessToken = async () => {
  const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`
      },
      body: "grant_type=client_credentials"
  });

  const data = await response.json();
  return data.access_token;
};

// const fetchArtistDetail = async () => {
//   const token = await getAccessToken();

//   const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
//       method: "GET",
//       headers: {
//           "Authorization": `Bearer ${token}`
//       }
//   });

//   const data = await response.json();
//   console.log("🎵 아티스트 상세 정보:", data);

//   document.getElementById("artist-name").textContent = data.name;
//   document.getElementById("artist-image").src = data.images[0].url;
//   document.getElementById("artist-genres").textContent = data.genres.join(", ");
//   document.getElementById("artist-followers").textContent = `팔로워: ${data.followers.total.toLocaleString()}명`;
// };



// [1] 인기 아티스트 가져오기 (최대 10개)
const fetchSpotifyArtists = async () => {
  const token = await getAccessToken();

  const response = await fetch("https://api.spotify.com/v1/artists?ids=1uNFoZAHBGtllmzznpCI3s,3TVXtAsR1Inumwj472S9r4,246dkjvS1zLTtiykXe5h60,6eUKZXaKkcviH0Ku9w2n3V,1HY2Jd0NmPuamShAr6KMms,0du5cEVh5yTK9QJze8zA0C,5pKCCKE2ajJHZ9KAiaK11H,66CXWjxzNUsdJxJ2JdwvnR,6eUKZXaKkcviH0Ku9w2n3V,5YGY8feqx7naU7z4HrwZM6", {
      method: "GET",
      headers: {
          "Authorization": `Bearer ${token}`
      }
  });

  const data = await response.json();
  console.log(" 인기 아티스트 데이터:", data);

  if (data && data.artists) {
      renderArtists(data.artists);
  } else {
      console.error(" 아티스트 데이터 없음:", data);
  }
};

const renderArtists = (artists) => {
  const artistContainer = document.getElementById("artist-container");
  artistContainer.innerHTML = ""; // 기존 내용을 지우고 새로 추가

  const artistHTML = artists.slice(0, 10).map(artist => `
      <div class="artist flex-shrink-0">
          <img class="artist_img" src="${artist.images.length ? artist.images[0].url : 'https://via.placeholder.com/100'}" 
              alt="${artist.name}">
          <p class="artist_name">${artist.name}</p>
      </div>
  `).join('');

  artistContainer.innerHTML = artistHTML;

  // 클릭 이벤트 추가 (아티스트 클릭 시 상세 페이지로 이동)
  document.querySelectorAll(".artist").forEach(artistElement => {
    artistElement.addEventListener("click", () => {
        const artistId = artistElement.getAttribute("data-id");
        window.location.href = `artist-detail.html?id=${artistId}`; // 상세 페이지로 이동
    });
  });
};

// 🎵 [2] 최신 앨범 가져오기
const fetchSpotifyAlbums = async () => {
  const token = await getAccessToken();

  const response = await fetch("https://api.spotify.com/v1/browse/new-releases", {
      method: "GET",
      headers: {
          "Authorization": `Bearer ${token}`
      }
  });

  const data = await response.json();
  console.log("🎵 인기 앨범 데이터:", data);

  if (data && data.albums && data.albums.items) {
      renderAlbums(data.albums.items);
  } else {
      console.error("앨범 데이터 없음:", data);
  }
};

// 🎨 [4] 앨범 리스트 렌더링 함수
const renderAlbums = (albums) => {
  const albumContainer = document.getElementById("album-container");
  albumContainer.innerHTML = "";
  
  const albumHTML = albums.map(album => `
      <div class="album flex-shrink-0">
          <img src="${album.images.length ? album.images[0].url : 'https://via.placeholder.com/100'}" 
              alt="${album.name}">
          <p class="album_name">${album.name}</p>
          <p class="album_artist">${album.artists.map(artist => artist.name).join(", ")}</p>
      </div>
  `).join('');

  albumContainer.innerHTML = albumHTML;
};


// 실행

fetchSpotifyArtists();
fetchSpotifyAlbums();
// fetchArtistDetail();

