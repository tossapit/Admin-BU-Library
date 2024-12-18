import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore, collection, getDocs, query, where, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCTRAyaI-eBBfWUjMSv1XprKAaIDlacy3g",
    authDomain: "bulibrary-770bb.firebaseapp.com",
    projectId: "bulibrary-770bb",
    storageBucket: "bulibrary-770bb.firebasestorage.app",
    messagingSenderId: "688134819645",
    appId: "1:688134819645:web:97a300cfac462f5459bf54",
    measurementId: "G-C72Z3EK47W"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function updateStats() {
    try {
        // Fetch active bookings from both meeting and movie collections
        const [activeMeetingSnapshot, activeMovieSnapshot] = await Promise.all([
            getDocs(collection(db, 'bookingmeeting')),
            getDocs(collection(db, 'bookingmovie'))
        ]);

        // Calculate total active bookings
        const totalActiveBookings = activeMeetingSnapshot.size + activeMovieSnapshot.size;

        // Calculate total users (active bookings × 5 users per booking)
        const totalUsers = totalActiveBookings * 5;

        // Fetch total historical bookings
        const [historyMeetingSnapshot, historyMovieSnapshot] = await Promise.all([
            getDocs(collection(db, 'historymeeting')),
            getDocs(collection(db, 'historymovie'))
        ]);

        // Calculate total historical bookings
        const totalHistoricalBookings = historyMeetingSnapshot.size + historyMovieSnapshot.size;

        // Update UI
        document.getElementById('totalUsers').textContent = totalUsers;
        document.getElementById('totalBookings').textContent = totalHistoricalBookings;
        document.getElementById('activeBookings').textContent = totalActiveBookings;
    } catch (error) {
        console.error("Error fetching stats:", error);
    }
}

async function updateRoomStats() {
    try {
        // Define collections for each room type
        const roomConfigs = [
            {
                type: 'Meeting Room',
                contentId: 'meeting-content',
                activeCollection: 'bookingmeeting',
                historyCollection: 'historymeeting'
            },
            {
                type: 'Movie Room',
                contentId: 'movie-content',
                activeCollection: 'bookingmovie',
                historyCollection: 'historymovie'
            },
            {
                type: 'Board Game',
                contentId: 'boardgame-content',
                activeCollection: 'bookingboardgame',
                historyCollection: 'bookingboardgame'
            }
        ];
        
        for (const config of roomConfigs) {
            try {
                const [activeBookings, totalHistory] = await Promise.all([
                    getDocs(collection(db, config.activeCollection)),
                    getDocs(collection(db, config.historyCollection))
                ]);
                
                const content = document.getElementById(config.contentId);
                if (content) {
                    const stats = content.getElementsByClassName('flex items-center justify-between');
                    if (config.type === 'Board Game') {
                        // สำหรับบอร์ดเกม แสดงเฉพาะการจองทั้งหมด
                        stats[0].lastElementChild.textContent = totalHistory.size;
                    } else {
                        // สำหรับห้องประชุมและห้องดูหนัง แสดงทั้งการจองและกำลังใช้งาน
                        stats[0].lastElementChild.textContent = totalHistory.size;
                        stats[1].lastElementChild.textContent = activeBookings.size;
                    }
                }
            } catch (error) {
                console.error(`Error processing ${config.type}:`, error);
            }
        }
    } catch (error) {
        console.error("Error updating room stats:", error);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    feather.replace();
    await Promise.all([updateStats(), updateRoomStats()]);
    showTab('meeting');
    
    const logoutButton = document.querySelector('.mt-auto');
    logoutButton?.addEventListener('click', handleLogout);
});

function handleLogout() {
    if (confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
        window.location.href = 'adminLogin.html';
    }
}

window.showTab = function(tabName) {
    const contents = document.querySelectorAll('[id$="-content"]');
    contents.forEach(content => content.classList.add('hidden'));
    document.getElementById(`${tabName}-content`).classList.remove('hidden');
    
    // Update tab styles
    document.querySelectorAll('[id$="-tab"]').forEach(tab => {
        tab.classList.remove('text-blue-600', 'border-b-2', 'border-blue-600');
        tab.classList.add('text-gray-600');
    });
    const activeTab = document.getElementById(`${tabName}-tab`);
    activeTab.classList.remove('text-gray-600');
    activeTab.classList.add('text-blue-600', 'border-b-2', 'border-blue-600');
};

