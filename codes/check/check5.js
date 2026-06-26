
// ============ 全局状态 ============
const API_BASE = 'http://localhost:8080/api';
let currentUser = {
    id: null, nickname: '', gender: '', tags: [],
    studentId: '', realName: '', authStatus: 0, // 0未认证 1审核中 2已认证 3被拒
    postCount: 0, joinCount: 0, creditScore: 100,
    token: null, submitTime: null
};

// 湖南工业大学学籍数据库（学号+姓名 配对才视为有效）
const hutStudentDB = [
    { id: '2021010101', name: '张伟' },
    { id: '2021010102', name: '王芳' },
    { id: '2021020201', name: '李娜' },
    { id: '2021020202', name: '刘洋' },
    { id: '2021030301', name: '陈静' },
    { id: '2021030302', name: '杨帆' },
    { id: '2022010101', name: '赵磊' },
    { id: '2022010102', name: '黄敏' },
    { id: '2022020201', name: '周杰' },
    { id: '2022020202', name: '吴静' },
    { id: '2022030301', name: '徐强' },
    { id: '2022030302', name: '孙丽' },
    { id: '2023010101', name: '马超' },
    { id: '2023010102', name: '朱琳' },
    { id: '2023020201', name: '胡斌' },
    { id: '2023020202', name: '郭晓' },
    { id: '2023030301', name: '何芳' },
    { id: '2023030302', name: '高远' },
    { id: '2024010101', name: '林峰' },
    { id: '2024010102', name: '黄蓉' }
];
let selectedGender = '';
let selectedTags = [];
let selectedType = '约饭';
let selectedMaxMembers = 3;
let uploadMocked = false;
let currentFilterType = '';

// 默认帖子（首次访问使用，之后从 localStorage 恢复）
const defaultPosts = [
    { id: 1, publisherId: 1001, publisherNickname: '李小明', type: '约饭',
      description: '二食堂新开的火锅店，中午12点有人一起拼桌吗？还差2个人！',
      location: '二食堂', meet_time: new Date().toISOString(),
      current_members: 2, max_members: 4 },
    { id: 2, publisherId: 1002, publisherNickname: '王小红', type: '运动',
      description: '下午4点体育馆打羽毛球，找搭子一起！水平不限，主打快乐运动~',
      location: '体育馆', meet_time: new Date().toISOString(),
      current_members: 3, max_members: 4 },
    { id: 3, publisherId: 1003, publisherNickname: '张小刚', type: '游戏',
      description: '晚上开黑打王者！钻石段位以上来，目标上星耀，冲冲冲！',
      location: '线上', meet_time: new Date().toISOString(),
      current_members: 3, max_members: 5 },
    { id: 4, publisherId: 1004, publisherNickname: '陈小美', type: '自习',
      description: '明天上午图书馆自习，准备期末考试，找个学习搭子互相监督！',
      location: '图书馆3楼', meet_time: new Date().toISOString(),
      current_members: 1, max_members: 2 }
];

// 从 localStorage 加载帖子数据（首次访问用默认值）
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
    // 加载好友和消息
    try {
        const savedFriends = localStorage.getItem('campusBuddyFriends');
        window.friends = savedFriends ? JSON.parse(savedFriends) : [];
    } catch (e) { window.friends = []; }
    try {
        const savedMessages = localStorage.getItem('campusBuddyMessages');
        window.messages = savedMessages ? JSON.parse(savedMessages) : [];
    } catch (e) { window.messages = []; }
})();

// 保存帖子/申请/邀约数据到 localStorage
function savePostsData() {
    try {
        localStorage.setItem('campusBuddyPosts', JSON.stringify(window.mockPosts || []));
        localStorage.setItem('campusBuddyApplications', JSON.stringify(window.myApplications || []));
        localStorage.setItem('campusBuddyInvitations', JSON.stringify(window.myInvitations || []));
        localStorage.setItem('campusBuddyFriends', JSON.stringify(window.friends || []));
        localStorage.setItem('campusBuddyMessages', JSON.stringify(window.messages || []));
    } catch (e) {}
}

// ============ 初始化 ============
document.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('campusBuddyUser');
    if (saved) {
        try { currentUser = { ...currentUser, ...JSON.parse(saved) }; } catch (e) {}
    }
    routeByUserState();
    // 字数统计
    const desc = document.getElementById('description');
    if (desc) desc.addEventListener('input', () => {
        document.getElementById('charCount').textContent = desc.value.length;
    });
});

