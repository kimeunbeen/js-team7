// Spotify API Configuration
//로컬 개발 환경
//const CLIENT_ID = '4c76b61c07c149c9af79845148bc9f26';
//Netlify 배포 환경
const CLIENT_ID = '76f79bbdec904545b6ca0414c2c7368a';
//로컬 개발 환경
//const REDIRECT_URI = 'http://localhost:5501/login/index.html';
//Netlify 배포 환경
const REDIRECT_URI = 'https://noonafy.netlify.app/login/index.html';
const SCOPES = 'user-library-read user-top-read';

const SIGN_UP_URL = `https://www.spotify.com/kr-ko/signup?flow_id=${encodeURIComponent(REDIRECT_URI)}&forward_url=${encodeURIComponent(`https://accounts.spotify.com/authorize?scope=${encodeURIComponent(SCOPES)}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&client_id=${CLIENT_ID}`)}`;

// Wait for DOM to be fully loaded before attaching event listeners
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM fully loaded - setting up event listeners");

  // Sign Up button
  const signUpBtn = document.getElementById('signUpBtn');
  console.log("Sign Up button found:", !!signUpBtn);
  if (signUpBtn) {
    signUpBtn.addEventListener('click', () => {
      console.log("Sign Up button clicked");
      window.location.href = SIGN_UP_URL;
    });
  }

  // Login button
  const loginBtn = document.getElementById('loginBtn');
  console.log("Login button found:", !!loginBtn);
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      console.log("Login button clicked");
      window.location.href = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES)}`;
    });
  }

  // Free button
  const freeBtn = document.getElementById('freeBtn');
  console.log("Free button found:", !!freeBtn);
  if (freeBtn) {
    freeBtn.addEventListener('click', () => {
      console.log("Free button clicked");
      window.location.href = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES)}`;
    });
  }

  // Hamburger menu
  const hamburgerIcon = document.getElementById("hamburgerIcon");
  const navItems = document.querySelector(".nav-items");
  if (hamburgerIcon && navItems) {
    hamburgerIcon.addEventListener("click", function () {
      console.log("Hamburger menu clicked");
      navItems.classList.toggle("show");
    });
  }

  // Check for access token on page load
  checkAccessToken();
});

// Check for access token from URL hash
function checkAccessToken() {
  console.log("Checking for access token");
  const urlParams = new URLSearchParams(window.location.hash.substring(1));
  const accessToken = urlParams.get('access_token');

  if (accessToken) {
    console.log('Access Token found:', accessToken);
    fetchUserProfile(accessToken);

    //로컬 개발 환경
    //window.location.href = `http://localhost:5501/main/index.html?access_token=${accessToken}`;

    //Netlify 배포 환경
    window.location.href = `https://noonafy.netlify.app/main/index.html?access_token=${accessToken}`;

    console.log('Login successful! Access token:', accessToken);
  } else {
    const loginBtn = document.getElementById('loginBtn');
    const signUpBtn = document.getElementById('signUpBtn');

    if (loginBtn) loginBtn.style.display = 'inline';
    if (signUpBtn) signUpBtn.style.display = 'inline';
    console.log('No login information available.');
  }
}

// Fetch user profile information
function fetchUserProfile(accessToken) {
  fetch('https://api.spotify.com/v1/me', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })
    .then(response => {
      if (!response.ok) {
        console.log(`HTTP error! Status: ${response.status}`);
        return;
      }
      return response.json();
    })
    .then(data => {
      if (data) {
        console.log('User Data:', data);
        const userNameElement = document.getElementById('user-name');
        if (userNameElement) {
          userNameElement.textContent = `Hello, ${data.display_name}!`;
        }
      }
    })
    .catch(error => {
      console.log('Error fetching user profile:', error);
    });
}