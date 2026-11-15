export function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 10000; display: flex; flex-direction: column; gap: 10px; pointer-events: none;';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const colors = {
        success: '#10b981', error: '#ef4444', info: '#3b82f6'
    };
    const icons = {
        success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle'
    };

    toast.style.cssText = `
        background: #1e293b; color: white; padding: 15px 25px; border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2); display: flex; align-items: center; gap: 12px;
        font-family: 'Inter', sans-serif; font-size: 0.95rem; font-weight: 500;
        border-left: 4px solid ${colors[type]}; opacity: 0; transform: translateX(50px);
        transition: all 0.3s ease; pointer-events: auto;
    `;
    
    toast.innerHTML = `<i class="fas ${icons[type]}" style="color: ${colors[type]}; font-size: 1.2rem;"></i> <span>${message}</span>`;
    container.appendChild(toast);

    // Анимация появления
    setTimeout(() => { toast.style.opacity = '1'; toast.style.transform = 'translateX(0)'; }, 10);

    // Удаление
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(50px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

export function showConfirm(title, text, onConfirm, btnText = 'Да, удалить') {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); z-index: 10000;
        display: flex; align-items: center; justify-content: center;
        opacity: 0; transition: opacity 0.2s;
    `;

    modal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 12px; max-width: 400px; width: 90%; box-shadow: 0 20px 40px rgba(0,0,0,0.2); transform: scale(0.9); transition: transform 0.2s; font-family: 'Inter', sans-serif;">
            <h3 style="margin-bottom: 10px; font-family: 'Montserrat'; font-size: 1.3rem; color: #0f172a;">${title}</h3>
            <p style="color: #64748b; margin-bottom: 25px; font-size: 0.95rem;">${text}</p>
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button id="cancel-btn" style="padding: 10px 20px; border-radius: 6px; border: 1px solid #cbd5e1; background: white; cursor: pointer; font-weight: 600; color: #0f172a;">Отмена</button>
                <button id="confirm-btn" style="padding: 10px 20px; border-radius: 6px; border: none; background: #ef4444; color: white; cursor: pointer; font-weight: 600;">${btnText}</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => { modal.style.opacity = '1'; modal.querySelector('div').style.transform = 'scale(1)'; }, 10);

    const close = () => {
        modal.style.opacity = '0';
        modal.querySelector('div').style.transform = 'scale(0.9)';
        setTimeout(() => modal.remove(), 200);
    };

    modal.querySelector('#cancel-btn').onclick = close;
    modal.querySelector('#confirm-btn').onclick = () => {
        close();
        onConfirm();
    };
}
