
// ============ 鍏ㄥ眬鐘舵€?============
const API_BASE = 'http://localhost:8080/api';
let currentUser = {
    id: null, nickname: '', gender: '', tags: [],
    studentId: '', realName: '', authStatus: 0, // 0鏈璇?1瀹℃牳涓?2宸茶璇?3琚嫆
    postCount: 0, joinCount: 0, creditScore: 100,
    token: null, submitTime: null
};

// 婀栧崡宸ヤ笟澶у瀛︾睄鏁版嵁搴擄紙瀛﹀彿+濮撳悕 閰嶅鎵嶈涓烘湁鏁堬級
const hutStudentDB = [
    { id: '2021010101', name: '寮犱紵' },
    { id: '2021010102', name: '鐜嬭姵' },
    { id: '2021020201', name: '鏉庡' },
    { id: '2021020202', name: '鍒樻磱' },
    { id: '2021030301', name: '闄堥潤' },
    { id: '2021030302', name: '鏉ㄥ竼' },
    { id: '2022010101', name: '璧电' },
    { id: '2022010102', name: '榛勬晱' },
    { id: '2022020201', name: '鍛ㄦ澃' },
    { id: '2022020202', name: '鍚撮潤' },
    { id: '2022030301', name: '寰愬己' },
    { id: '2022030302', name: '瀛欎附' },
    { id: '2023010101', name: '椹秴' },
    { id: '2023010102', name: '鏈辩惓' },
    { id: '2023020201', name: '鑳℃枌' },
    { id: '2023020202', name: '閮檽' },
    { id: '2023030301', name: '浣曡姵' },
    { id: '2023030302', name: '楂樿繙' },
    { id: '2024010101', name: '鏋楀嘲' },
    { id: '2024010102', name: '榛勮搲' }
];
let selectedGender = '';
let selectedTags = [];
let selectedType = '绾﹂キ';
let selectedMaxMembers = 3;
let uploadMocked = false;
let currentFilterType = '';

// 榛樿甯栧瓙锛堥娆¤闂娇鐢紝涔嬪悗浠?localStorage 鎭㈠锛?const defaultPosts = [
    { id: 1, publisherId: 1001, publisherNickname: '鏉庡皬鏄?, type: '绾﹂キ',
      description: '浜岄鍫傛柊寮€鐨勭伀閿呭簵锛屼腑鍗?2鐐规湁浜轰竴璧锋嫾妗屽悧锛熻繕宸?涓汉锛?,
      location: '浜岄鍫?, meet_time: new Date().toISOString(),
      current_members: 2, max_members: 4 },
    { id: 2, publisherId: 1002, publisherNickname: '鐜嬪皬绾?, type: '杩愬姩',
      description: '涓嬪崍4鐐逛綋鑲查鎵撶窘姣涚悆锛屾壘鎼瓙涓€璧凤紒姘村钩涓嶉檺锛屼富鎵撳揩涔愯繍鍔▇',
      location: '浣撹偛棣?, meet_time: new Date().toISOString(),
      current_members: 3, max_members: 4 },
    { id: 3, publisherId: 1003, publisherNickname: '寮犲皬鍒?, type: '娓告垙',
      description: '鏅氫笂寮€榛戞墦鐜嬭€咃紒閽荤煶娈典綅浠ヤ笂鏉ワ紝鐩爣涓婃槦鑰€锛屽啿鍐插啿锛?,
      location: '绾夸笂', meet_time: new Date().toISOString(),
      current_members: 3, max_members: 5 },
    { id: 4, publisherId: 1004, publisherNickname: '闄堝皬缇?, type: '鑷範',
      description: '鏄庡ぉ涓婂崍鍥句功棣嗚嚜涔狅紝鍑嗗鏈熸湯鑰冭瘯锛屾壘涓涔犳惌瀛愪簰鐩哥洃鐫ｏ紒',
      location: '鍥句功棣?妤?, meet_time: new Date().toISOString(),
      current_members: 1, max_members: 2 }
];

// 浠?localStorage 鍔犺浇甯栧瓙鏁版嵁锛堥娆¤闂敤榛樿鍊硷級
(function loadPostsData() {
    try {
        const savedPosts = localStorage.getItem('campusBuddyPosts');
        window.mockPosts = savedPosts ? JSON.parse(savedPosts) : defaultPosts;
    } catch (e) { window.mockPosts = defaultPosts; }
    try {
        const savedApps = localStorage.getItem('campusBuddyApplications');
        window.myApplications = savedApps ? JSON.parse(savedApps) : [];
    } catch (e) { window.myApplications = []; }
    try {
        const savedInvs = localStorage.getItem('campusBuddyInvitations');
        window.myInvitations = savedInvs ? JSON.parse(savedInvs) : [];
    } catch (e) { window.myInvitations = []; }
    // 鍔犺浇濂藉弸鍜屾秷鎭?    try {
        const savedFriends = localStorage.getItem('campusBuddyFriends');
        window.friends = savedFriends ? JSON.parse(savedFriends) : [];
    } catch (e) { window.friends = []; }
    try {
        const savedMessages = localStorage.getItem('campusBuddyMessages');
        window.messages = savedMessages ? JSON.parse(savedMessages) : [];
    } catch (e) { window.messages = []; }
})();

// 淇濆瓨甯栧瓙/鐢宠/閭€绾︽暟鎹埌 localStorage
function savePostsData() {
    try {
        localStorage.setItem('campusBuddyPosts', JSON.stringify(window.mockPosts || []));
        localStorage.setItem('campusBuddyApplications', JSON.stringify(window.myApplications || []));
        localStorage.setItem('campusBuddyInvitations', JSON.stringify(window.myInvitations || []));
        localStorage.setItem('campusBuddyFriends', JSON.stringify(window.friends || []));
        localStorage.setItem('campusBuddyMessages', JSON.stringify(window.messages || []));
    } catch (e) {}
}

// ============ 鍒濆鍖?============
document.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('campusBuddyUser');
    if (saved) {
        try { currentUser = { ...currentUser, ...JSON.parse(saved) }; } catch (e) {}
    }
    routeByUserState();
    // 瀛楁暟缁熻
    const desc = document.getElementById('description');
    if (desc) desc.addEventListener('input', () => {
        document.getElementById('charCount').textContent = desc.value.length;
    });
});

// 鏍规嵁鐢ㄦ埛鐘舵€佽矾鐢憋紙鏃犵櫥褰曢〉闈紝鐩存帴鐢熸垚鐢ㄦ埛 ID锛?function routeByUserState() {
    if (!currentUser.id) {
        currentUser.id = Math.floor(Math.random() * 1000000);
        currentUser.token = 'user-' + currentUser.id;
        saveUserState();
    }
    if (!currentUser.nickname) { showPage('profileEditPage'); return; }
    if (currentUser.authStatus === 0 || currentUser.authStatus === 3) { showPage('authPage'); return; }
    if (currentUser.authStatus === 1) { showPage('pendingPage'); refreshPendingPage(); return; }
    // 宸茶璇?    showPage('homePage');
    loadPosts();
    refreshProfilePage();
}

