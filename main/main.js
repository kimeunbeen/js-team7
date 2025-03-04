const CLIENT_ID = "fe8baa24fefb4d52b8c5e87d473c8ffe"; // 여기에 Client ID 입력
const CLIENT_SECRET = "e1642f321e484359a3f48dd6d2294685"; // 여기에 Client Secret 입력

// Base64 인코딩
const encodedCredentials = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);


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

// 🎤 [1] 인기 아티스트 가져오기
const fetchSpotifyArtists = async () => {
  const token = await getAccessToken();

  const response = await fetch("https://api.spotify.com/v1/artists?ids=1uNFoZAHBGtllmzznpCI3s,3TVXtAsR1Inumwj472S9r4,246dkjvS1zLTtiykXe5h60", {
      method: "GET",
      headers: {
          "Authorization": `Bearer ${token}`
      }
  });

  const data = await response.json();
  console.log("🎤 인기 아티스트 데이터:", data);

  if (data && data.artists) {
      renderArtists(data.artists);
  } else {
      console.error("❌ 아티스트 데이터 없음:", data);
  }
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
      console.error("❌ 앨범 데이터 없음:", data);
  }
};

// 🎨 [3] 아티스트 리스트 렌더링 함수
const renderArtists = (artists) => {
  const artistHTML = artists.map(artist => `
      <div class="artist">
          <img src="${artist.images.length ? artist.images[0].url : 'https://via.placeholder.com/100'}" 
              alt="${artist.name}">
          <p>${artist.name}</p>
      </div>
  `).join('');

  document.getElementById("artist-container").innerHTML = artistHTML;
};

// 🎨 [4] 앨범 리스트 렌더링 함수
const renderAlbums = (albums) => {
  const albumHTML = albums.map(album => `
      <div class="album">
          <img src="${album.images.length ? album.images[0].url : 'https://via.placeholder.com/100'}" 
              alt="${album.name}">
          <p>${album.name}</p>
      </div>
  `).join('');

  document.getElementById("album-container").innerHTML = albumHTML;
};

// 실행
fetchSpotifyArtists();
fetchSpotifyAlbums();

