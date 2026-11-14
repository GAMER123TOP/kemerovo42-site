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