window.toggleBookingSystem = async function(isOpen) {
    try {
        if (confirm(`คุณต้องการ${isOpen ? 'เปิด' : 'ปิด'}ระบบการจองหรือไม่?`)) {
            await setDoc(doc(db, 'system', 'bookingStatus'), { isOpen }, { merge: true });
            alert(isOpen ? 'เปิดระบบการจองสำเร็จ' : 'ปิดระบบการจองสำเร็จ');
        }
    } catch (error) {
        console.error("Error toggling system:", error);
        alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    }
};

async function updateNotificationBadges() {
    try {
        // Check Movie Room notifications
        const movieQuery = query(
            collection(db, 'bookingmovie'),
            where('status', '==', 'รออนุมัติ')
        );
        
        const movieSnapshot = await getDocs(movieQuery);
        const movieCount = movieSnapshot.size;
        
        const movieBadge = document.getElementById('movie-notification-badge');
        const movieDropdown = document.getElementById('movieRoom');
        
        if (movieBadge && movieDropdown) {
            if (movieCount > 0) {
                movieBadge.textContent = movieCount;
                movieBadge.classList.remove('hidden');
                if (movieBadge.dataset.prevCount === undefined || 
                    parseInt(movieBadge.dataset.prevCount) < movieCount) {
                    movieDropdown.classList.remove('hidden');
                    const button = movieDropdown.previousElementSibling;
                    const icon = button?.querySelector('[data-feather="chevron-down"]');
                    if (icon) {
                        icon.style.transform = 'rotate(180deg)';
                    }
                    feather.replace();
                }
                movieBadge.dataset.prevCount = movieCount;
            } else {
                movieBadge.classList.add('hidden');
                movieBadge.dataset.prevCount = 0;
            }
        }
        
        // Check Meeting Room notifications (เพิ่มเติม)
        const meetingQuery = query(
            collection(db, 'bookingmeeting'),
            where('status', '==', 'รออนุมัติ')
        );
        
        const meetingSnapshot = await getDocs(meetingQuery);
        const meetingCount = meetingSnapshot.size;
        
        const meetingBadge = document.getElementById('meeting-notification-badge');
        const meetingDropdown = document.getElementById('meetingRoom');
        
        if (meetingBadge && meetingDropdown) {
            if (meetingCount > 0) {
                meetingBadge.textContent = meetingCount;
                meetingBadge.classList.remove('hidden');
                if (meetingBadge.dataset.prevCount === undefined || 
                    parseInt(meetingBadge.dataset.prevCount) < meetingCount) {
                    meetingDropdown.classList.remove('hidden');
                    const button = meetingDropdown.previousElementSibling;
                    const icon = button?.querySelector('[data-feather="chevron-down"]');
                    if (icon) {
                        icon.style.transform = 'rotate(180deg)';
                    }
                    feather.replace();
                }
                meetingBadge.dataset.prevCount = meetingCount;
            } else {
                meetingBadge.classList.add('hidden');
                meetingBadge.dataset.prevCount = 0;
            }
        }
    } catch (error) {
        console.error("Error fetching notification counts:", error);
    }
}

window.toggleDropdown = function(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    const button = event.currentTarget;
    const icon = button.querySelector('[data-feather="chevron-down"]');
    
    dropdown.classList.toggle('hidden');
    
    if (icon) {
        icon.style.transform = dropdown.classList.contains('hidden') ? 
            'rotate(0deg)' : 'rotate(180deg)';
    }

    feather.replace();
};

function setupDropdowns() {
    document.querySelectorAll('button[onclick*="toggleDropdown"]').forEach(button => {
        const dropdownId = button.getAttribute('onclick').match(/'([^']+)'/)?.[1];
        if (dropdownId) {
            button.onclick = (event) => toggleDropdown(dropdownId);
        }
    });

    const dropdowns = {
        'meetingRoom': document.getElementById('meetingRoom'),
        'movieRoom': document.getElementById('movieRoom'),
        'boardGame': document.getElementById('boardGame')
    };

    Object.entries(dropdowns).forEach(([id, element]) => {
        if (element) {
            element.classList.add('hidden');
        }
    });
}

