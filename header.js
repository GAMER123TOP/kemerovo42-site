import { firebaseConfig } from './firebase-config.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export function renderHeader() {
    const container = document.getElementById('header-container');
    if (!container) return;

    container.innerHTML = `
      <header id="main-header" style="position: sticky; top: 0; z-index: 100; transition: all 0.3s ease; background: #0f172a; border-bottom: 4px solid var(--accent);">
        <div class="header-container" style="display: flex; align-items: center; justify-content: space-between; padding: 15px 24px;">
            <div class="logo">
                <a href="/kemerovo42-site/index.html" style="text-decoration: none; color: white;">
                    <h1>КЕМЕРОВО <span>42</span></h1>
                </a>
            </div>

            <div class="search-container" style="margin-left: auto; margin-right: 15px; display: flex; align-items: center;">
                <input type="text" id="search-input" placeholder="Поиск..." style="display: none; padding: 8px 12px; border-radius: 20px; border: none; outline: none; margin-right: 10px; font-family: inherit; background: rgba(255,255,255,0.1); color: white; width: 200px;" onkeypress="if(event.key === 'Enter') window.location.href='/kemerovo42-site/search.html?q=' + encodeURIComponent(this.value)">
                <button onclick="document.getElementById('search-input').style.display = document.getElementById('search-input').style.display === 'block' ? 'none' : 'block'" style="background: none; border: none; color: white; font-size: 1.2rem; cursor: pointer; padding: 5px;"><i class="fas fa-search"></i></button>
            </div>
            
            <div class="auth-buttons" id="auth-buttons" style="display: flex; align-items: center; gap: 10px;">
                <a href="/kemerovo42-site/suggest.html" class="btn-outline" style="text-decoration: none; padding: 8px 15px; font-size: 0.85rem;"><i class="fas fa-bullhorn"></i> Предложить</a>
                <a href="/kemerovo42-site/admin/login.html" id="login-btn" class="btn-outline" style="text-decoration: none; padding: 8px 15px; font-size: 0.85rem;">Войти</a>
                
                <!-- Меню пользователя (скрыто по умолчанию) -->
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

                <button id="theme-toggle" style="background: rgba(255,255,255,0.1); border: none; border-radius: 30px; padding: 8px 12px; color: white; cursor: pointer;"><i class="fas fa-moon"></i></button>
            </div>
        </div>
      </header>
    `;

    // Эффект матового стекла при скролле
    window.addEventListener('scroll', () => {
        const header = document.getElementById('main-header');
        if (window.scrollY > 50) {
            header.style.background = 'rgba(15, 23, 42, 0.85)';
            header.style.backdropFilter = 'blur(10px)';
            header.style.borderBottom = '4px solid transparent';
        } else {
            header.style.background = '#0f172a';
            header.style.backdropFilter = 'none';
            header.style.borderBottom = '4px solid var(--accent)';
        }
    });

    // Закрытие меню при клике вне его
    document.addEventListener('click', (e) => {
        const menu = document.getElementById('user-menu');
        const dropdown = document.getElementById('dropdown');
        if (menu && !menu.contains(e.target)) {
            dropdown.style.display = 'none';
        }
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
    const body = document.body;
    if (localStorage.getItem('theme') === 'dark') {
        body.classList.add('dark-theme');
        toggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
    }
    toggleBtn.addEventListener('click', () => {
        body.classList.toggle('dark-theme');
        if (body.classList.contains('dark-theme')) {
            localStorage.setItem('theme', 'dark');
            toggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            localStorage.setItem('theme', 'light');
            toggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
        }
    });
}
