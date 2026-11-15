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
      <header>
        <div class="header-container">
            <div class="logo">
                <!-- Абсолютный путь к главной -->
                <a href="/kemerovo42-site/index.html" style="text-decoration: none; color: white;">
                    <h1>КЕМЕРОВО <span>42</span></h1>
                </a>
                <p>Официальный новостной портал</p>
            </div>
            
            <div class="auth-buttons" id="auth-buttons" style="display: flex; align-items: center; gap: 15px; margin-left: auto;">
                <!-- Абсолютные пути к админке -->
                <a href="/kemerovo42-site/admin/login.html" id="login-btn" class="btn-outline" style="text-decoration: none; display: inline-flex;">Войти</a>
                <a href="/kemerovo42-site/admin/index.html" id="dash-btn" class="btn-outline" style="text-decoration: none; display: none;">Панель управления</a>
                <a href="/kemerovo42-site/admin/profile.html" id="prof-btn" class="btn-outline" style="text-decoration: none; display: none; align-items: center; gap: 8px; padding: 6px 16px;">
                    <img id="header-avatar" src="" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover; display: none; background: #ccc;">
                    <span id="header-username">Профиль</span>
                </a>
            </div>
            <button id="theme-toggle" style="margin-left: 10px;"><i class="fas fa-moon"></i> Тёмная тема</button>
        </div>
      </header>
    `;

    // --- ЗАГРУЗКА МЕНЮ ---
    const nav = document.getElementById('main-nav');
    if (nav) {
        getDocs(collection(db, "categories")).then(snapshot => {
            // Принудительно оставляем только "Главную" (очищаем от старых дублей)
            nav.innerHTML = '<a href="/kemerovo42-site/index.html">Главная</a>';
            
            snapshot.forEach(doc => {
                const cat = doc.data();
                const urlParam = cat.slug ? `slug=${cat.slug}` : `slug=${encodeURIComponent(cat.name)}`;
                
                // Проверка на дубликат: если такая категория уже есть в меню, пропускаем
                const existingLink = Array.from(nav.querySelectorAll('a')).find(a => a.innerText === cat.name);
                if (!existingLink) {
                    nav.innerHTML += `<a href="/kemerovo42-site/category.html?${urlParam}">${cat.name}</a>`;
                }
            });
        }).catch(err => console.error("Ошибка загрузки меню:", err));
    }

    // --- АВТОРИЗАЦИЯ И КНОПКИ ---
    onAuthStateChanged(auth, async (user) => {
        const loginBtn = document.getElementById('login-btn');
        const dashBtn = document.getElementById('dash-btn');
        const profBtn = document.getElementById('prof-btn');
        const headerAvatar = document.getElementById('header-avatar');
        const headerUsername = document.getElementById('header-username');

        if (user) {
            loginBtn.style.display = 'none';
            dashBtn.style.display = 'inline-flex';
            profBtn.style.display = 'inline-flex';
            headerUsername.innerText = user.email.split('@')[0];

            try {
                const docSnap = await getDoc(doc(db, "users", user.uid));
                if (docSnap.exists() && docSnap.data().photoURL) {
                    headerAvatar.src = docSnap.data().photoURL;
                    headerAvatar.style.display = 'block';
                }
            } catch (e) {
                console.log("Ошибка загрузки аватарки", e);
            }
        } else {
            loginBtn.style.display = 'inline-flex';
            dashBtn.style.display = 'none';
            profBtn.style.display = 'none';
        }
    });

    // --- ЛОГИКА ТЕМЫ ---
    const toggleBtn = document.getElementById('theme-toggle');
    const body = document.body;
    const currentTheme = localStorage.getItem('theme');
    
    if (currentTheme === 'dark') {
        body.classList.add('dark-theme');
        if(toggleBtn) toggleBtn.innerHTML = '<i class="fas fa-sun"></i> Светлая тема';
    }

    if(toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            body.classList.toggle('dark-theme');
            if (body.classList.contains('dark-theme')) {
                localStorage.setItem('theme', 'dark');
                toggleBtn.innerHTML = '<i class="fas fa-sun"></i> Светлая тема';
            } else {
                localStorage.setItem('theme', 'light');
                toggleBtn.innerHTML = '<i class="fas fa-moon"></i> Тёмная тема';
            }
        });
    }
}