// ============ 閫氱敤锛氭樉绀洪〉闈?============
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const page = document.getElementById(pageId);
    page.classList.add('active');
    // 搴曢儴瀵艰埅浠呭湪骞垮満鍜屼釜浜轰腑蹇冩樉绀?    const nav = document.getElementById('bottomNav');
    if (pageId === 'homePage' || pageId === 'profilePage') {
        nav.classList.remove('hidden');
    } else {
        nav.classList.add('hidden');
    }
    window.scrollTo(0, 0);
}

function switchNav(el, pageId) {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
    if (pageId) {
        showPage(pageId);
        if (pageId === 'profilePage') refreshProfilePage();
        if (pageId === 'homePage') loadPosts();
    } else {
        showToast('鍔熻兘寮€鍙戜腑');
    }
}

function showPublish() {
    if (currentUser.authStatus !== 2) {
        showToast('璇峰厛瀹屾垚瀛﹀彿璁よ瘉鍚庡啀鍙戝竷');
        return;
    }
    showPage('publishPage');
}

function goBack(fromPage) {
    if (fromPage === 'profileEditPage') {
        currentUser = {};
        saveUserState();
    }
    routeByUserState();
}

// ============ Toast ============
function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.style.display = 'block';
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => t.style.display = 'none', 1800);
}

function saveUserState() {
    localStorage.setItem('campusBuddyUser', JSON.stringify(currentUser));
}

// 绠€鍖栫櫥褰曪細鑷姩鐢熸垚鐢ㄦ埛 ID锛屾棤闇€寰俊鐧诲綍鎸夐挳
async function wxLogin() {
    if (!currentUser.id) {
        currentUser.id = Math.floor(Math.random() * 1000000);
        currentUser.token = 'user-' + currentUser.id;
        saveUserState();
    }
    routeByUserState();
}

// ============ 2. 濉啓涓汉淇℃伅 ============
function selectGender(el) {
    document.querySelectorAll('.gender-option').forEach(o => o.classList.remove('selected'));
    el.classList.add('selected');
    selectedGender = el.dataset.gender;
}
function toggleTag(el) {
    const tag = el.dataset.tag;
    if (el.classList.contains('selected')) {
        el.classList.remove('selected');
        selectedTags = selectedTags.filter(t => t !== tag);
    } else {
        el.classList.add('selected');
        selectedTags.push(tag);
    }
}
async function submitProfile() {
    const nickname = document.getElementById('nicknameInput').value.trim();
    if (nickname.length < 2) { showToast('璇峰～鍐欐樀绉帮紙鑷冲皯2瀛楋級'); return; }
    if (!selectedGender) { showToast('璇烽€夋嫨鎬у埆'); return; }
    if (selectedTags.length === 0) { showToast('璇疯嚦灏戦€夋嫨1涓叴瓒ｆ爣绛?); return; }

    currentUser.nickname = nickname;
    currentUser.gender = selectedGender;
    currentUser.tags = [...selectedTags];
    saveUserState();

    try {
        await fetch(`${API_BASE}/user/profile`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${currentUser.token}`},
            body: JSON.stringify({ nickname, gender: selectedGender, tags: selectedTags.join(',') })
        });
    } catch (e) {}

    showToast('淇℃伅宸蹭繚瀛?);
    setTimeout(() => showPage('authPage'), 600);
}

// ============ 3. 璁よ瘉鎻愪氦 ============
function simulateUpload() {
    const box = document.getElementById('uploadBox');
    box.innerHTML = '<div style="padding: 20px; text-align: center;">' +
        '<div style="font-size: 50px;">鉁?/div>' +
        '<div style="font-weight: 700; color: #4a5568; margin-top: 10px;">鏍″洯鍗″凡涓婁紶</div>' +
        '<div style="font-size: 12px; color: #718096; margin-top: 8px;">锛堟紨绀烘ā寮忥細鐓х墖宸插姞瀵嗕繚瀛橈級</div>' +
        '</div>';
    box.style.border = '2px solid #48bb78';
    box.style.background = 'linear-gradient(135deg, #f0fff4, #e6fffa)';
    uploadMocked = true;
    showToast('鐓х墖涓婁紶鎴愬姛');
}
// 鍒ゆ柇瀛﹀彿+濮撳悕鏄惁鍖归厤婀栧崡宸ヤ笟澶у瀛︾睄锛堝鏉惧尮閰嶏級
function isValidHUTStudent(studentId, realName) {
    if (!studentId || !realName) return false;
    const normalizedId = studentId.trim().replace(/\s+/g, '').replace(/\./g, '');
    const normalizedName = realName.trim();
    return hutStudentDB.some(s => s.id === normalizedId && s.name === normalizedName);
}

// 杩涘叆璁よ瘉椤垫椂棰勫～鍏呯敤鎴蜂箣鍓嶅～杩囩殑瀛﹀彿鍜屽鍚?function prefillAuthFields() {
    const nameInput = document.getElementById('realNameInput');
    const idInput = document.getElementById('studentIdInput');
    if (nameInput && currentUser.realName) nameInput.value = currentUser.realName;
    if (idInput && currentUser.studentId) idInput.value = currentUser.studentId;
}

async function submitAuth() {
    const studentId = document.getElementById('studentIdInput').value.trim();
    const realName = document.getElementById('realNameInput').value.trim();
    if (!realName) { showToast('鉂?璇疯緭鍏ョ湡瀹炲鍚?); return; }
    if (!studentId) { showToast('鉂?璇疯緭鍏ュ鍙?); return; }
    if (!uploadMocked) { showToast('鉂?璇风偣鍑讳笂鏂广€屼笂浼犳牎鍥崱鐓х墖銆嶇殑鍖哄煙'); return; }

    currentUser.studentId = studentId;
    currentUser.realName = realName;
    currentUser.authStatus = 1;
    currentUser.submitTime = new Date().toISOString();
    saveUserState();

    try {
        await fetch(`${API_BASE}/user/auth`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${currentUser.token}`},
            body: JSON.stringify({ studentId, realName })
        });
    } catch (e) {}

    showToast('璁よ瘉淇℃伅宸叉彁浜?);
    setTimeout(() => {
        showPage('pendingPage');
        refreshPendingPage();
        // 3绉掑悗妯℃嫙浜哄伐瀹℃牳缁撴灉 - 鏍规嵁瀛︽牎鑷姩鍒ゆ柇
        setTimeout(() => manualReview(), 3500);
    }, 600);
}

// 浜哄伐瀹℃牳锛氬鍙?濮撳悕蹇呴』鍖归厤婀栧崡宸ヤ笟澶у瀛︾睄搴?function manualReview() {
    if (currentUser.authStatus !== 1) return;
    if (isValidHUTStudent(currentUser.studentId, currentUser.realName)) {
        currentUser.authStatus = 2; // 瀹℃牳閫氳繃
        saveUserState();
        refreshPendingPage();
        showToast('馃帀 鎭枩锛佽璇侀€氳繃');
    } else {
        currentUser.authStatus = 3; // 瀹℃牳鎷掔粷 - 瀛﹀彿濮撳悕涓嶅尮閰?        saveUserState();
        refreshPendingPage();
    }
}