// 根据用户状态路由（无登录页面，直接生成用户 ID）
function routeByUserState() {
    if (!currentUser.id) {
        currentUser.id = Math.floor(Math.random() * 1000000);
        currentUser.token = 'user-' + currentUser.id;
        saveUserState();
    }
    if (!currentUser.nickname) { showPage('profileEditPage'); return; }
    if (currentUser.authStatus === 0 || currentUser.authStatus === 3) { showPage('authPage'); return; }
    if (currentUser.authStatus === 1) { showPage('pendingPage'); refreshPendingPage(); return; }
    // 已认证
    showPage('homePage');
    loadPosts();
    refreshProfilePage();
}

// ============ 通用：显示页面 ============
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    // 底部导航仅在广场和个人中心显示
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
    if (pageId === 'authPage') {
        uploadMocked = false;
        const box = document.getElementById('uploadBox');
        if (box) {
            box.innerHTML = '<div style="font-size: 40px;">📷</div>' +
                '<div style="font-weight: 700; color: #667eea; margin-top: 10px;">⬅ 点这里 ➡ 上传校园卡照片</div>' +
                '<div style="font-size: 12px; color: #718096; margin-top: 8px;">（演示环境：点击即模拟上传成功）</div>';
            box.style.border = '2px dashed #667eea';
            box.style.background = 'linear-gradient(135deg, #f5f7ff, #fef8ff)';
        }
        prefillAuthFields();
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
        showToast('功能开发中');
    }
}

