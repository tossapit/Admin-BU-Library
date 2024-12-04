// historyMeeting.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore, collection, getDocs, query, where, deleteDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCTRAyaI-eBBfWUjMSv1XprKAaIDlacy3g",
    authDomain: "bulibrary-770bb.firebaseapp.com",
    projectId: "bulibrary-770bb",
    storageBucket: "bulibrary-770bb.firebasestorage.app",
    messagingSenderId: "688134819645",
    appId: "1:688134819645:web:97a300cfac462f5459bf54"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fetchBookingHistory() {
    const bookingsTable = document.querySelector('table tbody');
    if (!bookingsTable) return;
    
    try {
        const q = query(collection(db, 'historymeeting'), where('room_type', '==', 'Meeting Room'));
        const snapshot = await getDocs(q);
        
        bookingsTable.innerHTML = '';
        
        snapshot.forEach((doc) => {
            const booking = doc.data();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 text-sm text-gray-900">#${doc.id}</td>
                <td class="px-6 py-4 text-sm text-gray-900">${booking.mainBooker}</td>
                <td class="px-6 py-4 text-sm text-gray-900">${booking.room_type}</td>
                <td class="px-6 py-4 text-sm text-gray-900">${new Date(booking.created_at).toLocaleDateString('th-TH')}</td>
                <td class="px-6 py-4 text-sm">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        booking.status === 'อนุมัติ' ? 'bg-green-100 text-green-800' : 
                        booking.status === 'รออนุมัติ' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                    }">${booking.status}</span>
                </td>
            `;
            bookingsTable.appendChild(row);
        });
    } catch (error) {
        console.error("Error fetching booking history:", error);
        alert('เกิดข้อผิดพลาดในการดึงข้อมูล');
    }
}

window.toggleDropdown = function(id) {
    const dropdown = document.getElementById(id);
    const icon = event.currentTarget.querySelector('[data-feather="chevron-down"]');
    
    dropdown.classList.toggle('hidden');
    icon.style.transform = dropdown.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
    feather.replace();
};

window.clearTable = async function() {
    if (confirm('คุณต้องการล้างตารางหรือไม่? ข้อมูลจะถูกลบถาวร')) {
        try {
            const q = query(collection(db, 'historymeeting'), where('room_type', '==', 'Meeting Room'));
            const snapshot = await getDocs(q);
            
            const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);
            
            const tbody = document.querySelector('table tbody');
            if (tbody) {
                tbody.innerHTML = '';
            }
            
            alert('ลบข้อมูลสำเร็จ');
        } catch (error) {
            console.error("Error clearing data:", error);
            alert('เกิดข้อผิดพลาดในการลบข้อมูล');
        }
    }
};

async function updateNotificationBadge() {
    try {
        const q = query(
            collection(db, 'bookings'),
            where('room_type', '==', 'Meeting Room'),
            where('status', '==', 'รออนุมัติ')
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
    fetchBookingHistory();
    updateNotificationBadge();
});