import { firebaseConfig } from '../firebase-config.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { showConfirm } from '../ui.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export function renderSidebar(activePage) {
    const container = document.getElementById('sidebar-container');
    if (!container) return;

    if (!document.getElementById('sidebar-styles')) {
        const style = document.createElement('style');
        style.id = 'sidebar-styles';
        style.innerHTML = `
            .logout-btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 10px; margin-top: 10px; background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.85rem; transition: 0.2s; }
            .logout-btn:hover { background: #ef4444; color: white; }
        `;
        document.head.appendChild(style);
    }

    container.innerHTML = `
      <aside class="sidebar">
        <div class="sidebar-logo">КЕМЕРОВО <span>42</span></div>
        <ul class="sidebar-menu">
          <li><a href="index.html" class="${activePage === 'dashboard' ? 'active' : ''}"><i class="fas fa-home"></i> Панель управления</a></li>
          <li><a href="posts.html" class="${activePage === 'posts' ? 'active' : ''}"><i class="fas fa-newspaper"></i> Записи</a></li>
          <li><a href="archive.html" class="${activePage === 'archive' ? 'active' : ''}"><i class="fas fa-archive"></i> Архив</a></li>
          <li><a href="create.html" class="${activePage === 'create' ? 'active' : ''}"><i class="fas fa-plus-circle"></i> Добавить новость</a></li>
          <li><a href="categories.html" class="${activePage === 'categories' ? 'active' : ''}"><i class="fas fa-tags"></i> Категории</a></li>
          <li><a href="polls.html" class="${activePage === 'polls' ? 'active' : ''}"><i class="fas fa-poll"></i> Опросы</a></li>
          <li id="menu-sugg-li" style="display: none;">
              <a href="suggestions.html" class="${activePage === 'suggestions' ? 'active' : ''}" style="display: flex; align-items: center;">
                  <i class="fas fa-bullhorn"></i> Предложки 
                  <span id="sugg-count" style="display:none; background: #ef4444; color: white; border-radius: 10px; padding: 2px 8px; font-size: 0.7rem; margin-left: auto;"></span>
              </a>
          </li>
          <li id="menu-users-li" style="display: none;"><a href="users.html" class="${activePage === 'users' ? 'active' : ''}"><i class="fas fa-users"></i> Пользователи</a></li>
          <li><a href="guide.html" class="${activePage === 'guide' ? 'active' : ''}"><i class="fas fa-book"></i> Памятка для СМИ</a></li>
          <li><a href="../index.html"><i class="fas fa-external-link-alt"></i> На сайт</a></li>
        </ul>
        <div class="sidebar-user" style="flex-direction: column; align-items: stretch;">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 10px;">
              <img id="sb-avatar" src="https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png" alt="Аватар">
              <div class="sidebar-user-info">
                <span class="sidebar-user-name" id="sb-name">Загрузка...</span>
                <span class="sidebar-user-role" id="sb-role">...</span>
              </div>
          </div>
          <button onclick="handleLogout()" class="logout-btn"><i class="fas fa-sign-out-alt"></i> Выйти</button>
        </div>
      </aside>
    `;

    onAuthStateChanged(auth, async (user) => {
        if (!user) { window.location.href = 'login.html'; return; }
        
        const token = await user.getIdTokenResult();
        const isAdmin = token.claims.admin === true;
        const isModerator = token.claims.moderator === true;
        
        let roleText = 'Редактор';
        if (isAdmin) roleText = 'Администратор';
        else if (isModerator) roleText = 'Модератор';
        
        document.getElementById('sb-name').innerText = user.email.split('@')[0];
        document.getElementById('sb-role').innerText = roleText;
        
        if (isAdmin) document.getElementById('menu-users-li').style.display = 'block';
        
        if (isAdmin || isModerator) {
            document.getElementById('menu-sugg-li').style.display = 'block';
            try {
                const suggSnap = await getDocs(collection(db, "suggestions"));
                if (suggSnap.size > 0) {
                    const countSpan = document.getElementById('sugg-count');
                    countSpan.innerText = suggSnap.size;
                    countSpan.style.display = 'inline-block';
                }
            } catch (e) { }
        }

        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (userSnap.exists()) {
            const data = userSnap.data();
            if (data.photoURL) {
                document.getElementById('sb-avatar').src = data.photoURL;
            } else if (data.displayName) {
                document.getElementById('sb-avatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.displayName)}&background=0f172a&color=d4af37&bold=true`;
            }
        }
    });

    window.handleLogout = function() {
        showConfirm('Выход', 'Вы уверены, что хотите выйти из аккаунта?', async () => {
            await signOut(auth);
            window.location.href = 'login.html';
        }, 'Выйти');
    };
}