function showPublish() {
    if (currentUser.authStatus !== 2) {
        showToast('请先完成学号认证后再发布');
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

// 简化登录：自动生成用户 ID，无需微信登录按钮
async function wxLogin() {
    if (!currentUser.id) {
        currentUser.id = Math.floor(Math.random() * 1000000);
        currentUser.token = 'user-' + currentUser.id;
        saveUserState();
    }
    routeByUserState();
}

// ============ 2. 填写个人信息 ============
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
    if (nickname.length < 2) { showToast('请填写昵称（至少2字）'); return; }
    if (!selectedGender) { showToast('请选择性别'); return; }
    if (selectedTags.length === 0) { showToast('请至少选择1个兴趣标签'); return; }

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

    showToast('信息已保存');
    setTimeout(() => showPage('authPage'), 600);
}

// ============ 3. 认证提交 ============
function simulateUpload() {
    const box = document.getElementById('uploadBox');
    box.innerHTML = '<div style="padding: 20px; text-align: center;">' +
        '<div style="font-size: 50px;">✅</div>' +
        '<div style="font-weight: 700; color: #4a5568; margin-top: 10px;">校园卡已上传</div>' +
        '<div style="font-size: 12px; color: #718096; margin-top: 8px;">（演示模式：照片已加密保存）</div>' +
        '</div>';
    box.style.border = '2px solid #48bb78';
    box.style.background = 'linear-gradient(135deg, #f0fff4, #e6fffa)';
    uploadMocked = true;
    showToast('照片上传成功');
}
// 判断学号+姓名是否匹配湖南工业大学学籍（宽松匹配）
function isValidHUTStudent(studentId, realName) {
    if (!studentId || !realName) return false;
    const normalizedId = studentId.trim().replace(/\s+/g, '').replace(/\./g, '');
    const normalizedName = realName.trim();
    return hutStudentDB.some(s => s.id === normalizedId && s.name === normalizedName);
}

// 进入认证页时预填充用户之前填过的学号和姓名
function prefillAuthFields() {
    const nameInput = document.getElementById('realNameInput');
    const idInput = document.getElementById('studentIdInput');
    if (nameInput && currentUser.realName) nameInput.value = currentUser.realName;
    if (idInput && currentUser.studentId) idInput.value = currentUser.studentId;
}

async function submitAuth() {
    const studentId = document.getElementById('studentIdInput').value.trim();
    const realName = document.getElementById('realNameInput').value.trim();
    if (!realName) { showToast('❗ 请输入真实姓名'); return; }
    if (!studentId) { showToast('❗ 请输入学号'); return; }
    if (!uploadMocked) { showToast('❗ 请点击上方「上传校园卡照片」的区域'); return; }

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

    showToast('认证信息已提交');
    setTimeout(() => {
        showPage('pendingPage');
        refreshPendingPage();
        // 3秒后模拟人工审核结果 - 根据学校自动判断
        setTimeout(() => manualReview(), 3500);
    }, 600);
}

// 人工审核：学号+姓名必须匹配湖南工业大学学籍库
function manualReview() {
    if (currentUser.authStatus !== 1) return;
    if (isValidHUTStudent(currentUser.studentId, currentUser.realName)) {
        currentUser.authStatus = 2; // 审核通过
        saveUserState();
        refreshPendingPage();
        showToast('🎉 恭喜！认证通过');
    } else {
        currentUser.authStatus = 3; // 审核拒绝 - 学号姓名不匹配
        saveUserState();
        refreshPendingPage();
    }
}

function refreshPendingPage() {
    document.getElementById('submittedStudentId').textContent =
        currentUser.studentId ? maskStudentId(currentUser.studentId) : '—';
    document.getElementById('submittedRealName').textContent = currentUser.realName || '—';
    document.getElementById('submitTime').textContent =
        currentUser.submitTime ? formatDateTime(currentUser.submitTime) : '—';

    const badge = document.getElementById('statusBadge');
    const title = document.getElementById('pendingTitle');
    const desc = document.getElementById('pendingDesc');
    const icon = document.getElementById('pendingIcon');
    const continueBtn = document.getElementById('pendingContinueBtn');
    const backBtn = document.getElementById('pendingBackBtn');
    const mockBtn = document.getElementById('pendingMockBtn');
    const rejectRow = document.getElementById('rejectReasonRow');

    if (currentUser.authStatus === 1) {
        badge.textContent = '审核中'; badge.className = 'status-badge pending';
        title.textContent = '认证审核中';
        desc.innerHTML = '您的认证信息已提交，正在人工审核中。<br>通常需要 1-5 分钟';
        icon.textContent = '⏳';
        continueBtn.style.display = 'none';
        backBtn.style.display = 'none';
        if (rejectRow) rejectRow.style.display = 'none';
    } else if (currentUser.authStatus === 2) {
        badge.textContent = '✓ 已通过'; badge.className = 'status-badge approved';
        title.textContent = '🎉 认证通过！';
        desc.innerHTML = '恭喜，您已完成学号认证！<br>现在可以完整使用校园搭子的所有功能';
        icon.textContent = '✅';
        continueBtn.style.display = 'block';
        backBtn.style.display = 'none';
        if (mockBtn) mockBtn.style.display = 'none';
        if (rejectRow) rejectRow.style.display = 'none';
    } else if (currentUser.authStatus === 3) {
        badge.textContent = '已拒绝'; badge.className = 'status-badge rejected';
        title.textContent = '❌ 认证未通过';
        desc.innerHTML = '很抱歉！本平台<strong style="color:#ff4d4f;">仅面向湖南工业大学在校师生开放</strong>。<br>请确认您的学号与真实姓名是否匹配后重新提交认证。';
        icon.textContent = '⛔';
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
    showToast('欢迎加入校园搭子！');
}

function backToAuth() {
    // 重置认证状态，返回认证页重新填写
    currentUser.authStatus = 0;
    saveUserState();
    showPage('authPage');
    // 重置照片上传状态，让用户重新操作
    uploadMocked = false;
    const box = document.getElementById('uploadBox');
    if (box) {
        box.innerHTML = '<div class="upload-icon">📷</div><div class="upload-text">点击上传校园卡照片</div><div class="upload-sub">支持 JPG/PNG 格式</div>';
    }
}

// ============ 4. 广场页 ============
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
        container.innerHTML = `<div class="empty-state"><div class="empty-icon">🔍</div><p>暂无相关搭子</p><p style="margin-top:5px;">点击 + 发布一个吧~</p></div>`;
        return;
    }
    container.innerHTML = filtered.map(post => {
        const typeClass = getTypeClass(post.type);
        const isFull = post.current_members >= post.max_members;
        const isMine = post.publisherId === currentUser.id;
        let actionBtn;
        if (isMine) {
            actionBtn = `<button class="apply-btn applied" onclick="showToast('这是你发布的搭子')">👤 我发布的</button>`;
        } else if (isFull) {
            actionBtn = `<button class="apply-btn applied" disabled>已满员</button>`;
        } else {
            actionBtn = `<button class="apply-btn" onclick="applyPost(${post.id}, this)">✨ 我想去</button>`;
        }
        return `
        <div class="post-card">
            <div class="post-header">
                <div class="avatar">${post.publisherNickname ? post.publisherNickname.charAt(0) : '?'}</div>
                <div class="user-info">
                    <div class="nickname">${post.publisherNickname || '匿名'}</div>
                    <div class="post-meta">${formatTime(post.create_time || post.meet_time)} · ${post.location || ''}</div>
                </div>
                <span class="type-tag ${typeClass}">${post.type}</span>
            </div>
            <div class="post-content">${post.description}</div>
            <div class="post-info">
                <span>🕐 ${formatMeetTime(post.meet_time)}</span>
                <span>📍 ${post.location || '待定'}</span>
                <span class="member-count">👥 ${post.current_members}/${post.max_members}人</span>
                ${actionBtn}
            </div>
        </div>`;
    }).join('');
}
function getTypeClass(type) {
    return { '约饭': 'food', '运动': 'sport', '游戏': 'game', '自习': 'study' }[type] || 'food';
}
// 已被后续的同名函数覆盖，请查看下方 applyPost 实现

