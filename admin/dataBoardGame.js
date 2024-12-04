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
        const q = query(bookingsRef, orderBy('bbgame_date', 'desc'));
        const querySnapshot = await getDocs(q);

        const tbody = document.querySelector('tbody');
        tbody.innerHTML = '';

        for (const doc of querySnapshot.docs) {
            const booking = doc.data();
            const boardGameName = await getBoardGameName(booking.boardgame_id || '');
            
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

window.toggleDropdown = function(id) {
    const dropdown = document.getElementById(id);
    const icon = event.currentTarget.querySelector('[data-feather="chevron-down"]');
    
    if (dropdown && icon) {
        dropdown.classList.toggle('hidden');
        icon.style.transform = dropdown.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
        feather.replace();
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await populateBookingTable();
    await updateBoardGameCount();
    feather.replace();
});