function refreshPendingPage() {
    document.getElementById('submittedStudentId').textContent =
        currentUser.studentId ? maskStudentId(currentUser.studentId) : '鈥?;
    document.getElementById('submittedRealName').textContent = currentUser.realName || '鈥?;
    document.getElementById('submitTime').textContent =
        currentUser.submitTime ? formatDateTime(currentUser.submitTime) : '鈥?;

    const badge = document.getElementById('statusBadge');
    const title = document.getElementById('pendingTitle');
    const desc = document.getElementById('pendingDesc');
    const icon = document.getElementById('pendingIcon');
    const continueBtn = document.getElementById('pendingContinueBtn');
    const backBtn = document.getElementById('pendingBackBtn');
    const mockBtn = document.getElementById('pendingMockBtn');
    const rejectRow = document.getElementById('rejectReasonRow');

    if (currentUser.authStatus === 1) {
        badge.textContent = '瀹℃牳涓?; badge.className = 'status-badge pending';
        title.textContent = '璁よ瘉瀹℃牳涓?;
        desc.innerHTML = '鎮ㄧ殑璁よ瘉淇℃伅宸叉彁浜わ紝姝ｅ湪浜哄伐瀹℃牳涓€?br>閫氬父闇€瑕?1-5 鍒嗛挓';
        icon.textContent = '鈴?;
        continueBtn.style.display = 'none';
        backBtn.style.display = 'none';
        if (rejectRow) rejectRow.style.display = 'none';
    } else if (currentUser.authStatus === 2) {
        badge.textContent = '鉁?宸查€氳繃'; badge.className = 'status-badge approved';
        title.textContent = '馃帀 璁よ瘉閫氳繃锛?;
        desc.innerHTML = '鎭枩锛屾偍宸插畬鎴愬鍙疯璇侊紒<br>鐜板湪鍙互瀹屾暣浣跨敤鏍″洯鎼瓙鐨勬墍鏈夊姛鑳?;
        icon.textContent = '鉁?;
        continueBtn.style.display = 'block';
        backBtn.style.display = 'none';
        if (mockBtn) mockBtn.style.display = 'none';
        if (rejectRow) rejectRow.style.display = 'none';
    } else if (currentUser.authStatus === 3) {
        badge.textContent = '宸叉嫆缁?; badge.className = 'status-badge rejected';
        title.textContent = '鉂?璁よ瘉鏈€氳繃';
        desc.innerHTML = '寰堟姳姝夛紒鏈钩鍙?strong style="color:#ff4d4f;">浠呴潰鍚戞箹鍗楀伐涓氬ぇ瀛﹀湪鏍″笀鐢熷紑鏀?/strong>銆?br>璇风‘璁ゆ偍鐨勫鍙蜂笌鐪熷疄濮撳悕鏄惁鍖归厤鍚庨噸鏂版彁浜よ璇併€?;
        icon.textContent = '鉀?;
        continueBtn.style.display = 'none';
        backBtn.style.display = 'block';
        if (mockBtn) mockBtn.style.display = 'none';
        if (rejectRow) rejectRow.style.display = 'flex';
    }
}