// ============ 5. 发布搭子 ============
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
// 已被后续的同名函数覆盖，请查看下方 submitPost 实现

// ============ 6. 个人中心 ============
function refreshProfilePage() {
    document.getElementById('profileAvatar').textContent = currentUser.nickname ? currentUser.nickname.charAt(0) : '我';
    document.getElementById('profileName').textContent = currentUser.nickname || '未登录';

    const authBox = document.getElementById('profileAuthStatus');
    const authBadge = document.getElementById('profileAuthBadge');
    if (currentUser.authStatus === 2) {
        authBox.innerHTML = `<div class="auth-status-line approved"><span>✓</span><span>已完成学号认证 · 湖南工业大学</span></div>`;
        authBadge.textContent = '已认证';
        authBadge.style.background = '#f6ffed'; authBadge.style.color = '#52c41a';
    } else if (currentUser.authStatus === 1) {
        authBox.innerHTML = `<div class="auth-status-line unverified" onclick="showPage('pendingPage')"><span>⏳</span><span>认证审核中</span></div>`;
        authBadge.textContent = '审核中';
        authBadge.style.background = '#fff7e6'; authBadge.style.color = '#fa8c16';
    } else if (currentUser.authStatus === 3) {
        authBox.innerHTML = `<div class="auth-status-line unverified" onclick="startAuthFlow()"><span>⛔</span><span>认证未通过（仅湖工大师生），点击重试</span></div>`;
        authBadge.textContent = '未通过';
        authBadge.style.background = '#fff1f0'; authBadge.style.color = '#ff4d4f';
    } else {
        authBox.innerHTML = `<div class="auth-status-line unverified" onclick="startAuthFlow()"><span>⚠️</span><span>未完成认证，点击完善</span></div>`;
        authBadge.textContent = '去认证';
        authBadge.style.background = '#fff1f0'; authBadge.style.color = '#ff4d4f';
    }

    document.getElementById('postCount').textContent = currentUser.postCount || 0;
    document.getElementById('joinCount').textContent = currentUser.joinCount || 0;
    document.getElementById('myPostCount').textContent = (currentUser.postCount || 0) + ' 条';
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
    showToast('已退出登录');
    setTimeout(() => routeByUserState(), 500);
}

// ============ 工具函数 ============
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
    if (diff < 5) return '刚刚';
    if (diff < 60) return diff + '分钟前';
    if (diff < 1440) return Math.floor(diff/60) + '小时前';
    return Math.floor(diff/1440) + '天前';
}
function formatMeetTime(str) {
    if (!str) return '待定';
    const d = new Date(str);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) {
        return '今天 ' + String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
    }
    return (d.getMonth()+1) + '/' + d.getDate() + ' ' + String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
}



function showHomeFromSide() { showPage('homePage'); }

