import { db, auth } from './firebase-config.js';
import { getDoc, doc, collection, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

export function renderHeader() {
    const container = document.getElementById('header-container');
    if (!container) return;

    // --- ПРЕДЗАГРУЗКА ШРИФТОВ (если еще не добавлены в HTML) ---
    if (!document.querySelector('link[href="https://fonts.googleapis.com"]')) {
        const preconnect1 = document.createElement('link');
        preconnect1.rel = 'preconnect';
        preconnect1.href = 'https://fonts.googleapis.com';
        document.head.appendChild(preconnect1);

        const preconnect2 = document.createElement('link');
        preconnect2.rel = 'preconnect';
        preconnect2.href = 'https://fonts.gstatic.com';
        preconnect2.crossOrigin = 'anonymous';
        document.head.appendChild(preconnect2);
    }

    const siteTheme = localStorage.getItem('theme') || 'light';
    if (siteTheme === 'dark') document.body.classList.add('dark-theme');

    container.innerHTML = `
      <div class="ticker-wrap" id="ticker-wrap" style="display: none;">
          <div class="ticker" id="ticker-content">Загрузка...</div>
      </div>

      <header id="main-header">
        <div class="header-container">
            <div class="logo">
                <a href="/kemerovo42-site/index.html" style="text-decoration: none; color: white;">
                    <h1>КЕМЕРОВО <span>42</span></h1>
                </a>
                <p>Официальный новостной портал</p>
            </div>

            <div class="search-container" style="margin-left: auto; margin-right: 15px; display: flex; align-items: center;">
                <input type="text" id="search-input" placeholder="Поиск..." style="display: none; padding: 8px 12px; border-radius: 20px; border: none; outline: none; margin-right: 10px; font-family: inherit; background: rgba(255,255,255,0.1); color: white; width: 200px;" onkeypress="if(event.key === 'Enter') window.location.href='/kemerovo42-site/search.html?q=' + encodeURIComponent(this.value)">
                <button onclick="document.getElementById('search-input').style.display = document.getElementById('search-input').style.display === 'block' ? 'none' : 'block'" style="background: none; border: none; color: white; font-size: 1.2rem; cursor: pointer; padding: 5px;"><i class="fas fa-search"></i></button>
            </div>
            
            <div class="auth-buttons" id="auth-buttons">
                <a href="/kemerovo42-site/suggest.html" class="btn-outline"><i class="fas fa-bullhorn"></i> Предложить</a>
                <a href="/kemerovo42-site/admin/login.html" id="login-btn" class="btn-outline">Войти</a>
                
                <div id="user-menu" style="display: none; position: relative;">
                    <button onclick="document.getElementById('dropdown').style.display = document.getElementById('dropdown').style.display === 'block' ? 'none' : 'block'" style="background: rgba(255,255,255,0.1); border: none; border-radius: 30px; padding: 4px; display: flex; align-items: center; gap: 8px; cursor: pointer; color: white;">
                        <img id="header-avatar" src="" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;">
                        <span id="header-username" style="font-weight: 600; font-size: 0.9rem; padding-right: 8px;">Профиль</span>
                    </button>
                    <div id="dropdown" style="display: none; position: absolute; right: 0; top: 45px; background: white; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); min-width: 180px; overflow: hidden; z-index: 1000;">
                        <a href="/kemerovo42-site/admin/index.html" style="display: block; padding: 12px 15px; text-decoration: none; color: #0f172a; font-weight: 500; border-bottom: 1px solid #e2e8f0;"><i class="fas fa-tachometer-alt" style="width: 20px;"></i> Админка</a>
                        <a href="/kemerovo42-site/admin/profile.html" style="display: block; padding: 12px 15px; text-decoration: none; color: #0f172a; font-weight: 500; border-bottom: 1px solid #e2e8f0;"><i class="fas fa-user" style="width: 20px;"></i> Мой профиль</a>
                        <button onclick="logoutUser()" style="width: 100%; text-align: left; padding: 12px 15px; background: none; border: none; color: #ef4444; font-weight: 500; cursor: pointer;"><i class="fas fa-sign-out-alt" style="width: 20px;"></i> Выйти</button>
                    </div>
                </div>

                <button id="theme-toggle"><i class="fas fa-moon"></i></button>
            </div>
        </div>
      </header>
    `;

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
                    snapshot.forEach(doc => titles.push(doc.data().title));
                    textToShow = titles.join(' • ') + ' • ';
                }
            }

            if (textToShow) {
                tickerContent.innerText = textToShow;
                tickerWrap.style.display = 'block';
            }
        } catch (e) {
            console.error("Ошибка загрузки бегущей строки:", e);
        }
    }
    loadTicker();

    window.addEventListener('scroll', () => {
        const header = document.getElementById('main-header');
        if (window.scrollY > 50) {
            header.style.background = 'rgba(15, 23, 42, 0.85)';
            header.style.backdropFilter = 'blur(10px)';
        } else {
            header.style.background = 'var(--header-bg)';
            header.style.backdropFilter = 'none';
        }
    });

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
                    if (data.photoURL) headerAvatar.src = data.photoURL;
                    else if (data.displayName) headerAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.displayName)}&background=d4af37&color=0f172a&bold=true`;
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