let currentTimeRange = 'day';

window.changeTimeRange = async function(timeRange) {
    currentTimeRange = timeRange;
    updateRangeButtonStyles();
    await updateBookingTable();
};

function updateRangeButtonStyles() {
    ['day', 'month', 'year'].forEach(range => {
        const button = document.getElementById(`${range}-range`);
        if (button) {
            if (range === currentTimeRange) {
                button.classList.remove('bg-gray-100', 'hover:bg-gray-200', 'text-gray-700');
                button.classList.add('bg-blue-700', 'text-white', 'hover:bg-blue-800');
            } else {
                button.classList.remove('bg-blue-600', 'text-white', 'hover:bg-blue-700');
                button.classList.add('bg-gray-100', 'hover:bg-gray-200', 'text-gray-700');
            }
        }
    });
}

function formatDate(date, format = 'day') {
    const d = new Date(date);
    switch(format) {
        case 'day':
            return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });
        case 'month':
            return d.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' });
        case 'year':
            return d.toLocaleDateString('th-TH', { year: 'numeric' });
    }
}

async function updateBookingTable() {
    try {
        const tableBody = document.getElementById('bookingTableBody');
        if (!tableBody) return;

        tableBody.innerHTML = '';
        const now = new Date();
        let startDate, endDate;
        let groupByFormat;

        switch(currentTimeRange) {
            case 'day':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
                endDate = now;
                groupByFormat = 'day';
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
                endDate = now;
                groupByFormat = 'month';
                break;
            case 'year':
                startDate = new Date(now.getFullYear() - 4, 0, 1);
                endDate = now;
                groupByFormat = 'year';
                break;
        }

        const [meetingHistory, movieHistory, boardGameHistory] = await Promise.all([
            getDocs(collection(db, 'historymeeting')),
            getDocs(collection(db, 'historymovie')),
            getDocs(collection(db, 'bookingboardgame'))
        ]);

        const bookingData = new Map();

        function getGroupKey(date, format) {
            const d = new Date(date);
            switch(format) {
                case 'day':
                    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
                case 'month':
                    return `${d.getFullYear()}-${d.getMonth()}`;
                case 'year':
                    return `${d.getFullYear()}`;
            }
        }

        meetingHistory.forEach(doc => {
            const data = doc.data();
            const key = getGroupKey(data.created_at, groupByFormat);
            if (!bookingData.has(key)) {
                bookingData.set(key, { meeting: 0, movie: 0, boardgame: 0, date: new Date(data.created_at) });
            }
            bookingData.get(key).meeting++;
        });

        movieHistory.forEach(doc => {
            const data = doc.data();
            const key = getGroupKey(data.created_at, groupByFormat);
            if (!bookingData.has(key)) {
                bookingData.set(key, { meeting: 0, movie: 0, boardgame: 0, date: new Date(data.created_at) });
            }
            bookingData.get(key).movie++;
        });

        // รวบรวมข้อมูลบอร์ดเกม
        boardGameHistory.forEach(doc => {
            const data = doc.data();
            const key = getGroupKey(data.bbgame_date || data.created_at, groupByFormat);
            if (!bookingData.has(key)) {
                bookingData.set(key, { meeting: 0, movie: 0, boardgame: 0, date: new Date(data.bbgame_date || data.created_at) });
            }
            bookingData.get(key).boardgame++;
        });

        // แสดงผลในตาราง
        const sortedData = Array.from(bookingData.entries())
            .sort(([,a], [,b]) => b.date - a.date);

        sortedData.forEach(([key, data]) => {
            const row = document.createElement('tr');
            const total = data.meeting + data.movie + data.boardgame;
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatDate(data.date, groupByFormat)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${data.meeting}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${data.movie}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${data.boardgame}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${total}</td>
            `;
            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error("Error updating booking table:", error);
    }
}

// ปรับปรุง DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', async () => {
    feather.replace();
    setupDropdowns();
    await Promise.all([
        updateStats(),
        updateRoomStats(),
        updateBookingTable(),
        updateNotificationBadges()
    ]);
    showTab('meeting');
    
    const logoutButton = document.querySelector('.mt-auto');
    logoutButton?.addEventListener('click', handleLogout);
});

setInterval(updateNotificationBadges, 500);