// ============================================================
// 我的发布 - 显示用户发布过的搭子
// ============================================================
function refreshMyPosts() {
    const list = document.getElementById('myPostsList');
    const myPosts = (window.mockPosts || []).filter(p => p.publisherId === currentUser.id);
    if (!myPosts || myPosts.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📝</div>
                <p>还没有发布过搭子</p>
                <p style="font-size:12px;margin-top:5px;">点击下方按钮，去发布第一个吧</p>
                <button class="primary-btn-sm" onclick="showPublish()">+ 发布新搭子</button>
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
                    <div class="nickname">${post.publisherNickname || '匿名'}</div>
                    <div class="post-meta">${formatTime(post.create_time || post.meet_time)} · ${post.location || ''}</div>
                </div>
                <span class="type-tag ${typeClass}">${post.type}</span>
            </div>
            <div class="post-content">${post.description}</div>
            <div class="post-info">
                <span>🕐 ${formatMeetTime(post.meet_time)}</span>
                <span class="member-count">👥 ${post.current_members || 1}/${post.max_members}人</span>
                <button class="primary-btn-sm" style="margin-top:0;padding:6px 14px;background:#fff;color:#ff4d4f;border:1.5px solid #ff4d4f;box-shadow:none;font-size:12px;" onclick="deletePost(${post.id})">🗑 删除</button>
            </div>
        </div>`;
    }).join('');
}

function deletePost(postId) {
    if (!confirm('确定要删除这条搭子吗？')) return;
    if (window.mockPosts) {
        window.mockPosts = window.mockPosts.filter(p => p.id !== postId);
    }
    // 同时删除与该帖子相关的邀约和申请
    if (window.myInvitations) {
        window.myInvitations = window.myInvitations.filter(inv => inv.postId !== postId);
    }
    if (window.myApplications) {
        window.myApplications = window.myApplications.filter(a => a.postId !== postId);
    }
    currentUser.postCount = (currentUser.postCount || 0) > 0 ? (currentUser.postCount - 1) : 0;
    saveUserState();
    savePostsData();
    showToast('已删除');
    refreshMyPosts();
    loadPosts();
    refreshProfilePage();
}

// ============================================================
// 我的申请 - 显示用户申请加入过的搭子（分状态标签页）
// ============================================================
let currentApplicationsTab = 'pending';
function switchApplicationTab(el) {
    document.querySelectorAll('#applicationTabs .tab-item').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    currentApplicationsTab = el.dataset.tab;
    refreshMyApplications(currentApplicationsTab);
}

function refreshMyApplications(tab) {
    const list = document.getElementById('myApplicationsList');
    // 只显示当前用户发出的申请（按 applicantId 过滤）
    const apps = (window.myApplications || []).filter(a => a.applicantId === currentUser.id && a.status === tab);
    if (!apps || apps.length === 0) {
        let emptyMsg = '暂无申请记录';
        if (tab === 'approved') emptyMsg = '没有已通过的申请';
        if (tab === 'rejected') emptyMsg = '没有被拒绝的申请';
        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">${tab === 'approved' ? '✅' : tab === 'rejected' ? '❌' : '📋'}</div>
                <p>${emptyMsg}</p>
                <p style="font-size:12px;margin-top:5px;">去广场页看看有哪些感兴趣的搭子</p>
                <button class="primary-btn-sm" onclick="showPage('homePage')">去广场逛逛</button>
            </div>`;
        return;
    }
    list.innerHTML = apps.map(app => {
        const typeClass = getTypeClass(app.type);
        let statusHtml = '';
        if (tab === 'pending') statusHtml = '<span class="status-badge pending">等待审核</span>';
        if (tab === 'approved') statusHtml = '<span class="status-badge approved">已通过</span>';
        if (tab === 'rejected') statusHtml = '<span class="status-badge rejected">已拒绝</span>';
        let actionHtml = '';
        if (tab === 'pending') actionHtml = `<button class="primary-btn-sm" style="margin-top:0;padding:6px 14px;background:#fff;color:#ff4d4f;border:1.5px solid #ff4d4f;box-shadow:none;font-size:12px;" onclick="withdrawApplication(${app.id})">↩ 撤回申请</button>`;
        if (tab === 'approved') actionHtml = `<button class="primary-btn-sm" style="margin-top:0;padding:6px 14px;background:linear-gradient(135deg,#722ed1,#531dab);" onclick="startChat('${app.publisherId || 'pub'}', '${app.publisherNickname || '发布者'}')">💬 联系发布者</button>`;
        return `
        <div class="post-card">
            <div class="post-header">
                <div class="avatar">${app.publisherNickname ? app.publisherNickname.charAt(0) : '?'}</div>
                <div class="user-info">
                    <div class="nickname">${app.publisherNickname || '匿名'}</div>
                    <div class="post-meta">${formatTime(app.applyTime)} 申请加入</div>
                </div>
                <span class="type-tag ${typeClass}">${app.type}</span>
            </div>
            <div class="post-content">${app.description}</div>
            <div class="post-info">
                <span>📍 ${app.location || '待定'}</span>
                ${statusHtml}
                ${actionHtml}
            </div>
        </div>`;
    }).join('');
}

function withdrawApplication(appId) {
    if (!confirm('确定要撤回这条申请吗？')) return;
    if (window.myApplications) {
        window.myApplications = window.myApplications.filter(a => a.id !== appId);
    }
    if (window.myInvitations) {
        window.myInvitations = window.myInvitations.filter(inv => inv.id !== appId);
    }
    currentUser.joinCount = (currentUser.joinCount || 0) > 0 ? (currentUser.joinCount - 1) : 0;
    saveUserState();
    savePostsData();
    showToast('已撤回申请');
    refreshMyApplications('pending');
    refreshProfilePage();
}

