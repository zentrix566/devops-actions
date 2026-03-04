const APP_VERSION = 'v1.0.0';
const ENVIRONMENT = 'production';

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    document.getElementById('version').textContent = APP_VERSION;
    document.getElementById('env').textContent = ENVIRONMENT;
    loadDeployHistory();
}

function loadDeployHistory() {
    const history = JSON.parse(localStorage.getItem('deployHistory') || '[]');
    if (history.length > 0) {
        renderDeployList(history);
    }
}

function renderDeployList(deploys) {
    const list = document.getElementById('deployList');
    list.innerHTML = deploys.map(deploy => `
        <li>
            <span class="deploy-time">${deploy.time}</span>
            <span class="deploy-version">${deploy.version}</span>
            <span class="deploy-status ${deploy.status}">${getStatusText(deploy.status)}</span>
        </li>
    `).join('');
}

function getStatusText(status) {
    const map = {
        'success': '成功',
        'pending': '进行中',
        'failed': '失败'
    };
    return map[status] || status;
}

function simulateDeploy() {
    const list = document.getElementById('deployList');
    const now = new Date();
    const timeStr = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).replace(/\//g, '-');

    const newDeploy = document.createElement('li');
    newDeploy.innerHTML = `
        <span class="deploy-time">${timeStr}</span>
        <span class="deploy-version">${APP_VERSION}</span>
        <span class="deploy-status pending">进行中</span>
    `;
    list.insertBefore(newDeploy, list.firstChild);

    setTimeout(() => {
        newDeploy.querySelector('.deploy-status').className = 'deploy-status success';
        newDeploy.querySelector('.deploy-status').textContent = '成功';
        saveToHistory({ time: timeStr, version: APP_VERSION, status: 'success' });
    }, 2000);
}

function saveToHistory(deploy) {
    const history = JSON.parse(localStorage.getItem('deployHistory') || '[]');
    history.unshift(deploy);
    localStorage.setItem('deployHistory', JSON.stringify(history.slice(0, 10)));
}

function toggleGray() {
    const info = document.getElementById('grayInfo');
    if (info.style.display === 'none') {
        info.style.display = 'block';
    } else {
        info.style.display = 'none';
    }
}
