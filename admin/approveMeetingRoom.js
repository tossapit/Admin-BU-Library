import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore, collection, getDocs, deleteDoc, doc, query, where, updateDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCTRAyaI-eBBfWUjMSv1XprKAaIDlacy3g",
    authDomain: "bulibrary-770bb.firebaseapp.com",
    projectId: "bulibrary-770bb", 
    storageBucket: "bulibrary-770bb.firebasestorage.app",
    messagingSenderId: "688134819645",
    appId: "1:688134819645:web:97a300cfac462f5459bf54",
    measurementId: "G-C72Z3EK47W",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fetchBookings() {
    const bookingsTable = document.querySelector('table tbody');
    if (!bookingsTable) return;
    
    try {
        const q = query(
            collection(db, 'bookings'),
            where('room_type', '==', 'Meeting Room'),
            where('status', '==', 'active')
        );
        
        const snapshot = await getDocs(q);
        bookingsTable.innerHTML = '';
        
        snapshot.forEach((doc) => {
            const booking = doc.data();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="border px-4 py-2">#${doc.id}</td>
                <td class="border px-4 py-2">${booking.mainBooker}</td>
                <td class="border px-4 py-2">${booking.room_type}</td>
                <td class="border px-4 py-2">${new Date(booking.created_at).toLocaleDateString('th-TH')}</td>
                <td class="border px-4 py-2">${booking.status}</td>
                <td class="border px-4 py-2">
                    <button onclick="confirmAction('${doc.id}', 'approve')" 
                            class="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded mr-2">
                        อนุมัติ
                    </button>
                    <button onclick="confirmAction('${doc.id}', 'reject')"
                            class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded">
                        ยกเลิก
                    </button>
                </td>
            `;
            bookingsTable.appendChild(row);
        });
    } catch (error) {
        console.error("Error fetching bookings:", error);
        alert('เกิดข้อผิดพลาดในการดึงข้อมูล');
    }
}

window.confirmAction = (bookingId, action) => {
    const message = action === 'approve' ? 'อนุมัติ' : 'ยกเลิก';
    const warningMessage = action === 'reject' ? '\n(ข้อมูลการจองจะถูกลบออกจากระบบ)' : '';
    if (confirm(`คุณต้องการ${message}การจองนี้หรือไม่?${warningMessage}`)) {
        if (action === 'approve') {
            approveBooking(bookingId);
        } else {
            rejectBooking(bookingId);
        }
    }
};

async function approveBooking(bookingId) {
    try {
        const bookingRef = doc(db, 'bookings', bookingId);
        await updateDoc(bookingRef, { 
            status: 'อนุมัติ' 
        });
        fetchBookings();
        alert('อนุมัติการจองสำเร็จ');
    } catch (error) {
        console.error("Error approving booking:", error);
        alert('เกิดข้อผิดพลาดในการอนุมัติ');
    }
}

async function rejectBooking(bookingId) {
    try {
        const bookingRef = doc(db, 'bookings', bookingId);
        await deleteDoc(bookingRef);
        fetchBookings();
        alert('ยกเลิกการจองสำเร็จ');
    } catch (error) {
        console.error("Error rejecting booking:", error);
        alert('เกิดข้อผิดพลาดในการยกเลิก');
    }
}

function toggleDropdown(id) {
    const dropdown = document.getElementById(id);
    const icon = event.currentTarget.querySelector('[data-feather="chevron-down"]');
    
    dropdown.classList.toggle('hidden');
    
    if (dropdown.classList.contains('hidden')) {
        icon.style.transform = 'rotate(0deg)';
    } else {
        icon.style.transform = 'rotate(180deg)';
    }
    
    feather.replace();
}

// Add this to approveMeetingRoom.js
async function updateNotificationBadge() {
    try {
        const q = query(
            collection(db, 'bookings'),
            where('room_type', '==', 'Meeting Room'),
            where('status', '==', 'active')
        );
        
        const snapshot = await getDocs(q);
        const count = snapshot.size;
        
        const badge = document.getElementById('notification-badge');
        if (count > 0) {
            badge.textContent = count;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    } catch (error) {
        console.error("Error fetching notification count:", error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    feather.replace();
    fetchBookings();
    updateNotificationBadge();
});