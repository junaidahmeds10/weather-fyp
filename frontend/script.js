// Test/Public API Key for immediate working (fallback)
const API_KEY = 'e573010b91d9043236e788e0018f3a57';

const themeToggleBtn = document.getElementById('themeToggleBtn');
const searchBtn = document.getElementById('searchBtn');
const cityInput = document.getElementById('cityInput');
const tabBtns = document.querySelectorAll('.tab-btn');
const navItems = document.querySelectorAll('.nav-item');

const forecastData = {
    today: [
        { time: '10 am', temp: 16, icon: 'cloud' },
        { time: '11 am', temp: 17, icon: 'rain' },
        { time: '12 pm', temp: 18, icon: 'cloud' },
        { time: '01 pm', temp: 19, icon: 'sun' }
    ],
    tomorrow: [
        { time: '10 am', temp: 20, icon: 'sun' },
        { time: '11 am', temp: 22, icon: 'sun' },
        { time: '12 pm', temp: 24, icon: 'cloud' },
        { time: '01 pm', temp: 23, icon: 'cloud' }
    ],
    next3: [
        { time: 'Mon', temp: 21, icon: 'cloud' },
        { time: 'Tue', temp: 19, icon: 'rain' },
        { time: 'Wed', temp: 22, icon: 'sun' },
        { time: 'Thu', temp: 24, icon: 'sun' }
    ]
};

// Toggle Dark/Light Mode
themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
});

// Render Hourly Forecast Cards
function renderGrids(tabKey) {
    const grids = [document.getElementById('hourlyGrid'), document.getElementById('miniHourlyGrid')];
    const items = forecastData[tabKey];

    grids.forEach(grid => {
        if (!grid) return;
        grid.innerHTML = '';
        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'hour-card';
            card.innerHTML = `
                <span class="hour-time">${item.time}</span>
                <div class="hour-icon">${getMiniIcon(item.icon)}</div>
                <strong class="hour-temp">${item.temp}°</strong>
            `;
            card.addEventListener('click', () => {
                document.getElementById('tooltipTime').innerText = item.time;
                document.getElementById('tooltipTemp').innerText = `${item.temp}°`;
            });
            grid.appendChild(card);
        });
    });
}

function getMiniIcon(type) {
    if (type === 'rain') {
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 16.2A4.5 4.5 0 0 0 17.5 8h-1.8A7 7 0 1 0 4 14.9"/><path d="M16 14v4"/><path d="M8 14v4"/><path d="M12 16v4"/></svg>`;
    } else if (type === 'sun') {
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFB800" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/></svg>`;
    }
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>`;
}

// Draw Smooth Curve
function drawCurve() {
    const pathD = "M 0 75 Q 45 75, 75 55 T 145 45 T 215 30 T 285 60 T 360 70";
    const areaD = `${pathD} L 360 110 L 0 110 Z`;
    const curveLine = document.getElementById('curveLine');
    const curveArea = document.getElementById('curveArea');
    if (curveLine) curveLine.setAttribute('d', pathD);
    if (curveArea) curveArea.setAttribute('d', areaD);
}

// Forecast Tab Switching
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderGrids(btn.dataset.tab);
    });
});

// Bottom Navigation Bar Logic
navItems.forEach(item => {
    item.addEventListener('click', () => {
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        
        const page = item.dataset.page;
        if (page === 'home') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (page === 'search') {
            if (cityInput) cityInput.focus();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (page === 'analytics') {
            const rightCol = document.querySelector('.right-column');
            if (rightCol) rightCol.scrollIntoView({ behavior: 'smooth' });
        } else if (page === 'settings') {
            document.body.classList.toggle('dark-theme');
        }
    });
});

// Live Weather Search Event Listeners
if (searchBtn) {
    searchBtn.addEventListener('click', () => {
        const city = cityInput.value.trim();
        if (city) fetchWeather(city);
    });
}

if (cityInput) {
    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const city = cityInput.value.trim();
            if (city) fetchWeather(city);
        }
    });
}

// Main Weather Fetch Function (Connected to Backend API & MongoDB)
// Main Weather Fetch Function (Connected to Backend API & MongoDB)
async function fetchWeather(city) {
    try {
        const res = await fetch(`http://localhost:5000/api/weather/${encodeURIComponent(city)}`);
        const data = await res.json();
        
        if (res.ok) {
            // Backend se aane wale object ke keys (city, temp, condition, windSpeed, humidity, clouds) ke mutabiq UI update
            document.getElementById('displayCity').innerText = `Saad Shaikh • ${data.city}`;
            document.getElementById('mainTemp').innerText = `${data.temp}°C`;
            document.getElementById('weatherCondition').innerText = data.condition;
            document.getElementById('windVal').innerText = `${data.windSpeed} m/s`;
            document.getElementById('humidityVal').innerText = `${data.humidity}%`;
            document.getElementById('rainVal').innerText = `${data.clouds}%`;
            
            // Clear search input after success
            if (cityInput) cityInput.value = '';
        } else {
            alert(`City not found: "${city}". Please check the spelling.`);
        }
    } catch (err) {
        console.error('Network or API Error:', err);
        alert('Failed to connect to backend server. Make sure node server.js is running.');
    }
}

// Initialize App on Load
window.addEventListener('DOMContentLoaded', () => {
    fetchWeather('Karachi');
    renderGrids('today');
    drawCurve();
});