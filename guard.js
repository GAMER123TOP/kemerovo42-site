import { firebaseConfig } from './firebase-config.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export function checkMaintenance() {
    onAuthStateChanged(auth, async (user) => {
        let isAdmin = false;
        if (user) {
            const token = await user.getIdTokenResult();
            if (token.claims.admin) isAdmin = true;
        }

        try {
            const docSnap = await getDoc(doc(db, "settings", "maintenance"));
            if (docSnap.exists() && docSnap.data().enabled === true) {
                // Если режим включен и это не админ — выкидываем
                if (!isAdmin && !window.location.pathname.includes('maintenance.html')) {
                    window.location.href = '/kemerovo42-site/maintenance.html';
                }
            }
        } catch (e) {
            console.log("Ошибка проверки режима обслуживания", e);
        }
    });
}
