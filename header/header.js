// jQuery가 로드된 후 실행되도록 함수 정의
function initHeaderJS() {
  console.log("헤더 JS 초기화 시작");
  
  // 프로필 드롭다운 기능 초기화
  initProfileDropdown();
  
  // 모바일 검색 기능 초기화
  initMobileSearch();
  
  console.log("헤더 JS 초기화 완료");
}

// 문서가 준비되면 실행
$(document).ready(function() {
  console.log("문서 준비됨, 헤더 확인 시작");
  
  // 헤더가 모두 로드되었는지 확인
  if($('.profile-button').length > 0) {
    // 헤더가 이미 로드되어 있는 경우 바로 초기화
    console.log("헤더가 이미 로드되어 있음");
    initHeaderJS();
  } else {
    console.log("헤더 요소를 찾을 수 없음, 로드 대기 중...");
    // 헤더가 아직 로드되지 않은 경우 0.5초마다 확인
    var headerCheckInterval = setInterval(function() {
      if($('.profile-button').length > 0) {
        clearInterval(headerCheckInterval);
        console.log("헤더 요소 발견, 초기화 시작");
        initHeaderJS();
      }
    }, 500);
    
    // 10초 후에도 로드되지 않으면 인터벌 중지
    setTimeout(function() {
      clearInterval(headerCheckInterval);
      console.error('헤더 로드 타임아웃: 헤더 요소를 찾을 수 없습니다.');
    }, 10000);
  }
  
  // URL에서 액세스 토큰 추출 - 현재 페이지 경로 확인
  if (window.location.pathname.includes('/main/')) {
    console.log("메인 페이지 감지됨, 토큰 확인 중");
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    
    if (accessToken) {
      console.log('Access token available on main page');
      // 토큰을 사용하여 사용자 프로필 또는 기타 데이터 가져오기
      fetchUserProfile(accessToken);
    } else {
      console.log('No access token available. Redirecting to login...');
      window.location.href = '../login/index.html';
    }
  } else {
    console.log("메인 페이지가 아님, 토큰 확인 건너뜀");
  }
});

function fetchUserProfile(accessToken) {
  fetch('https://api.spotify.com/v1/me', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('User Data:', data);
    const userNameElement = document.getElementById('user-name');
    if (userNameElement) {
      userNameElement.textContent = `Hello, ${data.display_name}!`;
    }
    // 사용자 데이터로 다른 작업 수행
  })
  .catch(error => {
    console.error('Error fetching user profile:', error);
  });
}

// 프로필 드롭다운 기능 초기화
function initProfileDropdown() {
  const profileButton = document.querySelector('.profile-button');
  const profileDropdown = document.getElementById('profileDropdown');
  
  if (profileButton && profileDropdown) {
    console.log('프로필 요소 찾음');
    
    // 프로필 버튼 클릭 시 드롭다운 토글
    profileButton.addEventListener('click', function(event) {
      event.stopPropagation(); // 이벤트 버블링 방지
      profileDropdown.classList.toggle('active');
      console.log('드롭다운 토글됨, 현재 클래스:', profileDropdown.className);
    });
    
    // 문서 내 다른 곳 클릭 시 드롭다운 닫기
    document.addEventListener('click', function(event) {
      if (!profileButton.contains(event.target) && !profileDropdown.contains(event.target)) {
        profileDropdown.classList.remove('active');
      }
    });
    
    // ESC 키 누를 때 드롭다운 닫기
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape') {
        profileDropdown.classList.remove('active');
      }
    });
    
    console.log('프로필 드롭다운 기능 초기화 완료');
  } else {
    console.error('프로필 버튼 또는 드롭다운 메뉴를 찾을 수 없습니다');
  }
}

// 모바일 검색 기능 초기화
function initMobileSearch() {
  const searchArea = document.querySelector('.search-area');
  const magnifyingGlass = document.querySelector('.magnifying-glass-image');
  
  // 검색 아이콘에 클릭 이벤트 리스너 추가
  if (magnifyingGlass && searchArea) {
    console.log("검색 영역 요소 찾음");
    // 검색 아이콘을 div로 감싸서 클릭 영역 개선
    const glassContainer = document.createElement('div');
    glassContainer.className = 'magnifying-glass-container';
    magnifyingGlass.parentNode.insertBefore(glassContainer, magnifyingGlass);
    glassContainer.appendChild(magnifyingGlass);
    
    // 검색 아이콘 클릭 시 검색창 토글
    glassContainer.addEventListener('click', function() {
      searchArea.classList.toggle('active');
      
      // 활성화되면 검색창에 포커스
      if (searchArea.classList.contains('active')) {
        const searchInput = searchArea.querySelector('.search-input');
        if (searchInput) {
          searchInput.style.display = 'block';
          searchInput.focus();
        }
      }
    });
    
    // 검색창 외부 클릭 시 검색창 닫기 (이미 document에 클릭 이벤트가 있으므로 조건 추가)
    document.addEventListener('click', function(event) {
      if (!searchArea.contains(event.target) && 
          !event.target.classList.contains('magnifying-glass-container') && 
          !event.target.classList.contains('magnifying-glass-image')) {
        searchArea.classList.remove('active');
        const searchInput = searchArea.querySelector('.search-input');
        if (searchInput) {
          searchInput.style.display = 'none';
        }
      }
    });
    
    console.log("모바일 검색 기능 초기화 완료");
  } else {
    console.error("검색 영역 또는 아이콘을 찾을 수 없습니다");
  }
}