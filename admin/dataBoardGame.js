import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCTRAyaI-eBBfWUjMSv1XprKAaIDlacy3g",
    authDomain: "bulibrary-770bb.firebaseapp.com",
    projectId: "bulibrary-770bb",
    storageBucket: "bulibrary-770bb.appspot.com",
    messagingSenderId: "688134819645",
    appId: "1:688134819645:web:97a300cfac462f5459bf54",
    measurementId: "G-C72Z3EK47W",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function getBoardGameName(boardGameId) {
    try {
        const boardGameRef = doc(db, 'boardgame', boardGameId);
        const boardGameDoc = await getDoc(boardGameRef);
        return boardGameDoc.exists() ? boardGameDoc.data().name : 'ไม่พบข้อมูล';
    } catch (error) {
        console.error("Error getting board game:", error);
        return 'ไม่พบข้อมูล';
    }
}

async function updateBoardGameCount() {
    try {
        const boardgameRef = collection(db, 'boardgame');
        const querySnapshot = await getDocs(boardgameRef);
        document.querySelector('.bg-white:nth-child(1) p').textContent = `จำนวนบอร์ดเกมทั้งหมด: ${querySnapshot.size} เกม`;
    } catch (error) {
        console.error("Error counting boardgames:", error);
    }
}

async function populateBookingTable() {
    try {
        const bookingsRef = collection(db, 'bookingboardgame');
        // แก้ไขการ query ให้เรียงตาม bbgame_id
        const q = query(bookingsRef, 
            orderBy('bbgame_id', 'desc') // เรียงตามหมายเลขการจอง จากมากไปน้อย
        );
        const querySnapshot = await getDocs(q);

        const tbody = document.querySelector('tbody');
        tbody.innerHTML = '';

        // แปลงข้อมูลเป็น array และเรียงลำดับ
        const bookings = querySnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
        })).sort((a, b) => {
            // แปลงเป็นตัวเลขเพื่อเรียงลำดับ
            const idA = parseInt(a.bbgame_id) || 0;
            const idB = parseInt(b.bbgame_id) || 0;
            return idB - idA; // เรียงจากมากไปน้อย
        });

        // สร้างแถวข้อมูล
        for (const booking of bookings) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="py-3 px-4">#${booking.bbgame_id}</td>
                <td class="py-3 px-4">${booking.student_id || '-'}</td>
                <td class="py-3 px-4">${booking.name_bg}</td>
                <td class="py-3 px-4">${booking.player_count || '1'} คน</td>
                <td class="py-3 px-4">${formatTime(booking.bbgame_time)}</td>
                <td class="py-3 px-4">${formatDate(booking.bbgame_date)}</td>
            `;
            tbody.appendChild(row);
        }

        updateStatistics(querySnapshot.docs);

    } catch (error) {
        console.error("Error populating booking table:", error);
    }
}

function updateStatistics(bookings) {
    const today = new Date().toISOString().split('T')[0];
    const todayBookings = bookings.filter(doc => 
        doc.data().bbgame_date === today
    ).length;

    document.querySelector('.bg-white:nth-child(2) p').textContent = `การจองทั้งหมด: ${todayBookings} ครั้ง`;
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

function formatTime(timeString) {
    if (!timeString) return '-';
    return `${timeString} น.`;
}

window.toggleDropdown = function(dropdownId, event) {
    // ตรวจสอบ parameters
    event = event || window.event;
    if (!event) return;
    
    // หา dropdown element
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown) return;

    // หา icon จากปุ่มที่ถูกคลิก
    const button = event.currentTarget;
    const icon = button.querySelector('[data-feather="chevron-down"]');
    
    // Toggle dropdown
    dropdown.classList.toggle('hidden');
    
    // หมุน icon ถ้ามี
    if (icon) {
        icon.style.transform = dropdown.classList.contains('hidden') ? 
            'rotate(0deg)' : 'rotate(180deg)';
    }

    // Re-render Feather icons
    feather.replace();
};

// Setup dropdowns
function setupDropdowns() {
    // ตั้งค่า event listeners สำหรับทุกปุ่ม dropdown
    document.querySelectorAll('button[onclick*="toggleDropdown"]').forEach(button => {
        const dropdownId = button.getAttribute('onclick').match(/'([^']+)'/)?.[1];
        if (dropdownId) {
            button.onclick = (event) => toggleDropdown(dropdownId, event);
        }
    });

    // Setup initial state for dropdowns
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

document.addEventListener('DOMContentLoaded', async () => {
    await populateBookingTable();
    await updateBoardGameCount();
    feather.replace();
});