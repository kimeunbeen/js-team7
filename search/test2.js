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

const searchArtistID = async (artistName) => {
  const token = await getAccessToken();
  const url = `https://api.spotify.com/v1/search?q=${artistName}&type=artist&limit=1`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log("response ", response);
  const data = await response.json();
  console.log("data ", data);
  //console.log("아티스트 정보:", data.artists.items[0].id);

  artistID = data.artists.items[0].id;

  searchArtistInfo(artistID);
};

// artistID 로 아티스트 트랙 검색
const searchArtistInfo = async (artistID) => {
  const token = await getAccessToken();
  //let url = `https://api.spotify.com/v1/search?q=${artistName}&type=artist&limit=1`;

  const url = `https://api.spotify.com/v1/artists/${artistID}/top-tracks`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  //console.log("response ", response);
  const data = await response.json();
  console.log("artist DATA ", data);

  artistTracks = data.tracks;
  //render();
  //const track = data.tracks.items[0];
  //console.log(`✅ 트랙 ID: ${track.id}`);
};
/* API 연계 END */

// G-DRAGON 검색
searchArtistID("G-DRAGON");

// 렌더링
const render = () => {
  const mainImage = artistTracks[0].album.images[0].url;
  document.getElementById(
    "main-area"
  ).style.backgroundImage = `url('${mainImage}')`;

  //const artistHTML = artistTracks.map((track) => {});
};
