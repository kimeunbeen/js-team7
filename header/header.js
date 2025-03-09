// jQuery가 로드된 후 실행되도록 함수 정의
function initHeaderJS() {
  console.log("헤더 JS 초기화 시작");

  // 프로필 드롭다운 기능 초기화
  initProfileDropdown();

  // 모바일 검색 기능 초기화
  initMobileSearch();

  // 검색 이벤트 리스너 초기화
  initSearchFunctionality();

  // 로그아웃 버튼 초기화
  initLogoutButton();

  console.log("헤더 JS 초기화 완료");
}

// 문서가 준비되면 실행
$(document).ready(function () {
  console.log("문서 준비됨, 헤더 확인 시작");

  // 헤더가 모두 로드되었는지 확인
  if ($('.profile-button').length > 0) {
    // 헤더가 이미 로드되어 있는 경우 바로 초기화
    console.log("헤더가 이미 로드되어 있음");
    initHeaderJS();
  } else {
    console.log("헤더 요소를 찾을 수 없음, 로드 대기 중...");
    // 헤더가 아직 로드되지 않은 경우 0.5초마다 확인
    var headerCheckInterval = setInterval(function () {
      if ($('.profile-button').length > 0) {
        clearInterval(headerCheckInterval);
        console.log("헤더 요소 발견, 초기화 시작");
        initHeaderJS();
      }
    }, 500);

    // 10초 후에도 로드되지 않으면 인터벌 중지
    setTimeout(function () {
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

    // 프로필 버튼 클릭 시 드롭다운 토글 (클래스 대신 직접 스타일 적용)
    profileButton.addEventListener('click', function (event) {
      event.stopPropagation(); // 이벤트 버블링 방지

      // 현재 상태에 따라 토글
      if (profileDropdown.style.display === 'block') {
        profileDropdown.style.display = 'none';
        profileDropdown.classList.remove('profile-dropdown-active'); // 'active'를 'profile-dropdown-active'로 변경
        console.log('드롭다운 숨김');
      } else {
        profileDropdown.style.display = 'block';
        profileDropdown.classList.add('profile-dropdown-active'); // 'active'를 'profile-dropdown-active'로 변경
        console.log('드롭다운 표시, 현재 스타일:', profileDropdown.style.display);
      }
    });

    // 문서 내 다른 곳 클릭 시 드롭다운 닫기
    $(document).on('click', function (event) {
      if (!profileButton.contains(event.target) && !profileDropdown.contains(event.target)) {
        profileDropdown.style.display = 'none';
        profileDropdown.classList.remove('profile-dropdown-active'); // 'active'를 'profile-dropdown-active'로 변경
      }
    });

    // ESC 키 누를 때 드롭다운 닫기
    $(document).on('keydown', function (event) {
      if (event.key === 'Escape') {
        profileDropdown.style.display = 'none';
        profileDropdown.classList.remove('profile-dropdown-active'); // 'active'를 'profile-dropdown-active'로 변경
      }
    });

    console.log('프로필 드롭다운 기능 초기화 완료');
  } else {
    console.error('프로필 버튼 또는 드롭다운 메뉴를 찾을 수 없습니다');
  }
}

// 검색 기능 초기화 < 입력창 검색 코드는 이거 보시면 됩니다~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function initSearchFunctionality() {
  const searchInput = document.querySelector('.search-input');

  if (searchInput) {
    console.log('검색 입력 요소 찾음');

    // 검색 입력에 키 이벤트 리스너 추가
    searchInput.addEventListener('keydown', function (event) {
      // Enter 키를 누르면 검색 실행
      if (event.key === 'Enter') {
        event.preventDefault(); // 기본 동작 방지

        const searchQuery = searchInput.value.trim();

        if (searchQuery) {
          console.log('검색 실행:', searchQuery);

          const url = `https://noonafy.netlify.app/search/search.html?type=name&artistId=${encodeURIComponent(searchQuery)}`;
          window.location.href = url; // 입력한 URL로 자동 이동

          // 현재 페이지 그대로 유지하고 쿼리 파라미터만 추가/변경
          // const currentUrl = new URL(window.location.href);
          // currentUrl.searchParams.set('query', searchQuery);
          // window.location.href = currentUrl.toString();
        } else {
          console.log('검색어가 비어 있음, 검색을 실행하지 않음');
          alert('검색어를 입력해주세요🙏');
        }
      }
    });

    // 돋보기 아이콘 클릭으로도 검색 가능하게 추가
    const magnifyingGlass = document.querySelector('.magnifying-glass-image');
    if (magnifyingGlass) {
      magnifyingGlass.addEventListener('click', function () {
        // 검색창에 포커스만 줌
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
          searchInput.focus();
        }
      });
    }

    console.log('검색 입력 이벤트 리스너 초기화 완료');
  } else {
    console.error('검색 입력 요소를 찾을 수 없습니다');
  }
}

// 모바일 검색 기능 초기화
function initMobileSearch() {
  const searchArea = document.querySelector('.search-area');
  const magnifyingGlass = document.querySelector('.magnifying-glass-image');

  // 현재 화면 크기가 모바일 뷰인지 확인하는 함수
  function isMobileView() {
    return window.innerWidth <= 768; // CSS 미디어 쿼리 기준과 동일하게 설정
  }

  // 검색 영역과 아이콘이 존재하는지 확인
  if (magnifyingGlass && searchArea) {
    console.log("검색 영역 요소 찾음");

    // 돋보기 아이콘에 직접 이벤트 추가
    magnifyingGlass.style.cursor = 'pointer';

    // 돋보기 아이콘 클릭 시 검색창 토글 (모바일에서만)
    magnifyingGlass.addEventListener('click', function (event) {
      if (isMobileView()) {
        event.stopPropagation(); // 이벤트 버블링 방지
        searchArea.classList.toggle('active');

        // 활성화되면 검색창에 포커스
        if (searchArea.classList.contains('active')) {
          const searchInput = searchArea.querySelector('.search-input');
          if (searchInput) {
            searchInput.style.display = 'block';
            setTimeout(() => {
              searchInput.focus();
            }, 50); // 약간의 지연을 두어 전환 애니메이션 후 포커스
          }
        } else {
          // 비활성화되면 검색창 숨김
          const searchInput = searchArea.querySelector('.search-input');
          if (searchInput) {
            searchInput.style.display = 'none';
          }
        }
      }
    });

    // 검색창 외부 클릭 시 검색창 닫기 (모바일에서만)
    $(document).on('click', function (event) {
      if (isMobileView() &&
        !searchArea.contains(event.target) &&
        event.target !== magnifyingGlass) {
        searchArea.classList.remove('active');
        // 검색창 닫을 때 입력창도 숨김
        const searchInput = searchArea.querySelector('.search-input');
        if (searchInput) {
          searchInput.style.display = 'none';
        }
      }
    });

    // 화면 크기 변경 시 반응형 동작 처리
    $(window).on('resize', function () {
      if (!isMobileView()) {
        // 큰 화면에서는 검색창이 항상 보이도록 함
        searchArea.classList.remove('active');
        const searchInput = searchArea.querySelector('.search-input');
        if (searchInput) {
          searchInput.style.display = 'block';
        }
      } else if (!searchArea.classList.contains('active')) {
        // 작은 화면에서 검색이 활성화되지 않은 경우 입력란 숨김
        const searchInput = searchArea.querySelector('.search-input');
        if (searchInput) {
          searchInput.style.display = 'none';
        }
      }
    });

    // 페이지 로드 시 초기 화면 크기 확인
    if (isMobileView()) {
      // 초기 상태 설정 - 돋보기만 표시
      const searchInput = searchArea.querySelector('.search-input');
      if (searchInput) {
        searchInput.style.display = 'none';
      }
      searchArea.classList.remove('active');
    } else {
      // 큰 화면에서는 전체 검색창 표시
      searchArea.classList.remove('active'); // 클래스는 제거하지만
      const searchInput = searchArea.querySelector('.search-input');
      if (searchInput) {
        searchInput.style.display = 'block';
      }
    }

    console.log("모바일 검색 기능 초기화 완료");
  } else {
    console.error("검색 영역 또는 아이콘을 찾을 수 없습니다");
  }
}

// 로그아웃 버튼 초기화 함수
function initLogoutButton() {
  const logoutButton = document.getElementById('logout');

  if (logoutButton) {
    console.log('로그아웃 버튼 요소 찾음');

    logoutButton.addEventListener('click', function (event) {
      event.preventDefault(); // 기본 링크 동작 방지

      console.log('로그아웃 버튼 클릭됨');

      // 로컬 스토리지에서 토큰 제거
      localStorage.removeItem('spotify_access_token');

      // 세션 스토리지에서도 토큰 제거 (토큰이 세션 스토리지에 저장된 경우)
      sessionStorage.removeItem('spotify_access_token');

      console.log('로그아웃 완료: 토큰이 제거되었습니다.');

      // 로그인 페이지로 리다이렉트
      window.location.href = '/login/index.html';
    });

    console.log('로그아웃 버튼 이벤트 리스너 초기화 완료');
  } else {
    console.error('로그아웃 버튼을 찾을 수 없습니다');
  }
}