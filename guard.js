import { db, auth } from './firebase-config.js';
import { getDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

export function checkAccess() {
    onAuthStateChanged(auth, async (user) => {
        const currentPath = window.location.pathname;
        
        // Список страниц, куда можно заходить БЕЗ проверки (логин, тех. работы, отказ в доступе)
        const publicPaths = [
            'maintenance.html', 
            'access-denied.html', 
            'admin/login.html'
        ];

        // Если мы уже на одной из технических страниц - ничего не делаем
        if (publicPaths.some(path => currentPath.includes(path))) return;

        let isAdmin = false;
        let isWhitelisted = false;

        // 1. Получаем токен и данные пользователя (если авторизован)
        if (user) {
            try {
                const token = await user.getIdTokenResult();
                isAdmin = !!token.claims.admin;

                // Проверяем поле isWhitelisted в профиле пользователя
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    isWhitelisted = userDoc.data().isWhitelisted === true;
                }
            } catch (e) {
                console.error("Ошибка проверки прав:", e);
            }
        }

        // 2. ПРОВЕРКА РЕЖИМА ОБСЛУЖИВАНИЯ
        try {
            const maintSnap = await getDoc(doc(db, "settings", "maintenance"));
            if (maintSnap.exists() && maintSnap.data().enabled === true) {
                // Если режим включен - пускаем ТОЛЬКО админов
                if (!isAdmin) {
                    window.location.href = '/kemerovo42-site/maintenance.html';
                    return;
                }
            }
        } catch (e) { console.error("Ошибка проверки maintenance:", e); }

        // 3. ПРОВЕРКА БЕЛОГО СПИСКА
        // Если это НЕ админ И НЕ в белом списке - выкидываем
        if (!isAdmin && !isWhitelisted) {
            // Если пользователь вообще не авторизован - кидаем на логин
            if (!user) {
                window.location.href = '/kemerovo42-site/admin/login.html';
            } else {
                // Если авторизован, но не в списке - кидаем на страницу отказа
                window.location.href = '/kemerovo42-site/access-denied.html';
            }
        }
    });
}
