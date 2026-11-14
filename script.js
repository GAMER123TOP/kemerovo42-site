// ====== ПЕРЕКЛЮЧАТЕЛЬ ТЕМ ======
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

// ====== СИСТЕМА РЕГИСТРАЦИИ ЧЕРЕЗ DISCORD ======
const modal = document.getElementById('register-modal');
const regBtn = document.getElementById('register-btn');
const closeBtn = document.querySelector('.close');
const form = document.getElementById('register-form');
const statusDiv = document.getElementById('form-status');

// ⚠️ ВСТАВЬ СЮДА НОВЫЙ URL ВЕБХУКА (создай новый в Discord!)
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1526931337389539401/chnAgjx2rxyTkKP2EvBuYGGFtfbFpvDjDnxzmOaXMe3g3l14_VxvAX4hsaQNtojGgD_S';

if(regBtn) {
    regBtn.onclick = () => modal.style.display = "block";
    closeBtn.onclick = () => modal.style.display = "none";
    window.onclick = (event) => { if (event.target == modal) modal.style.display = "none"; }

    form.onsubmit = async function(e) {
        e.preventDefault();
        const nick = document.getElementById('discord-nick').value;
        const rpName = document.getElementById('rp-name').value;
        
        statusDiv.innerHTML = '<span style="color: #f39c12;">⏳ Отправка...</span>';

        const payload = {
            embeds: [{
                title: "📝 Новая заявка на регистрацию",
                color: 3447003,
                fields: [
                    { name: "Discord Nickname", value: nick, inline: true },
                    { name: "ФИО (РП)", value: rpName, inline: true }
                ],
                footer: { text: "Кемерово 42 | Заявки" },
                timestamp: new Date().toISOString()
            }]
        };

        try {
            const response = await fetch(DISCORD_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                statusDiv.innerHTML = '<span style="color: #2ecc71;">✅ Заявка отправлена! Ожидайте в Discord.</span>';
                form.reset();
            } else {
                statusDiv.innerHTML = '<span style="color: #e74c3c;">❌ Ошибка отправки.</span>';
            }
        } catch (error) {
            statusDiv.innerHTML = '<span style="color: #e74c3c;">❌ Ошибка сети.</span>';
        }
    }
}