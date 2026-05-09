let mainChart;
let miniChart;
const MAX_DATA_POINTS = 10;

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initCharts();
    updateDateTime();
    fetchData();
    fetchLCD();
    
    setInterval(updateDateTime, 1000);
    setInterval(fetchData, 5000); // Polling every 5 seconds
});

function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    document.getElementById('userName').textContent = user.name;
}

function logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

function updateDateTime() {
    const now = new Date();
    const options = { timeZone: 'Asia/Kolkata', hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const dateOptions = { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' };
    
    document.getElementById('liveTime').textContent = now.toLocaleTimeString('en-IN', options);
    document.getElementById('liveDate').textContent = now.toLocaleDateString('en-IN', dateOptions);
}

// Chart.js Configuration
function initCharts() {
    const ctx = document.getElementById('mainChart').getContext('2d');
    const gradient1 = ctx.createLinearGradient(0, 0, 0, 400);
    gradient1.addColorStop(0, 'rgba(0, 242, 255, 0.4)');
    gradient1.addColorStop(1, 'rgba(0, 242, 255, 0)');

    const gradient2 = ctx.createLinearGradient(0, 0, 0, 400);
    gradient2.addColorStop(0, 'rgba(112, 0, 255, 0.4)');
    gradient2.addColorStop(1, 'rgba(112, 0, 255, 0)');

    mainChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Temperature (°C)',
                    borderColor: '#00f2ff',
                    backgroundColor: gradient1,
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    data: []
                },
                {
                    label: 'Humidity (%)',
                    borderColor: '#7000ff',
                    backgroundColor: gradient2,
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    data: []
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#fff', font: { family: 'Outfit' } } }
            },
            scales: {
                x: { grid: { display: false }, ticks: { color: '#666' } },
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#666' } }
            }
        }
    });

    // Mini Temperature Sparkline
    const miniCtx = document.getElementById('miniChartTemp').getContext('2d');
    miniChart = new Chart(miniCtx, {
        type: 'line',
        data: {
            labels: ['', '', '', '', '', ''],
            datasets: [{
                data: [0, 0, 0, 0, 0, 0],
                borderColor: '#ef4444',
                borderWidth: 2,
                pointRadius: 0,
                fill: false,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { x: { display: false }, y: { display: false } }
        }
    });
}

async function fetchData() {
    try {
        const res = await fetch('/api/get-data');
        const data = await res.json();
        
        if (data.length > 0) {
            updateDashboard(data);
            updateTable(data);
            updateCharts(data);
            
            // System Status
            document.getElementById('apiStatusPulse').className = 'pulse-green';
            document.getElementById('apiStatusText').textContent = 'Online';
            document.getElementById('apiStatusText').className = 'text-xs text-green-400 font-bold uppercase';
            document.getElementById('lastSync').textContent = data[0].time;
        }
    } catch (err) {
        console.error('Fetch error:', err);
        document.getElementById('apiStatusPulse').className = 'pulse-red';
        document.getElementById('apiStatusText').textContent = 'Offline';
        document.getElementById('apiStatusText').className = 'text-xs text-red-400 font-bold uppercase';
    }
}

function updateDashboard(data) {
    const latest = data[0];
    
    // Animate numbers using GSAP
    animateValue('tempVal', latest.temperature);
    animateValue('humVal', latest.humidity);
    animateValue('soilVal', latest.soil);
    
    document.getElementById('tempTime').textContent = latest.time;
    
    // Humidity Circular Progress
    document.getElementById('humidityProgress').setAttribute('stroke-dasharray', `${latest.humidity}, 100`);
    
    // Soil Moisture Progress
    const soilBar = document.getElementById('soilProgress');
    soilBar.style.width = latest.soil + '%';
    const soilStatus = document.getElementById('soilStatus');
    if (latest.soil > 70) {
        soilStatus.textContent = 'Wet';
        soilBar.className = 'bg-blue-500 h-full transition-all duration-1000';
    } else if (latest.soil > 30) {
        soilStatus.textContent = 'Moist';
        soilBar.className = 'bg-green-500 h-full transition-all duration-1000';
    } else {
        soilStatus.textContent = 'Dry';
        soilBar.className = 'bg-yellow-600 h-full transition-all duration-1000';
    }
    
    // IR Sensor
    const irVal = document.getElementById('irVal');
    const irIcon = document.getElementById('irIcon');
    const irGlow = document.getElementById('irGlow');
    
    if (latest.ir === 'Object Detected' || latest.ir === '1') {
        irVal.textContent = 'Object Detected';
        irVal.className = 'text-xl font-bold text-red-500 uppercase tracking-widest';
        irIcon.className = 'p-3 bg-red-500/20 rounded-xl text-red-500';
        irGlow.className = 'h-1 w-full bg-red-500 mt-4 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.8)]';
    } else {
        irVal.textContent = 'Clear';
        irVal.className = 'text-xl font-bold text-green-500 uppercase tracking-widest';
        irIcon.className = 'p-3 bg-green-500/20 rounded-xl text-green-500';
        irGlow.className = 'h-1 w-full bg-green-500 mt-4 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.8)]';
    }
}

function updateCharts(data) {
    const latest10 = [...data].reverse().slice(-MAX_DATA_POINTS);
    
    mainChart.data.labels = latest10.map(d => d.time);
    mainChart.data.datasets[0].data = latest10.map(d => d.temperature);
    mainChart.data.datasets[1].data = latest10.map(d => d.humidity);
    mainChart.update('none'); // Update without animation for smoother polling

    // Update Mini Chart
    miniChart.data.datasets[0].data = latest10.slice(-6).map(d => d.temperature);
    miniChart.update();
}

function updateTable(data) {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';
    
    data.slice(0, 10).forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${row.id}</td>
            <td class="font-bold text-red-400">${row.temperature}°C</td>
            <td class="font-bold text-blue-400">${row.humidity}%</td>
            <td class="font-bold text-green-400">${row.soil}%</td>
            <td><span class="px-2 py-1 rounded-md text-[10px] ${row.ir === 'Object Detected' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}">${row.ir}</span></td>
            <td class="text-xs text-gray-400">${row.time}</td>
            <td class="text-xs text-gray-400">${row.date}</td>
            <td>
                <button onclick="deleteRecord(${row.id})" class="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
    
    document.getElementById('rowCount').textContent = data.length;
}

async function deleteRecord(id) {
    if (!confirm('Delete this record?')) return;
    try {
        await fetch(`/api/delete/${id}`, { method: 'DELETE' });
        showToast('Record deleted');
        fetchData();
    } catch (err) {
        alert('Delete failed');
    }
}

async function fetchLCD() {
    const res = await fetch('/api/lcd-text');
    const text = await res.text();
    document.getElementById('lcdPreview').textContent = text;
}

async function updateLCD() {
    const text = document.getElementById('lcdInput').value;
    if (!text) return;
    
    const res = await fetch('/api/lcd-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
    });
    
    if (res.ok) {
        document.getElementById('lcdPreview').textContent = text;
        showToast('LCD Message Updated');
        document.getElementById('lcdInput').value = '';
    }
}

function animateValue(id, target) {
    const el = document.getElementById(id);
    const current = parseFloat(el.innerText);
    gsap.to({ val: current }, {
        val: target,
        duration: 1,
        onUpdate: function() {
            el.innerText = this.targets()[0].val.toFixed(id === 'tempVal' ? 1 : 0);
        }
    });
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMsg').textContent = msg;
    toast.className = 'fixed bottom-10 right-10 glass px-6 py-4 rounded-xl border-l-4 border-green-500 transform translate-y-0 opacity-100 transition-all duration-500 flex items-center gap-3 z-[100]';
    
    setTimeout(() => {
        toast.className = 'fixed bottom-10 right-10 glass px-6 py-4 rounded-xl border-l-4 border-green-500 transform translate-y-20 opacity-0 transition-all duration-500 flex items-center gap-3 z-[100]';
    }, 3000);
}
