import { firebaseConfig } from './firebase-config.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, collection, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { checkMaintenance } from './guard.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export function renderHeader() {
    checkMaintenance();

    const container = document.getElementById('header-container');
    if (!container) return;

    const siteTheme = localStorage.getItem('theme') || 'light';
    if (siteTheme === 'dark') document.body.classList.add('dark-theme');

    container.innerHTML = `
      <div class="ticker-wrap" id="ticker-wrap" style="display: none;">
          <div class="ticker" id="ticker-content">Загрузка...</div>
      </div>

      <header id="main-header" style="padding: 0 20px;">
        <div class="header-container" style="display: flex; align-items: center; justify-content: space-between; gap: 20px;">
            
            <!-- ЛОГОТИП -->
            <div class="logo" style="flex-shrink: 0;">
                <a href="/kemerovo42-site/index.html" style="text-decoration: none; color: white; display: block;">
                    <h1 style="margin: 0; font-size: 1.8rem; font-weight: 800;">КЕМЕРОВО <span>42</span></h1>
                    <p style="margin: 0; font-size: 0.7rem; color: #94a3b8; letter-spacing: 2px;">ОФИЦИАЛЬНЫЙ НОВОСТНОЙ ПОРТАЛ</p>
                </a>
            </div>

            <!-- ПРАВАЯ ЧАСТЬ (Кнопки) -->
            <div style="display: flex; align-items: center; gap: 15px; flex-shrink: 0;">
                
                <!-- Поиск (Иконка) -->
                <div style="display: flex; align-items: center;">
                    <input type="text" id="search-input" placeholder="Поиск..." style="display: none; padding: 8px 12px; border-radius: 20px; border: 1px solid #334155; outline: none; background: #0f172a; color: white; width: 200px; margin-right: 10px;" onkeypress="if(event.key === 'Enter') window.location.href='/kemerovo42-site/search.html?q=' + encodeURIComponent(this.value)">
                    <button onclick="document.getElementById('search-input').style.display = document.getElementById('search-input').style.display === 'block' ? 'none' : 'block'" style="background: none; border: none; color: white; font-size: 1.2rem; cursor: pointer; padding: 5px;"><i class="fas fa-search"></i></button>
                </div>

                <!-- Кнопка Предложить -->
                <a href="/kemerovo42-site/suggest.html" style="text-decoration: none; color: white; font-weight: 600; font-size: 0.9rem; display: flex; align-items: center; gap: 5px; transition: 0.2s;" onmouseover="this.style.color='#d4af37'" onmouseout="this.style.color='white'">
                    <i class="fas fa-bullhorn"></i> Предложить
                </a>

                <!-- Кнопка Войти (если не залогинен) -->
                <a href="/kemerovo42-site/admin/login.html" id="login-btn" style="text-decoration: none; color: white; font-weight: 600; font-size: 0.9rem; border: 1px solid rgba(255,255,255,0.2); padding: 6px 16px; border-radius: 6px; transition: 0.2s;">Войти</a>

                <!-- Меню профиля (если залогинен) -->
                <div id="user-menu" style="display: none; position: relative;">
                    <button onclick="document.getElementById('dropdown').style.display = document.getElementById('dropdown').style.display === 'block' ? 'none' : 'block'" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.1); border-radius: 30px; padding: 4px 12px 4px 4px; display: flex; align-items: center; gap: 8px; cursor: pointer; color: white;">
                        <img id="header-avatar" src="" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover; display: none;">
                        <span id="header-username" style="font-weight: 600; font-size: 0.85rem;">Профиль</span>
                        <i class="fas fa-chevron-down" style="font-size: 0.7rem; color: #94a3b8;"></i>
                    </button>
                    <div id="dropdown" style="display: none; position: absolute; right: 0; top: 45px; background: white; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); min-width: 180px; overflow: hidden; z-index: 1000;">
                        <a href="/kemerovo42-site/admin/index.html" style="display: block; padding: 12px 15px; text-decoration: none; color: #0f172a; font-weight: 500; border-bottom: 1px solid #e2e8f0;"><i class="fas fa-tachometer-alt" style="width: 20px;"></i> Админка</a>
                        <a href="/kemerovo42-site/admin/profile.html" style="display: block; padding: 12px 15px; text-decoration: none; color: #0f172a; font-weight: 500; border-bottom: 1px solid #e2e8f0;"><i class="fas fa-user" style="width: 20px;"></i> Мой профиль</a>
                        <button onclick="logoutUser()" style="width: 100%; text-align: left; padding: 12px 15px; background: none; border: none; color: #ef4444; font-weight: 500; cursor: pointer;"><i class="fas fa-sign-out-alt" style="width: 20px;"></i> Выйти</button>
                    </div>
                </div>

                <!-- Кнопка темы -->
                <button id="theme-toggle" style="background: rgba(255,255,255,0.1); border: none; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; color: white; cursor: pointer; transition: 0.2s;">
                    <i class="fas fa-moon"></i>
                </button>
            </div>
        </div>
      </header>
    `;

    // Логика бегущей строки
    const tickerWrap = document.getElementById('ticker-wrap');
    const tickerContent = document.getElementById('ticker-content');

    async function loadTicker() {
        try {
            const tickerSnap = await getDoc(doc(db, "settings", "ticker"));
            if (tickerSnap.exists() && tickerSnap.data().enabled === false) return;

            let textToShow = '';
            let speed = 25;

            if (tickerSnap.exists()) {
                const tData = tickerSnap.data();
                if (tData.mode === 'custom' && tData.customText) textToShow = tData.customText;
                if (tData.speed) speed = tData.speed;
            }

            if (!textToShow) {
                const snapshot = await getDocs(query(collection(db, "news"), orderBy("date", "desc"), limit(5)));
                if (!snapshot.empty) {
                    let titles = [];
                    snapshot.forEach(doc => titles.push(doc.data().title));
                    textToShow = titles.join(' • ') + ' • ';
                }
            }

            if (textToShow) {
                tickerContent.innerText = textToShow;
                tickerContent.style.animationDuration = `${speed}s`;
                tickerWrap.style.display = 'block';
            }
        } catch (e) { console.error(e); }
    }
    loadTicker();

    document.addEventListener('click', (e) => {
        const menu = document.getElementById('user-menu');
        const dropdown = document.getElementById('dropdown');
        if (menu && !menu.contains(e.target)) dropdown.style.display = 'none';
    });

    window.logoutUser = async function() {
        await auth.signOut();
        window.location.href = '/kemerovo42-site/index.html';
    };

    const nav = document.getElementById('main-nav');
    if (nav) {
        getDocs(collection(db, "categories")).then(snapshot => {
            nav.innerHTML = '<a href="/kemerovo42-site/index.html">Главная</a>';
            snapshot.forEach(doc => {
                const cat = doc.data();
                const urlParam = cat.slug ? `slug=${cat.slug}` : `slug=${encodeURIComponent(cat.name)}`;
                nav.innerHTML += `<a href="/kemerovo42-site/category.html?${urlParam}">${cat.name}</a>`;
            });
        });
    }

    onAuthStateChanged(auth, async (user) => {
        const loginBtn = document.getElementById('login-btn');
        const userMenu = document.getElementById('user-menu');
        const headerAvatar = document.getElementById('header-avatar');
        const headerUsername = document.getElementById('header-username');

        if (user) {
            loginBtn.style.display = 'none';
            userMenu.style.display = 'block';
            headerUsername.innerText = user.email.split('@')[0];

            try {
                const docSnap = await getDoc(doc(db, "users", user.uid));
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.photoURL) {
                        headerAvatar.src = data.photoURL;
                        headerAvatar.style.display = 'block';
                    } else if (data.displayName) {
                        headerAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.displayName)}&background=d4af37&color=0f172a&bold=true`;
                        headerAvatar.style.display = 'block';
                    }
                }
            } catch (e) {}
        } else {
            loginBtn.style.display = 'inline-flex';
            userMenu.style.display = 'none';
        }
    });

    const toggleBtn = document.getElementById('theme-toggle');
    if (siteTheme === 'dark') toggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
    
    toggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        if (document.body.classList.contains('dark-theme')) {
            localStorage.setItem('theme', 'dark');
            localStorage.setItem('admin_theme', 'dark');
            toggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            localStorage.setItem('theme', 'light');
            localStorage.setItem('admin_theme', 'light');
            toggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
        }
    });
}