function continueToHome() {
    refreshProfilePage();
    showPage('homePage');
    loadPosts();
    showToast('娆㈣繋鍔犲叆鏍″洯鎼瓙锛?);
}

function backToAuth() {
    // 閲嶇疆璁よ瘉鐘舵€侊紝杩斿洖璁よ瘉椤甸噸鏂板～鍐?    currentUser.authStatus = 0;
    saveUserState();
    showPage('authPage');
    // 閲嶇疆鐓х墖涓婁紶鐘舵€侊紝璁╃敤鎴烽噸鏂版搷浣?    uploadMocked = false;
    const box = document.getElementById('uploadBox');
    if (box) {
        box.innerHTML = '<div class="upload-icon">馃摲</div><div class="upload-text">鐐瑰嚮涓婁紶鏍″洯鍗＄収鐗?/div><div class="upload-sub">鏀寔 JPG/PNG 鏍煎紡</div>';
    }
}

// ============ 4. 骞垮満椤?============
function filterByType(el) {
    document.querySelectorAll('.category-tag').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    currentFilterType = el.dataset.type;
    renderPosts(window.mockPosts || []);
}
function loadPosts() {
    try {
        fetch(`${API_BASE}/post/list`, { headers: {'Authorization': `Bearer ${currentUser.token}`} })
            .then(r => r.json()).then(r => {
                if (r && r.code === 200 && r.data && r.data.length > 0) {
                    renderPosts(r.data);
                } else {
                    renderPosts(window.mockPosts || []);
                }
            }).catch(() => renderPosts(window.mockPosts || []));
    } catch (e) { renderPosts(window.mockPosts || []); }
}
function renderPosts(posts) {
    const container = document.getElementById('postList');
    const filtered = currentFilterType ? posts.filter(p => p.type === currentFilterType) : posts;
    if (!filtered || filtered.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-icon">馃攳</div><p>鏆傛棤鐩稿叧鎼瓙</p><p style="margin-top:5px;">鐐瑰嚮 + 鍙戝竷涓€涓惂~</p></div>`;
        return;
    }
    container.innerHTML = filtered.map(post => {
        const typeClass = getTypeClass(post.type);
        const isFull = post.current_members >= post.max_members;
        const isMine = post.publisherId === currentUser.id;
        let actionBtn;
        if (isMine) {
            actionBtn = `<button class="apply-btn applied" onclick="showToast('杩欐槸浣犲彂甯冪殑鎼瓙')">馃懁 鎴戝彂甯冪殑</button>`;
        } else if (isFull) {
            actionBtn = `<button class="apply-btn applied" disabled>宸叉弧鍛?/button>`;
        } else {
            actionBtn = `<button class="apply-btn" onclick="applyPost(${post.id}, this)">鉁?鎴戞兂鍘?/button>`;
        }
        return `
        <div class="post-card">
            <div class="post-header">
                <div class="avatar">${post.publisherNickname ? post.publisherNickname.charAt(0) : '?'}</div>
                <div class="user-info">
                    <div class="nickname">${post.publisherNickname || '鍖垮悕'}</div>
                    <div class="post-meta">${formatTime(post.create_time || post.meet_time)} 路 ${post.location || ''}</div>
                </div>
                <span class="type-tag ${typeClass}">${post.type}</span>
            </div>
            <div class="post-content">${post.description}</div>
            <div class="post-info">
                <span>馃晲 ${formatMeetTime(post.meet_time)}</span>
                <span>馃搷 ${post.location || '寰呭畾'}</span>
                <span class="member-count">馃懃 ${post.current_members}/${post.max_members}浜?/span>
                ${actionBtn}
            </div>
        </div>`;
    }).join('');
}
function getTypeClass(type) {
    return { '绾﹂キ': 'food', '杩愬姩': 'sport', '娓告垙': 'game', '鑷範': 'study' }[type] || 'food';
}
// 宸茶鍚庣画鐨勫悓鍚嶅嚱鏁拌鐩栵紝璇锋煡鐪嬩笅鏂?applyPost 瀹炵幇

// ============ 5. 鍙戝竷鎼瓙 ============
function selectType(el) {
    document.querySelectorAll('.type-option').forEach(o => o.classList.remove('selected'));
    el.classList.add('selected');
    selectedType = el.dataset.type;
}
function selectMaxMembers(el) {
    document.querySelectorAll('.member-option').forEach(o => o.classList.remove('selected'));
    el.classList.add('selected');
    selectedMaxMembers = parseInt(el.dataset.max);
}
// 宸茶鍚庣画鐨勫悓鍚嶅嚱鏁拌鐩栵紝璇锋煡鐪嬩笅鏂?submitPost 瀹炵幇

// ============ 6. 涓汉涓績 ============
function refreshProfilePage() {
    document.getElementById('profileAvatar').textContent = currentUser.nickname ? currentUser.nickname.charAt(0) : '鎴?;
    document.getElementById('profileName').textContent = currentUser.nickname || '鏈櫥褰?;

    const authBox = document.getElementById('profileAuthStatus');
    const authBadge = document.getElementById('profileAuthBadge');
    if (currentUser.authStatus === 2) {
        authBox.innerHTML = `<div class="auth-status-line approved"><span>鉁?/span><span>宸插畬鎴愬鍙疯璇?路 婀栧崡宸ヤ笟澶у</span></div>`;
        authBadge.textContent = '宸茶璇?;
        authBadge.style.background = '#f6ffed'; authBadge.style.color = '#52c41a';
    } else if (currentUser.authStatus === 1) {
        authBox.innerHTML = `<div class="auth-status-line unverified" onclick="showPage('pendingPage')"><span>鈴?/span><span>璁よ瘉瀹℃牳涓?/span></div>`;
        authBadge.textContent = '瀹℃牳涓?;
        authBadge.style.background = '#fff7e6'; authBadge.style.color = '#fa8c16';
    } else if (currentUser.authStatus === 3) {
        authBox.innerHTML = `<div class="auth-status-line unverified" onclick="startAuthFlow()"><span>鉀?/span><span>璁よ瘉鏈€氳繃锛堜粎婀栧伐澶у笀鐢燂級锛岀偣鍑婚噸璇?/span></div>`;
        authBadge.textContent = '鏈€氳繃';
        authBadge.style.background = '#fff1f0'; authBadge.style.color = '#ff4d4f';
    } else {
        authBox.innerHTML = `<div class="auth-status-line unverified" onclick="startAuthFlow()"><span>鈿狅笍</span><span>鏈畬鎴愯璇侊紝鐐瑰嚮瀹屽杽</span></div>`;
        authBadge.textContent = '鍘昏璇?;
        authBadge.style.background = '#fff1f0'; authBadge.style.color = '#ff4d4f';
    }

    document.getElementById('postCount').textContent = currentUser.postCount || 0;
    document.getElementById('joinCount').textContent = currentUser.joinCount || 0;
    document.getElementById('myPostCount').textContent = (currentUser.postCount || 0) + ' 鏉?;
    const friendsCountEl = document.getElementById('friendsCount');
    if (friendsCountEl) friendsCountEl.textContent = (window.friends || []).length || '0';

    const tagBox = document.getElementById('myTags');
    if (currentUser.tags && currentUser.tags.length > 0) {
        tagBox.innerHTML = currentUser.tags.map(t =>
            `<span style="background:#e8f4fd;color:#1890ff;padding:5px 12px;border-radius:15px;font-size:12px;">${t}</span>`
        ).join('');
    }
}
function startAuthFlow() {
    if (!currentUser.id) { routeByUserState(); return; }
    if (!currentUser.nickname) { showPage('profileEditPage'); return; }
    showPage('authPage');
}
function logout() {
    localStorage.removeItem('campusBuddyUser');
    currentUser = {
        id: null, nickname: '', gender: '', tags: [],
        studentId: '', realName: '', authStatus: 0,
        postCount: 0, joinCount: 0, creditScore: 100,
        token: null, submitTime: null
    };
    selectedGender = ''; selectedTags = []; uploadMocked = false;
    showToast('宸查€€鍑虹櫥褰?);
    setTimeout(() => routeByUserState(), 500);
}

// ============ 宸ュ叿鍑芥暟 ============
function maskStudentId(id) {
    if (!id || id.length <= 4) return id;
    return id.substring(0, 2) + '****' + id.substring(id.length - 2);
}
function formatDateTime(str) {
    if (!str) return '';
    const d = new Date(str);
    return `${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}
function formatTime(str) {
    if (!str) return '';
    const diff = Math.floor((Date.now() - new Date(str).getTime()) / 60000);
    if (diff < 5) return '鍒氬垰';
    if (diff < 60) return diff + '鍒嗛挓鍓?;
    if (diff < 1440) return Math.floor(diff/60) + '灏忔椂鍓?;
    return Math.floor(diff/1440) + '澶╁墠';
}
function formatMeetTime(str) {
    if (!str) return '寰呭畾';
    const d = new Date(str);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) {
        return '浠婂ぉ ' + String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
    }
    return (d.getMonth()+1) + '/' + d.getDate() + ' ' + String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
}

// ============================================================
// 鎵╁睍 showPage锛氳繘鍏ユ柊椤甸潰鏃惰嚜鍔ㄥ埛鏂版暟鎹?// ============================================================
const originalShowPage = window.showPage;
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    const nav = document.getElementById('bottomNav');
    if (pageId === 'homePage' || pageId === 'profilePage') {
        nav.classList.remove('hidden');
    } else {
        nav.classList.add('hidden');
    }
    if (pageId === 'myPostsPage') refreshMyPosts();
    if (pageId === 'myApplicationsPage') refreshMyApplications('pending');
    if (pageId === 'myInvitationsPage') refreshMyInvitations();
    if (pageId === 'authDetailPage') refreshAuthDetail();
    if (pageId === 'settingsPage') refreshSettingsPage();
    if (pageId === 'friendsPage') refreshFriendsPage();
    // 杩涘叆璁よ瘉椤垫椂閲嶇疆涓婁紶妗嗙姸鎬佸苟棰勫～瀛﹀彿/濮撳悕
    if (pageId === 'authPage') {
        uploadMocked = false;
        const box = document.getElementById('uploadBox');
        if (box) {
            box.innerHTML = '<div style="font-size: 40px;">馃摲</div>' +
                '<div style="font-weight: 700; color: #667eea; margin-top: 10px;">猬?鐐硅繖閲?鉃?涓婁紶鏍″洯鍗＄収鐗?/div>' +
                '<div style="font-size: 12px; color: #718096; margin-top: 8px;">锛堟紨绀虹幆澧冿細鐐瑰嚮鍗虫ā鎷熶笂浼犳垚鍔燂級</div>';
            box.style.border = '2px dashed #667eea';
            box.style.background = 'linear-gradient(135deg, #f5f7ff, #fef8ff)';
        }
        prefillAuthFields();
    }
    window.scrollTo(0, 0);
}

function showHomeFromSide() { showPage('homePage'); }

// ============================================================
// 鎴戠殑鍙戝竷 - 鏄剧ず鐢ㄦ埛鍙戝竷杩囩殑鎼瓙
// ============================================================
function refreshMyPosts() {
    const list = document.getElementById('myPostsList');
    const myPosts = (window.mockPosts || []).filter(p => p.publisherId === currentUser.id);
    if (!myPosts || myPosts.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">馃摑</div>
                <p>杩樻病鏈夊彂甯冭繃鎼瓙</p>
                <p style="font-size:12px;margin-top:5px;">鐐瑰嚮涓嬫柟鎸夐挳锛屽幓鍙戝竷绗竴涓惂</p>
                <button class="primary-btn-sm" onclick="showPublish()">+ 鍙戝竷鏂版惌瀛?/button>
            </div>`;
        return;
    }
    list.innerHTML = myPosts.map(post => {
        const typeClass = getTypeClass(post.type);
        return `
        <div class="post-card">
            <div class="post-header">
                <div class="avatar">${post.publisherNickname ? post.publisherNickname.charAt(0) : '?'}</div>
                <div class="user-info">
                    <div class="nickname">${post.publisherNickname || '鍖垮悕'}</div>
                    <div class="post-meta">${formatTime(post.create_time || post.meet_time)} 路 ${post.location || ''}</div>
                </div>
                <span class="type-tag ${typeClass}">${post.type}</span>
            </div>
            <div class="post-content">${post.description}</div>
            <div class="post-info">
                <span>馃晲 ${formatMeetTime(post.meet_time)}</span>
                <span class="member-count">馃懃 ${post.current_members || 1}/${post.max_members}浜?/span>
                <button class="primary-btn-sm" style="margin-top:0;padding:6px 14px;background:#fff;color:#ff4d4f;border:1.5px solid #ff4d4f;box-shadow:none;font-size:12px;" onclick="deletePost(${post.id})">馃棏 鍒犻櫎</button>
            </div>
        </div>`;
    }).join('');
}

function deletePost(postId) {
    if (!confirm('纭畾瑕佸垹闄よ繖鏉℃惌瀛愬悧锛?)) return;
    if (window.mockPosts) {
        window.mockPosts = window.mockPosts.filter(p => p.id !== postId);
    }
    // 鍚屾椂鍒犻櫎涓庤甯栧瓙鐩稿叧鐨勯個绾﹀拰鐢宠
    if (window.myInvitations) {
        window.myInvitations = window.myInvitations.filter(inv => inv.postId !== postId);
    }
    if (window.myApplications) {
        window.myApplications = window.myApplications.filter(a => a.postId !== postId);
    }
    currentUser.postCount = (currentUser.postCount || 0) > 0 ? (currentUser.postCount - 1) : 0;
    saveUserState();
    savePostsData();
    showToast('宸插垹闄?);
    refreshMyPosts();
    loadPosts();
    refreshProfilePage();
}
}

// ============================================================
// 鎴戠殑鐢宠 - 鏄剧ず鐢ㄦ埛鐢宠鍔犲叆杩囩殑鎼瓙锛堝垎鐘舵€佹爣绛鹃〉锛?// ============================================================
let currentApplicationsTab = 'pending';
function switchApplicationTab(el) {
    document.querySelectorAll('#applicationTabs .tab-item').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    currentApplicationsTab = el.dataset.tab;
    refreshMyApplications(currentApplicationsTab);
}

function refreshMyApplications(tab) {
    const list = document.getElementById('myApplicationsList');
    // 鍙樉绀哄綋鍓嶇敤鎴峰彂鍑虹殑鐢宠锛堟寜 applicantId 杩囨护锛?    const apps = (window.myApplications || []).filter(a => a.applicantId === currentUser.id && a.status === tab);
    if (!apps || apps.length === 0) {
        let emptyMsg = '鏆傛棤鐢宠璁板綍';
        if (tab === 'approved') emptyMsg = '娌℃湁宸查€氳繃鐨勭敵璇?;
        if (tab === 'rejected') emptyMsg = '娌℃湁琚嫆缁濈殑鐢宠';
        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">${tab === 'approved' ? '鉁? : tab === 'rejected' ? '鉂? : '馃搵'}</div>
                <p>${emptyMsg}</p>
                <p style="font-size:12px;margin-top:5px;">鍘诲箍鍦洪〉鐪嬬湅鏈夊摢浜涙劅鍏磋叮鐨勬惌瀛?/p>
                <button class="primary-btn-sm" onclick="showPage('homePage')">鍘诲箍鍦洪€涢€?/button>
            </div>`;
        return;
    }
    list.innerHTML = apps.map(app => {
        const typeClass = getTypeClass(app.type);
        let statusHtml = '';
        if (tab === 'pending') statusHtml = '<span class="status-badge pending">绛夊緟瀹℃牳</span>';
        if (tab === 'approved') statusHtml = '<span class="status-badge approved">宸查€氳繃</span>';
        if (tab === 'rejected') statusHtml = '<span class="status-badge rejected">宸叉嫆缁?/span>';
        let actionHtml = '';
        if (tab === 'pending') actionHtml = `<button class="primary-btn-sm" style="margin-top:0;padding:6px 14px;background:#fff;color:#ff4d4f;border:1.5px solid #ff4d4f;box-shadow:none;font-size:12px;" onclick="withdrawApplication(${app.id})">鈫?鎾ゅ洖鐢宠</button>`;
        if (tab === 'approved') actionHtml = `<button class="primary-btn-sm" style="margin-top:0;padding:6px 14px;background:linear-gradient(135deg,#722ed1,#531dab);" onclick="startChat('${app.publisherId || 'pub'}', '${app.publisherNickname || '鍙戝竷鑰?}')">馃挰 鑱旂郴鍙戝竷鑰?/button>`;
        return `
        <div class="post-card">
            <div class="post-header">
                <div class="avatar">${app.publisherNickname ? app.publisherNickname.charAt(0) : '?'}</div>
                <div class="user-info">
                    <div class="nickname">${app.publisherNickname || '鍖垮悕'}</div>
                    <div class="post-meta">${formatTime(app.applyTime)} 鐢宠鍔犲叆</div>
                </div>
                <span class="type-tag ${typeClass}">${app.type}</span>
            </div>
            <div class="post-content">${app.description}</div>
            <div class="post-info">
                <span>馃搷 ${app.location || '寰呭畾'}</span>
                ${statusHtml}
                ${actionHtml}
            </div>
        </div>`;
    }).join('');
}

function withdrawApplication(appId) {
    if (!confirm('纭畾瑕佹挙鍥炶繖鏉＄敵璇峰悧锛?)) return;
    if (window.myApplications) {
        window.myApplications = window.myApplications.filter(a => a.id !== appId);
    }
    if (window.myInvitations) {
        window.myInvitations = window.myInvitations.filter(inv => inv.id !== appId);
    }
    currentUser.joinCount = (currentUser.joinCount || 0) > 0 ? (currentUser.joinCount - 1) : 0;
    saveUserState();
    savePostsData();
    showToast('宸叉挙鍥炵敵璇?);
    refreshMyApplications('pending');
    refreshProfilePage();
}

// ============================================================
// 鎴戠殑閭€绾?- 鏄剧ず鍒汉鐢宠鍔犲叆鎴戝彂甯冪殑鎼瓙
// ============================================================
function refreshMyInvitations() {
    const list = document.getElementById('myInvitationsList');
    const invs = (window.myInvitations || []).filter(inv => inv.publisherId === currentUser.id);
    if (!invs || invs.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">馃搮</div>
                <p>鏆傛棤閭€绾﹁姹?/p>
                <p style="font-size:12px;margin-top:5px;">褰撴湁浜虹敵璇峰姞鍏ヤ綘鍙戝竷鐨勬惌瀛愭椂锛屼細鏄剧ず鍦ㄨ繖閲?/p>
                <button class="primary-btn-sm" onclick="showPublish()">鍘诲彂甯冩惌瀛?/button>
            </div>`;
        return;
    }
    list.innerHTML = invs.map(inv => {
        let statusTag = '';
        let actionHtml = '';
        if (inv.status === 'pending') {
            statusTag = '<span style="background:#fff7e6;color:#ff9800;padding:4px 10px;border-radius:10px;font-size:11px;font-weight:600;">寰呭鐞?/span>';
            actionHtml = `
                <button class="primary-btn-sm" style="margin-top:0;padding:8px 18px;background:linear-gradient(135deg,#52c41a,#389e0d);box-shadow:0 2px 10px rgba(82,196,26,0.3);" onclick="respondInvitation(${inv.id}, true)">鉁?鍚屾剰</button>
                <button class="primary-btn-sm" style="margin-top:0;padding:8px 18px;background:#fff;color:#ff4d4f;border:1.5px solid #ff4d4f;box-shadow:none;" onclick="respondInvitation(${inv.id}, false)">鉁?鎷掔粷</button>`;
        } else if (inv.status === 'approved') {
            statusTag = '<span style="background:#f6ffed;color:#52c41a;padding:4px 10px;border-radius:10px;font-size:11px;font-weight:600;">宸插悓鎰?/span>';
            actionHtml = `
                <button class="primary-btn-sm" style="margin-top:0;padding:8px 18px;background:linear-gradient(135deg,#1677ff,#0958d9);box-shadow:0 2px 10px rgba(22,119,255,0.3);" onclick="addFriend(${inv.applicantId}, '${inv.applicantName}')">馃懃 鍔犲ソ鍙?/button>
                <button class="primary-btn-sm" style="margin-top:0;padding:8px 18px;background:linear-gradient(135deg,#722ed1,#531dab);box-shadow:0 2px 10px rgba(114,46,209,0.3);" onclick="startChat(${inv.applicantId}, '${inv.applicantName}')">馃挰 鍙戞秷鎭?/button>`;
        } else {
            statusTag = '<span style="background:#fff1f0;color:#ff4d4f;padding:4px 10px;border-radius:10px;font-size:11px;font-weight:600;">宸叉嫆缁?/span>';
            actionHtml = '<span style="color:#999;font-size:12px;">宸叉嫆缁濊鐢宠</span>';
        }
        return `
        <div class="post-card">
            <div class="post-header">
                <div class="avatar">${inv.applicantName ? inv.applicantName.charAt(0) : '?'}</div>
                <div class="user-info">
                    <div class="nickname">${inv.applicantName || '鍖垮悕鐢ㄦ埛'}</div>
                    <div class="post-meta">${formatTime(inv.applyTime)} 鐢宠鍔犲叆 路 浣犲彂甯冪殑</div>
                </div>
                ${statusTag}
            </div>
            <div class="post-content">${inv.postTitle || inv.description}</div>
            <div class="post-info">
                <span>馃搷 ${inv.location || '寰呭畾'}</span>
                ${actionHtml}
            </div>
        </div>`;
    }).join('');
}

function respondInvitation(id, accept) {
    if (!window.myInvitations) return;
    const inv = window.myInvitations.find(i => i.id === id);
    if (inv) inv.status = accept ? 'approved' : 'rejected';
    savePostsData();
    showToast(accept ? '宸插悓鎰忚鐢ㄦ埛鍔犲叆' : '宸叉嫆缁濊鐢宠');
    refreshMyInvitations();
}

// ============================================================
// 瀛﹀彿璁よ瘉璇︽儏椤?- 鏍规嵁鐢ㄦ埛褰撳墠璁よ瘉鐘舵€佹樉绀轰笉鍚屼俊鎭?// ============================================================
function refreshAuthDetail() {
    const card = document.getElementById('authStatusCard');
    const icon = document.getElementById('authStatusIcon');
    const title = document.getElementById('authStatusTitle');
    const desc = document.getElementById('authStatusDesc');
    const actionBtn = document.getElementById('authDetailActionBtn');
    const realNameVal = document.getElementById('authRealNameValue');
    const studentIdVal = document.getElementById('authStudentIdValue');
    const submitTimeVal = document.getElementById('authSubmitTimeValue');
    const approvedTimeVal = document.getElementById('authApprovedTimeValue');

    card.className = 'auth-status-card';

    if (currentUser.authStatus === 0 || !currentUser.authStatus) {
        // 鏈璇?        icon.textContent = '鈿狅笍';
        title.textContent = '灏氭湭鎻愪氦璁よ瘉';
        desc.innerHTML = '璇峰噯澶囧ソ鎮ㄧ殑瀛﹀彿鍜岀湡瀹炲鍚嶏紝璁よ瘉閫氳繃鍚庢柟鍙彂甯冨拰鍔犲叆鎼瓙';
        actionBtn.style.display = 'block';
        actionBtn.textContent = '鍘绘彁浜よ璇?;
        actionBtn.onclick = startAuthFlow;
        realNameVal.textContent = '鈥?;
        studentIdVal.textContent = '鈥?;
        submitTimeVal.textContent = '鈥?;
        approvedTimeVal.textContent = '鈥?;
    } else if (currentUser.authStatus === 1) {
        // 瀹℃牳涓?        icon.textContent = '鈴?;
        title.textContent = '璁よ瘉瀹℃牳涓?;
        desc.innerHTML = '鎮ㄧ殑淇℃伅宸叉彁浜わ紝姝ｅ湪鏍告煡瀛︾睄<br>閫氬父闇€瑕?1-2 鍒嗛挓';
        actionBtn.style.display = 'block';
        actionBtn.textContent = '[婕旂ず] 妯℃嫙瀹℃牳閫氳繃';
        actionBtn.onclick = function() { manualReview(); showPage('authDetailPage'); };
        realNameVal.textContent = currentUser.realName || '鈥?;
        studentIdVal.textContent = currentUser.studentId ? maskStudentId(currentUser.studentId) : '鈥?;
        submitTimeVal.textContent = currentUser.submitTime ? formatDateTime(currentUser.submitTime) : '鈥?;
        approvedTimeVal.textContent = '鈥?;
    } else if (currentUser.authStatus === 2) {
        // 宸查€氳繃
        card.classList.add('approved');
        icon.textContent = '鉁?;
        title.textContent = '馃帀 璁よ瘉宸查€氳繃';
        desc.innerHTML = '鎭枩锛佹偍宸查€氳繃瀛﹀彿璁よ瘉<br>鐜板湪鍙互瀹屾暣浣跨敤鎵€鏈夊姛鑳?;
        actionBtn.style.display = 'none';
        realNameVal.textContent = currentUser.realName || '鈥?;
        studentIdVal.textContent = currentUser.studentId ? maskStudentId(currentUser.studentId) : '鈥?;
        submitTimeVal.textContent = currentUser.submitTime ? formatDateTime(currentUser.submitTime) : '鈥?;
        approvedTimeVal.textContent = formatDateTime(new Date().toISOString());
    } else if (currentUser.authStatus === 3) {
        // 琚嫆缁?        card.classList.add('rejected');
        icon.textContent = '鉂?;
        title.textContent = '璁よ瘉鏈€氳繃';
        desc.innerHTML = '鏈钩鍙颁粎闈㈠悜<strong>婀栧崡宸ヤ笟澶у</strong>鍦ㄦ牎甯堢敓寮€鏀?br>璇风‘璁ゅ鍙蜂笌濮撳悕鏄惁鍖归厤鍚庨噸鏂版彁浜?;
        actionBtn.style.display = 'block';
        actionBtn.textContent = '閲嶆柊鎻愪氦璁よ瘉';
        actionBtn.onclick = startAuthFlow;
        realNameVal.textContent = currentUser.realName || '鈥?;
        studentIdVal.textContent = currentUser.studentId ? maskStudentId(currentUser.studentId) : '鈥?;
        submitTimeVal.textContent = currentUser.submitTime ? formatDateTime(currentUser.submitTime) : '鈥?;
        approvedTimeVal.textContent = '鈥?;
    }
}

// ============================================================
// 璁剧疆椤?- 鏄剧ず鐢ㄦ埛淇℃伅锛屽厑璁哥紪杈?// ============================================================
function refreshSettingsPage() {
    const nickEl = document.getElementById('settingsNickname');
    const genderEl = document.getElementById('settingsGender');
    const tagsEl = document.getElementById('settingsTags');
    const userIdEl = document.getElementById('settingsUserId');
    const creditEl = document.getElementById('settingsCreditScore');

    if (currentUser.nickname) {
        nickEl.textContent = currentUser.nickname + ' 鈥?;
        nickEl.style.color = '#333';
    }
    if (currentUser.gender) {
        genderEl.textContent = (currentUser.gender === 'male' ? '鐢? : '濂?) + ' 鈥?;
        genderEl.style.color = '#333';
    }
    if (currentUser.tags && currentUser.tags.length > 0) {
        tagsEl.textContent = currentUser.tags.join('銆?) + ' 鈥?;
        tagsEl.style.color = '#333';
    }
    userIdEl.textContent = currentUser.id ? 'ID-' + String(currentUser.id).slice(-6) : '鈥?;
    creditEl.textContent = (currentUser.creditScore || 100) + '鍒?;
}

function editNickname() {
    const newName = prompt('璇疯緭鍏ユ柊鐨勬樀绉帮紙2-12瀛楋級', currentUser.nickname || '');
    if (newName && newName.length >= 2 && newName.length <= 12) {
        currentUser.nickname = newName;
        saveUserState();
        refreshSettingsPage();
        refreshProfilePage();
        showToast('鏄电О宸叉洿鏂?);
    } else if (newName) {
        showToast('鏄电О闀垮害涓嶇鍚堣姹?);
    }
}

function editGender() {
    const g = prompt('璇疯緭鍏ユ€у埆锛堢敺/濂筹級', currentUser.gender === 'male' ? '鐢? : currentUser.gender === 'female' ? '濂? : '');
    if (g === '鐢? || g === '濂?) {
        currentUser.gender = g === '鐢? ? 'male' : 'female';
        saveUserState();
        refreshSettingsPage();
        showToast('鎬у埆宸叉洿鏂?);
    } else if (g) {
        showToast('璇疯緭鍏ャ€岀敺銆嶆垨銆屽コ銆?);
    }
}

function editTags() {
    const t = prompt('璇疯緭鍏ュ叴瓒ｆ爣绛撅紝鐢ㄩ€楀彿鍒嗛殧锛堝锛氱害楗?杩愬姩,鑷範锛?, (currentUser.tags || []).join(','));
    if (t && t.trim()) {
        currentUser.tags = t.split(/[,锛宂/).map(s => s.trim()).filter(Boolean);
        saveUserState();
        refreshSettingsPage();
        refreshProfilePage();
        showToast('鏍囩宸叉洿鏂?);
    }
}

function editAvatar() {
    showToast('澶村儚灏嗘牴鎹樀绉拌嚜鍔ㄧ敓鎴?);
}

function showAbout() {
    alert('鏍″洯鎼瓙 v1.0\n\n浠呴潰鍚戞箹鍗楀伐涓氬ぇ瀛﹀湪鏍″笀鐢熷紑鏀綷n\n鎵鹃キ鎼€佽繍鍔ㄦ惌銆佸涔犳惌銆佹父鎴忔惌\n璁╂牎鍥敓娲讳笉鍐嶅鍗曪紒');
}

function clearCache() {
    if (confirm('纭畾娓呴櫎鎵€鏈夌紦瀛樻暟鎹紵锛堝皢娓呴櫎鐧诲綍鐘舵€侊級')) {
        localStorage.removeItem('campusBuddyUser');
        currentUser = {
            id: null, nickname: '', gender: '', tags: [],
            studentId: '', realName: '', authStatus: 0,
            postCount: 0, joinCount: 0, creditScore: 100,
            token: null, submitTime: null
        };
        showToast('缂撳瓨宸叉竻闄?);
        setTimeout(() => routeByUserState(), 500);
    }
}

// ============================================================
// 鎵╁睍 submitPost/applyPost锛氳嚜鍔ㄦ妸鏁版嵁鍔犲埌瀵瑰簲鍒楄〃
// ============================================================
const origSubmitPost = window.submitPost;
function submitPost() {
    if (currentUser.authStatus !== 2) { showToast('璇峰厛瀹屾垚瀛﹀彿璁よ瘉鍚庡啀鍙戝竷'); return; }
    const description = document.getElementById('description').value.trim();
    const location = document.getElementById('location').value.trim();
    if (!description) { showToast('璇疯緭鍏ユ椿鍔ㄦ弿杩?); return; }
    if (!location) { showToast('璇疯緭鍏ユ椿鍔ㄥ湴鐐?); return; }
    const newPost = {
        id: Date.now(),
        publisherId: currentUser.id,
        publisherNickname: currentUser.nickname,
        type: selectedType, description, location,
        meet_time: document.getElementById('meetTime').value || new Date().toISOString(),
        current_members: 1, max_members: selectedMaxMembers,
        create_time: new Date().toISOString()
    };
    if (!window.mockPosts) window.mockPosts = [];
    window.mockPosts.unshift(newPost);
    currentUser.postCount = (currentUser.postCount || 0) + 1;
    saveUserState();
    savePostsData();
    document.getElementById('description').value = '';
    document.getElementById('location').value = '';
    document.getElementById('meetTime').value = '';
    document.getElementById('charCount').textContent = '0';
    showToast('鍙戝竷鎴愬姛锛?);
    setTimeout(() => { showPage('homePage'); loadPosts(); refreshProfilePage(); }, 900);
}

const origApplyPost = window.applyPost;
function applyPost(postId, btn) {
    if (currentUser.authStatus !== 2) { showToast('璇峰厛瀹屾垚瀛﹀彿璁よ瘉鍚庡啀鐢宠'); return; }
    if (btn.disabled) return;
    const post = (window.mockPosts || []).find(p => p.id === postId);
    if (post && post.publisherId === currentUser.id) { showToast('杩欐槸浣犺嚜宸卞彂甯冪殑鎼瓙锛屾棤闇€鐢宠'); return; }
    const now = new Date().toISOString();
    if (!window.myApplications) window.myApplications = [];
    if (!window.myInvitations) window.myInvitations = [];

    // 1) 鍔犲叆銆屾垜鐨勭敵璇枫€嶁€斺€?璁板綍褰撳墠鐢ㄦ埛浣滀负鐢宠浜?    window.myApplications.unshift({
        id: Date.now(),
        applicantId: currentUser.id,
        applicantName: currentUser.nickname,
        postId: postId,
        type: post ? post.type : '绾﹂キ',
        publisherNickname: post ? post.publisherNickname : '鍖垮悕',
        description: post ? post.description : '',
        location: post ? post.location : '',
        status: 'pending',
        applyTime: now
    });

    // 2) 鍔犲叆銆屾垜鐨勯個绾︺€嶁€斺€?鐢ㄥ笘瀛愮殑 publisherId 浣滀负褰掑睘鑰咃紝杩欐牱鍙戝笘浜虹櫥褰曞悗鑳界湅鍒?    if (post && post.publisherId && post.publisherId !== currentUser.id) {
        window.myInvitations.unshift({
            id: Date.now() + 1,
            publisherId: post.publisherId,
            applicantId: currentUser.id,
            applicantName: currentUser.nickname,
            postId: postId,
            type: post.type,
            postTitle: post.description.substring(0, 20) + (post.description.length > 20 ? '...' : ''),
            description: post.description,
            location: post.location,
            status: 'pending',
            applyTime: now
        });
    }
    currentUser.joinCount = (currentUser.joinCount || 0) + 1;
    saveUserState();
    savePostsData();
    showToast('鐢宠宸插彂閫侊紝绛夊緟鍙戝竷鑰呯‘璁?);
    btn.textContent = '宸茬敵璇?;
    btn.classList.add('applied');
    btn.disabled = true;
    refreshProfilePage();
}

// ============ 濂藉弸涓庢秷鎭姛鑳?============
function addFriend(userId, userName) {
    if (!userId || !userName) { showToast('鐢ㄦ埛淇℃伅涓嶆纭?); return; }
    if (!window.friends) window.friends = [];
    const exists = window.friends.find(f => String(f.id) === String(userId));
    if (exists) { showToast('宸叉槸濂藉弸鍏崇郴'); return; }
    window.friends.push({
        id: userId,
        name: userName,
        addTime: new Date().toISOString()
    });
    savePostsData();
    showToast('宸叉垚鍔熸坊鍔犲ソ鍙?);
    refreshMyInvitations();
}

function deleteFriend(userId) {
    if (!confirm('纭畾瑕佸垹闄よ濂藉弸鍚楋紵')) return;
    if (window.friends) {
        window.friends = window.friends.filter(f => String(f.id) !== String(userId));
    }
    savePostsData();
    showToast('宸插垹闄ゅソ鍙?);
    refreshFriendsPage();
}

// 褰撳墠鑱婂ぉ瀵硅薄
let currentChatUser = { id: null, name: null };

function startChat(userId, userName) {
    if (!userId || !userName) { showToast('鏃犳硶鍙戣捣鑱婂ぉ'); return; }
    currentChatUser = { id: userId, name: userName };
    showPage('chatPage');
    setTimeout(() => refreshChatPage(), 50);
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const text = input ? input.value.trim() : '';
    if (!text) { showToast('璇疯緭鍏ユ秷鎭唴瀹?); return; }
    if (!currentChatUser || !currentChatUser.id) { showToast('鏈€夋嫨鑱婂ぉ瀵硅薄'); return; }
    if (!window.messages) window.messages = [];
    window.messages.push({
        id: Date.now(),
        fromId: currentUser.id,
        fromName: currentUser.nickname,
        toId: currentChatUser.id,
        toName: currentChatUser.name,
        content: text,
        time: new Date().toISOString(),
        read: false
    });
    savePostsData();
    input.value = '';
    refreshChatPage();
}

function refreshFriendsPage() {
    const list = document.getElementById('friendsList');
    const header = document.getElementById('friendsHeader');
    if (header) header.textContent = '鎴戠殑濂藉弸 (' + (window.friends ? window.friends.length : 0) + ')';
    const friends = window.friends || [];
    if (friends.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">馃懃</div>
                <p>杩樻病鏈夊ソ鍙?/p>
                <p style="font-size:12px;margin-top:5px;">鍦ㄣ€屾垜鐨勯個绾︺€嶅悓鎰忕敵璇峰悗鍙互娣诲姞濂藉弸</p>
            </div>`;
        return;
    }
    list.innerHTML = friends.map(f => `
        <div class="post-card">
            <div class="post-header">
                <div class="avatar" style="background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;font-weight:700;">${f.name.charAt(0)}</div>
                <div class="user-info">
                    <div class="nickname">${f.name}</div>
                    <div class="post-meta">娣诲姞浜?${formatTime(f.addTime)}</div>
                </div>
            </div>
            <div class="post-info">
                <button class="primary-btn-sm" style="margin-top:0;padding:8px 18px;background:linear-gradient(135deg,#722ed1,#531dab);" onclick="startChat('${f.id}', '${f.name}')">馃挰 鍙戞秷鎭?/button>
                <button class="primary-btn-sm" style="margin-top:0;padding:8px 18px;background:#fff;color:#ff4d4f;border:1.5px solid #ff4d4f;box-shadow:none;" onclick="deleteFriend('${f.id}')">馃棏 鍒犻櫎濂藉弸</button>
            </div>
        </div>
    `).join('');
}

function refreshChatPage() {
    const title = document.getElementById('chatTitle');
    const list = document.getElementById('chatMessages');
    if (title && currentChatUser) title.textContent = '馃挰 ' + currentChatUser.name;
    if (!window.messages) window.messages = [];
    const me = currentUser.id;
    const other = currentChatUser ? currentChatUser.id : null;
    // 绛涢€変笌褰撳墠濂藉弸鐨勫璇?    const chat = window.messages.filter(m =>
        (String(m.fromId) === String(me) && String(m.toId) === String(other)) ||
        (String(m.fromId) === String(other) && String(m.toId) === String(me))
    ).sort((a, b) => new Date(a.time) - new Date(b.time));
    if (chat.length === 0) {
        list.innerHTML = `<div style="text-align:center;color:#999;padding:40px 15px;font-size:14px;">杩樻病鏈夋秷鎭紝鍙戦€佺涓€鏉℃秷鎭惂锛?/div>`;
        return;
    }
    list.innerHTML = chat.map(m => {
        const isMe = String(m.fromId) === String(me);
        const bubbleColor = isMe
            ? 'linear-gradient(135deg,#667eea,#764ba2);color:#fff;'
            : '#fff;color:#333;border:1px solid #e8e8e8;';
        const floatSide = isMe ? 'margin-left:auto;' : 'margin-right:auto;';
        const avatarName = isMe ? (currentUser.nickname || '鎴?) : currentChatUser.name;
        return `
            <div style="display:flex;margin-bottom:16px;${floatSide}max-width:80%;flex-direction:${isMe ? 'row-reverse' : 'row'};">
                <div style="width:36px;height:36px;border-radius:50%;background:${isMe ? 'linear-gradient(135deg,#667eea,#764ba2)' : '#e8e8e8'};color:${isMe ? '#fff' : '#666'};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px;flex-shrink:0;">${avatarName.charAt(0)}</div>
                <div style="padding:0 10px;">
                    <div style="font-size:11px;color:#999;margin-bottom:4px;${isMe ? 'text-align:right;' : ''}">${formatTime(m.time)}</div>
                    <div style="padding:10px 14px;border-radius:12px;background:${bubbleColor};word-break:break-word;line-height:1.5;">${m.content}</div>
                </div>
            </div>`;
    }).join('');
}

