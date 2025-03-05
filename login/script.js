const CLIENT_ID = '4c76b61c07c149c9af79845148bc9f26'; // Spotify Client ID
const REDIRECT_URI = 'http://localhost:5501/login/index.html';  // 등록한 URI와 일치해야 함
const SCOPES = 'user-library-read user-top-read';  // 필요한 스코프

// Spotify 회원가입 페이지 URL
const SIGN_UP_URL = `https://www.spotify.com/kr-ko/signup?flow_id=${encodeURIComponent(REDIRECT_URI)}&forward_url=${encodeURIComponent(`https://accounts.spotify.com/authorize?scope=${encodeURIComponent(SCOPES)}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&client_id=${CLIENT_ID}`)}`;

// "Sign Up" 버튼 클릭 시, Spotify 회원가입 페이지로 리다이렉션
const signUpBtn = document.getElementById('signUpBtn');

signUpBtn.addEventListener('click', () => {
  window.location.href = SIGN_UP_URL;
});

// 로그인 버튼 클릭 시, Spotify 로그인 페이지로 리다이렉션
const loginBtn = document.getElementById('loginBtn');

loginBtn.addEventListener('click', () => {
  window.location.href = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES)}`;
});

// 리디렉션 후 액세스 토큰이 URL에 있는지 확인
window.onload = () => {
  const urlParams = new URLSearchParams(window.location.hash.substring(1)); 
  const accessToken = urlParams.get('access_token');
  
  // 로그인 후 액세스 토큰이 있는 경우에만 사용자 정보를 가져옴
  if (accessToken) {
    console.log('Access Token:', accessToken);
    fetchUserProfile(accessToken);
    // 로그인 상태로 표시
    document.getElementById('user-name').style.display = 'inline';  // 이름 표시
    document.getElementById('loginBtn').style.display = 'none';  // 로그인 버튼 숨기기
    document.getElementById('signUpBtn').style.display = 'none';  // 회원가입 버튼 숨기기
  } else {
    // 로그인 안 된 상태로 표시
    document.getElementById('user-name').style.display = 'none';  // 이름 숨기기
    document.getElementById('loginBtn').style.display = 'inline';  // 로그인 버튼 표시
    document.getElementById('signUpBtn').style.display = 'inline';  // 회원가입 버튼 표시
  }
};

// "Get Spotify free" 버튼 클릭 시, Spotify 로그인 페이지로 리다이렉션
const freeBtn = document.getElementById('freeBtn');

freeBtn.addEventListener('click', () => {
  window.location.href = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES)}`;
});

// 사용자 프로필을 가져오는 함수
function fetchUserProfile(accessToken) {
  fetch('https://api.spotify.com/v1/me', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })
  .then(response => response.json())
  .then(data => {
    console.log('User Data:', data);
    alert(`Hello, ${data.display_name}!`);
    document.getElementById('user-name').textContent = `Hello, ${data.display_name}!`; // 사용자 이름 표시
  })
  .catch(error => {
    console.error('Error fetching user profile:', error);
    alert('프로필을 불러오는 데 실패했습니다. 다시 시도해 주세요.');
  });
}

// 햄버거 메뉴 아이콘 클릭 시 메뉴 보이기/숨기기
document.addEventListener("DOMContentLoaded", function() {
  const hamburgerIcon = document.getElementById("hamburgerIcon");
  const navItems = document.querySelector(".nav-items");

  // 햄버거 버튼 클릭 시 메뉴 토글
  hamburgerIcon.addEventListener("click", function() {
      navItems.classList.toggle("show");
  });
});

