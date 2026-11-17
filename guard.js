import { db, auth } from './firebase-config.js';
import { getDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

export function checkMaintenance() {
    onAuthStateChanged(auth, async (user) => {
        let hasAccess = false;

        if (user) {
            // 1. Проверяем, является ли пользователь админом
            try {
                const token = await user.getIdTokenResult();
                if (token.claims.admin) hasAccess = true;
            } catch (e) { console.log("Ошибка проверки токена", e); }

            // 2. Если не админ, проверяем белый список
            if (!hasAccess) {
                try {
                    const wlSnap = await getDoc(doc(db, "settings", "maintenance_whitelist"));
                    if (wlSnap.exists()) {
                        const allowedUids = wlSnap.data().uids || [];
                        if (allowedUids.includes(user.uid)) {
                            hasAccess = true;
                        }
                    }
                } catch (e) { console.log("Ошибка проверки белого списка", e); }
            }
        }

        // 3. Логика редиректа
        try {
            const maintSnap = await getDoc(doc(db, "settings", "maintenance"));
            if (maintSnap.exists() && maintSnap.data().enabled === true) {
                // Если режим включен И у юзера НЕТ доступа -> выкидываем
                if (!hasAccess && !window.location.pathname.includes('maintenance.html')) {
                    window.location.href = '/kemerovo42-site/maintenance.html';
                }
            }
        } catch (e) {
            console.log("Ошибка проверки режима обслуживания", e);
        }
    });
}