// ============================================================
// 我的邀约 - 显示别人申请加入我发布的搭子
// ============================================================
function refreshMyInvitations() {
    const list = document.getElementById('myInvitationsList');
    const invs = (window.myInvitations || []).filter(inv => inv.publisherId === currentUser.id);
    if (!invs || invs.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📅</div>
                <p>暂无邀约请求</p>
                <p style="font-size:12px;margin-top:5px;">当有人申请加入你发布的搭子时，会显示在这里</p>
                <button class="primary-btn-sm" onclick="showPublish()">去发布搭子</button>
            </div>`;
        return;
    }
    list.innerHTML = invs.map(inv => {
        let statusTag = '';
        let actionHtml = '';
        if (inv.status === 'pending') {
            statusTag = '<span style="background:#fff7e6;color:#ff9800;padding:4px 10px;border-radius:10px;font-size:11px;font-weight:600;">待处理</span>';
            actionHtml = `
                <button class="primary-btn-sm" style="margin-top:0;padding:8px 18px;background:linear-gradient(135deg,#52c41a,#389e0d);box-shadow:0 2px 10px rgba(82,196,26,0.3);" onclick="respondInvitation(${inv.id}, true)">✓ 同意</button>
                <button class="primary-btn-sm" style="margin-top:0;padding:8px 18px;background:#fff;color:#ff4d4f;border:1.5px solid #ff4d4f;box-shadow:none;" onclick="respondInvitation(${inv.id}, false)">✕ 拒绝</button>`;
        } else if (inv.status === 'approved') {
            statusTag = '<span style="background:#f6ffed;color:#52c41a;padding:4px 10px;border-radius:10px;font-size:11px;font-weight:600;">已同意</span>';
            actionHtml = `
                <button class="primary-btn-sm" style="margin-top:0;padding:8px 18px;background:linear-gradient(135deg,#1677ff,#0958d9);box-shadow:0 2px 10px rgba(22,119,255,0.3);" onclick="addFriend(${inv.applicantId}, '${inv.applicantName}')">👥 加好友</button>
                <button class="primary-btn-sm" style="margin-top:0;padding:8px 18px;background:linear-gradient(135deg,#722ed1,#531dab);box-shadow:0 2px 10px rgba(114,46,209,0.3);" onclick="startChat(${inv.applicantId}, '${inv.applicantName}')">💬 发消息</button>`;
        } else {
            statusTag = '<span style="background:#fff1f0;color:#ff4d4f;padding:4px 10px;border-radius:10px;font-size:11px;font-weight:600;">已拒绝</span>';
            actionHtml = '<span style="color:#999;font-size:12px;">已拒绝该申请</span>';
        }
        return `
        <div class="post-card">
            <div class="post-header">
                <div class="avatar">${inv.applicantName ? inv.applicantName.charAt(0) : '?'}</div>
                <div class="user-info">
                    <div class="nickname">${inv.applicantName || '匿名用户'}</div>
                    <div class="post-meta">${formatTime(inv.applyTime)} 申请加入 · 你发布的</div>
                </div>
                ${statusTag}
            </div>
            <div class="post-content">${inv.postTitle || inv.description}</div>
            <div class="post-info">
                <span>📍 ${inv.location || '待定'}</span>
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
    showToast(accept ? '已同意该用户加入' : '已拒绝该申请');
    refreshMyInvitations();
}

// ============================================================
// 学号认证详情页 - 根据用户当前认证状态显示不同信息
// ============================================================
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
        // 未认证
        icon.textContent = '⚠️';
        title.textContent = '尚未提交认证';
        desc.innerHTML = '请准备好您的学号和真实姓名，认证通过后方可发布和加入搭子';
        actionBtn.style.display = 'block';
        actionBtn.textContent = '去提交认证';
        actionBtn.onclick = startAuthFlow;
        realNameVal.textContent = '—';
        studentIdVal.textContent = '—';
        submitTimeVal.textContent = '—';
        approvedTimeVal.textContent = '—';
    } else if (currentUser.authStatus === 1) {
        // 审核中
        icon.textContent = '⏳';
        title.textContent = '认证审核中';
        desc.innerHTML = '您的信息已提交，正在核查学籍<br>通常需要 1-2 分钟';
        actionBtn.style.display = 'block';
        actionBtn.textContent = '[演示] 模拟审核通过';
        actionBtn.onclick = function() { manualReview(); showPage('authDetailPage'); };
        realNameVal.textContent = currentUser.realName || '—';
        studentIdVal.textContent = currentUser.studentId ? maskStudentId(currentUser.studentId) : '—';
        submitTimeVal.textContent = currentUser.submitTime ? formatDateTime(currentUser.submitTime) : '—';
        approvedTimeVal.textContent = '—';
    } else if (currentUser.authStatus === 2) {
        // 已通过
        card.classList.add('approved');
        icon.textContent = '✅';
        title.textContent = '🎉 认证已通过';
        desc.innerHTML = '恭喜！您已通过学号认证<br>现在可以完整使用所有功能';
        actionBtn.style.display = 'none';
        realNameVal.textContent = currentUser.realName || '—';
        studentIdVal.textContent = currentUser.studentId ? maskStudentId(currentUser.studentId) : '—';
        submitTimeVal.textContent = currentUser.submitTime ? formatDateTime(currentUser.submitTime) : '—';
        approvedTimeVal.textContent = formatDateTime(new Date().toISOString());
    } else if (currentUser.authStatus === 3) {
        // 被拒绝
        card.classList.add('rejected');
        icon.textContent = '❌';
        title.textContent = '认证未通过';
        desc.innerHTML = '本平台仅面向<strong>湖南工业大学</strong>在校师生开放<br>请确认学号与姓名是否匹配后重新提交';
        actionBtn.style.display = 'block';
        actionBtn.textContent = '重新提交认证';
        actionBtn.onclick = startAuthFlow;
        realNameVal.textContent = currentUser.realName || '—';
        studentIdVal.textContent = currentUser.studentId ? maskStudentId(currentUser.studentId) : '—';
        submitTimeVal.textContent = currentUser.submitTime ? formatDateTime(currentUser.submitTime) : '—';
        approvedTimeVal.textContent = '—';
    }
}

