import { db, auth } from './firebase-config.js';
import { getDoc, doc, collection, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

export function renderHeader() {
    const container = document.getElementById('header-container');
    if (!container) return;

    // Подключаем шрифты, если их нет
    if (!document.querySelector('link[href*="fonts.googleapis.com"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Georgia&display=swap';
        document.head.appendChild(link);
    }

    const siteTheme = localStorage.getItem('theme') || 'light';
    if (siteTheme === 'dark') document.body.classList.add('dark-theme');

    container.innerHTML = `
      <div class="ticker-wrap" id="ticker-wrap" style="display: none; background: #f9fafb; border-bottom: 1px solid #e5e7eb; padding: 8px 0; overflow: hidden; white-space: nowrap;">
          <div class="ticker" id="ticker-content" style="display: inline-block; animation: ticker 30s linear infinite; font-size: 0.85rem; color: #6b7280; font-weight: 500;"></div>
      </div>

      <header id="main-header" style="background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); border-bottom: 1px solid #e5e7eb; position: sticky; top: 0; z-index: 100; transition: 0.3s;">
        <div style="max-width: 1200px; margin: 0 auto; padding: 15px 20px; display: flex; align-items: center; justify-content: space-between;">
            <div class="logo">
                <a href="/kemerovo42-site/index.html" style="text-decoration: none; color: #1a1a1a;">
                    <h1 style="font-family: 'Georgia', serif; font-size: 1.8rem; margin: 0; letter-spacing: -0.02em;">КЕМЕРОВО <span style="font-weight: 400;">42</span></h1>
                </a>
            </div>

            <div class="search-container" style="display: flex; align-items: center; gap: 10px;">
                <input type="text" id="search-input" placeholder="Поиск..." style="display: none; padding: 8px 16px; border-radius: 20px; border: 1px solid #e5e7eb; outline: none; font-family: inherit; background: #fff; width: 200px; font-size: 0.9rem;" onkeypress="if(event.key === 'Enter') window.location.href='/kemerovo42-site/search.html?q=' + encodeURIComponent(this.value)">
                <button onclick="toggleSearch()" style="background: none; border: none; color: #1a1a1a; font-size: 1.1rem; cursor: pointer; padding: 5px;"><i class="fas fa-search"></i></button>
            </div>
            
            <div class="auth-buttons" id="auth-buttons" style="display: flex; align-items: center; gap: 15px;">
                <a href="/kemerovo42-site/suggest.html" style="text-decoration: none; color: #1a1a1a; font-size: 0.9rem; font-weight: 500;"><i class="fas fa-bullhorn"></i> Предложить</a>
                <a href="/kemerovo42-site/admin/login.html" id="login-btn" style="text-decoration: none; color: #1a1a1a; font-size: 0.9rem; font-weight: 500;">Войти</a>
                
                <div id="user-menu" style="display: none; position: relative;">
                    <button onclick="toggleDropdown()" style="background: none; border: none; display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 0;">
                        <img id="header-avatar" src="" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; background: #f3f4f6;">
                        <span id="header-username" style="font-weight: 600; font-size: 0.9rem; color: #1a1a1a;">Профиль</span>
                    </button>
                    <div id="dropdown" style="display: none; position: absolute; right: 0; top: 45px; background: white; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); min-width: 180px; overflow: hidden; z-index: 1000; border: 1px solid #e5e7eb;">
                        <a href="/kemerovo42-site/admin/index.html" style="display: block; padding: 12px 15px; text-decoration: none; color: #1a1a1a; font-size: 0.9rem; border-bottom: 1px solid #f3f4f6;">Админка</a>
                        <a href="/kemerovo42-site/admin/profile.html" style="display: block; padding: 12px 15px; text-decoration: none; color: #1a1a1a; font-size: 0.9rem; border-bottom: 1px solid #f3f4f6;">Мой профиль</a>
                        <button onclick="logoutUser()" style="width: 100%; text-align: left; padding: 12px 15px; background: none; border: none; color: #ef4444; font-size: 0.9rem; cursor: pointer;">Выйти</button>
                    </div>
                </div>

                <button id="theme-toggle" style="background: none; border: none; color: #1a1a1a; font-size: 1.1rem; cursor: pointer; padding: 5px;"><i class="fas fa-moon"></i></button>
            </div>
        </div>
      </header>
    `;

    // Логика тикера, поиска, дропдауна и темы остается прежней, но адаптирована под новый стиль
    const tickerWrap = document.getElementById('ticker-wrap');
    const tickerContent = document.getElementById('ticker-content');

    async function loadTicker() {
        try {
            const tickerSnap = await getDoc(doc(db, "settings", "ticker"));
            if (tickerSnap.exists() && tickerSnap.data().enabled === false) return;
            let textToShow = '';
            if (tickerSnap.exists() && tickerSnap.data().customText) {
                textToShow = tickerSnap.data().customText;
            } else {
                const snapshot = await getDocs(query(collection(db, "news"), orderBy("date", "desc"), limit(5)));
                if (!snapshot.empty) {
                    let titles = [];
                    snapshot.forEach(d => titles.push(d.data().title));
                    textToShow = titles.join(' • ') + ' • ';
                }
            }
            if (textToShow) {
                tickerContent.innerText = textToShow;
                tickerWrap.style.display = 'block';
            }
        } catch (e) { console.error(e); }
    }
    loadTicker();

    window.toggleSearch = () => {
        const inp = document.getElementById('search-input');
        inp.style.display = inp.style.display === 'block' ? 'none' : 'block';
        if(inp.style.display === 'block') inp.focus();
    };

    window.toggleDropdown = () => {
        const d = document.getElementById('dropdown');
        d.style.display = d.style.display === 'block' ? 'none' : 'block';
    };

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
            nav.innerHTML = '<a href="/kemerovo42-site/index.html" style="padding: 15px 0; text-decoration: none; color: #1a1a1a; font-weight: 600; border-bottom: 2px solid #1a1a1a;">Главная</a>';
            snapshot.forEach(doc => {
                const cat = doc.data();
                const urlParam = cat.slug ? `slug=${cat.slug}` : `slug=${encodeURIComponent(cat.name)}`;
                nav.innerHTML += `<a href="/kemerovo42-site/category.html?${urlParam}" style="padding: 15px 0; text-decoration: none; color: #6b7280; font-weight: 500; border-bottom: 2px solid transparent; transition: 0.2s;">${cat.name}</a>`;
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
                    if (data.photoURL) headerAvatar.src = data.photoURL;
                    else if (data.displayName) headerAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.displayName)}&background=e5e7eb&color=1a1a1a&bold=true`;
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
        const isDark = document.body.classList.contains('dark-theme');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        toggleBtn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    });
}