// ============================================================
// 设置页 - 显示用户信息，允许编辑
// ============================================================
function refreshSettingsPage() {
    const nickEl = document.getElementById('settingsNickname');
    const genderEl = document.getElementById('settingsGender');
    const tagsEl = document.getElementById('settingsTags');
    const userIdEl = document.getElementById('settingsUserId');
    const creditEl = document.getElementById('settingsCreditScore');

    if (currentUser.nickname) {
        nickEl.textContent = currentUser.nickname + ' ›';
        nickEl.style.color = '#333';
    }
    if (currentUser.gender) {
        genderEl.textContent = (currentUser.gender === 'male' ? '男' : '女') + ' ›';
        genderEl.style.color = '#333';
    }
    if (currentUser.tags && currentUser.tags.length > 0) {
        tagsEl.textContent = currentUser.tags.join('、') + ' ›';
        tagsEl.style.color = '#333';
    }
    userIdEl.textContent = currentUser.id ? 'ID-' + String(currentUser.id).slice(-6) : '—';
    creditEl.textContent = (currentUser.creditScore || 100) + '分';
}

function editNickname() {
    const newName = prompt('请输入新的昵称（2-12字）', currentUser.nickname || '');
    if (newName && newName.length >= 2 && newName.length <= 12) {
        currentUser.nickname = newName;
        saveUserState();
        refreshSettingsPage();
        refreshProfilePage();
        showToast('昵称已更新');
    } else if (newName) {
        showToast('昵称长度不符合要求');
    }
}

function editGender() {
    const g = prompt('请输入性别（男/女）', currentUser.gender === 'male' ? '男' : currentUser.gender === 'female' ? '女' : '');
    if (g === '男' || g === '女') {
        currentUser.gender = g === '男' ? 'male' : 'female';
        saveUserState();
        refreshSettingsPage();
        showToast('性别已更新');
    } else if (g) {
        showToast('请输入「男」或「女」');
    }
}

function editTags() {
    const t = prompt('请输入兴趣标签，用逗号分隔（如：约饭,运动,自习）', (currentUser.tags || []).join(','));
    if (t && t.trim()) {
        currentUser.tags = t.split(/[,，]/).map(s => s.trim()).filter(Boolean);
        saveUserState();
        refreshSettingsPage();
        refreshProfilePage();
        showToast('标签已更新');
    }
}

function editAvatar() {
    showToast('头像将根据昵称自动生成');
}

function showAbout() {
    alert('校园搭子 v1.0\n\n仅面向湖南工业大学在校师生开放\n\n找饭搭、运动搭、学习搭、游戏搭\n让校园生活不再孤单！');
}

function clearCache() {
    if (confirm('确定清除所有缓存数据？（将清除登录状态）')) {
        localStorage.removeItem('campusBuddyUser');
        currentUser = {
            id: null, nickname: '', gender: '', tags: [],
            studentId: '', realName: '', authStatus: 0,
            postCount: 0, joinCount: 0, creditScore: 100,
            token: null, submitTime: null
        };
        showToast('缓存已清除');
        setTimeout(() => routeByUserState(), 500);
    }
}

function submitPost() {
    if (currentUser.authStatus !== 2) { showToast('请先完成学号认证后再发布'); return; }
    const description = document.getElementById('description').value.trim();
    const location = document.getElementById('location').value.trim();
    if (!description) { showToast('请输入活动描述'); return; }
    if (!location) { showToast('请输入活动地点'); return; }
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
    showToast('发布成功！');
    setTimeout(() => { showPage('homePage'); loadPosts(); refreshProfilePage(); }, 900);
}

function applyPost(postId, btn) {
    if (currentUser.authStatus !== 2) { showToast('请先完成学号认证后再申请'); return; }
    if (btn.disabled) return;
    const post = (window.mockPosts || []).find(p => p.id === postId);
    if (post && post.publisherId === currentUser.id) { showToast('这是你自己发布的搭子，无需申请'); return; }
    const now = new Date().toISOString();
    if (!window.myApplications) window.myApplications = [];
    if (!window.myInvitations) window.myInvitations = [];

    // 1) 加入「我的申请」—— 记录当前用户作为申请人
    window.myApplications.unshift({
        id: Date.now(),
        applicantId: currentUser.id,
        applicantName: currentUser.nickname,
        postId: postId,
        type: post ? post.type : '约饭',
        publisherNickname: post ? post.publisherNickname : '匿名',
        description: post ? post.description : '',
        location: post ? post.location : '',
        status: 'pending',
        applyTime: now
    });

    // 2) 加入「我的邀约」—— 用帖子的 publisherId 作为归属者，这样发帖人登录后能看到
    if (post && post.publisherId && post.publisherId !== currentUser.id) {
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
    showToast('申请已发送，等待发布者确认');
    btn.textContent = '已申请';
    btn.classList.add('applied');
    btn.disabled = true;
    refreshProfilePage();
}

// ============ 好友与消息功能 ============
function addFriend(userId, userName) {
    if (!userId || !userName) { showToast('用户信息不正确'); return; }
    if (!window.friends) window.friends = [];
    const exists = window.friends.find(f => String(f.id) === String(userId));
    if (exists) { showToast('已是好友关系'); return; }
    window.friends.push({
        id: userId,
        name: userName,
        addTime: new Date().toISOString()
    });
    savePostsData();
    showToast('已成功添加好友');
    refreshMyInvitations();
}

function deleteFriend(userId) {
    if (!confirm('确定要删除该好友吗？')) return;
    if (window.friends) {
        window.friends = window.friends.filter(f => String(f.id) !== String(userId));
    }
    savePostsData();
    showToast('已删除好友');
    refreshFriendsPage();
}

// 当前聊天对象
let currentChatUser = { id: null, name: null };

function startChat(userId, userName) {
    if (!userId || !userName) { showToast('无法发起聊天'); return; }
    currentChatUser = { id: userId, name: userName };
    showPage('chatPage');
    setTimeout(() => refreshChatPage(), 50);
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const text = input ? input.value.trim() : '';
    if (!text) { showToast('请输入消息内容'); return; }
    if (!currentChatUser || !currentChatUser.id) { showToast('未选择聊天对象'); return; }
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
    if (header) header.textContent = '我的好友 (' + (window.friends ? window.friends.length : 0) + ')';
    const friends = window.friends || [];
    if (friends.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">👥</div>
                <p>还没有好友</p>
                <p style="font-size:12px;margin-top:5px;">在「我的邀约」同意申请后可以添加好友</p>
            </div>`;
        return;
    }
    list.innerHTML = friends.map(f => `
        <div class="post-card">
            <div class="post-header">
                <div class="avatar" style="background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;font-weight:700;">${f.name.charAt(0)}</div>
                <div class="user-info">
                    <div class="nickname">${f.name}</div>
                    <div class="post-meta">添加于 ${formatTime(f.addTime)}</div>
                </div>
            </div>
            <div class="post-info">
                <button class="primary-btn-sm" style="margin-top:0;padding:8px 18px;background:linear-gradient(135deg,#722ed1,#531dab);" onclick="startChat('${f.id}', '${f.name}')">💬 发消息</button>
                <button class="primary-btn-sm" style="margin-top:0;padding:8px 18px;background:#fff;color:#ff4d4f;border:1.5px solid #ff4d4f;box-shadow:none;" onclick="deleteFriend('${f.id}')">🗑 删除好友</button>
            </div>
        </div>
    `).join('');
}

function refreshChatPage() {
    const title = document.getElementById('chatTitle');
    const list = document.getElementById('chatMessages');
    if (title && currentChatUser) title.textContent = '💬 ' + currentChatUser.name;
    if (!window.messages) window.messages = [];
    const me = currentUser.id;
    const other = currentChatUser ? currentChatUser.id : null;
    // 筛选与当前好友的对话
    const chat = window.messages.filter(m =>
        (String(m.fromId) === String(me) && String(m.toId) === String(other)) ||
        (String(m.fromId) === String(other) && String(m.toId) === String(me))
    ).sort((a, b) => new Date(a.time) - new Date(b.time));
    if (chat.length === 0) {
        list.innerHTML = `<div style="text-align:center;color:#999;padding:40px 15px;font-size:14px;">还没有消息，发送第一条消息吧！</div>`;
        return;
    }
    list.innerHTML = chat.map(m => {
        const isMe = String(m.fromId) === String(me);
        const bubbleColor = isMe
            ? 'linear-gradient(135deg,#667eea,#764ba2);color:#fff;'
            : '#fff;color:#333;border:1px solid #e8e8e8;';
        const floatSide = isMe ? 'margin-left:auto;' : 'margin-right:auto;';
        const avatarName = isMe ? (currentUser.nickname || '我') : currentChatUser.name;
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
