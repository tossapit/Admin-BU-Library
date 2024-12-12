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
        const q = query(collection(db, 'historymovie'), where('room_type', '==', 'Movie Room'));
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

// ฟังก์ชันสำหรับ toggle dropdown แบบใหม่
window.toggleDropdown = function(dropdownId, event) {
    event = event || window.event; // รองรับ event ทั้งแบบใหม่และเก่า
    const dropdown = document.getElementById(dropdownId);
    
    if (!dropdown) return;
    
    // หา icon จากปุ่มที่ถูกคลิก
    const button = event.currentTarget;
    const icon = button.querySelector('[data-feather="chevron-down"]');
    
    // Toggle dropdown
    dropdown.classList.toggle('hidden');
    
    // หมุน icon (ถ้ามี)
    if (icon) {
        icon.style.transform = dropdown.classList.contains('hidden') ? 
            'rotate(0deg)' : 'rotate(180deg)';
    }

    // Re-render Feather icons
    feather.replace();
};

window.clearTable = async function() {
    if (confirm('คุณต้องการล้างตารางหรือไม่? ข้อมูลจะถูกลบถาวร')) {
        try {
            const q = query(collection(db, 'historymovie'), where('room_type', '==', 'Movie Room'));
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
            where('room_type', '==', 'Movie Room'),
            where('status', '==', 'รออนุมัติ')
        );
        
        const snapshot = await getDocs(q);
        const count = snapshot.size;
        
        const badge = document.getElementById('notification-badge');
        if (badge) {
            if (count > 0) {
                badge.textContent = count;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }
    } catch (error) {
        console.error("Error fetching notification count:", error);
    }
}

// Setup เริ่มต้น
function setupInitialDropdowns() {
    // เปิด Meeting Room dropdown เป็นค่าเริ่มต้น
    const meetingRoomDropdown = document.getElementById('movieRoom');
    if (meetingRoomDropdown) {
        meetingRoomDropdown.classList.remove('hidden');
        const button = meetingRoomDropdown.previousElementSibling;
        const icon = button?.querySelector('[data-feather="chevron-down"]');
        if (icon) {
            icon.style.transform = 'rotate(180deg)';
        }
    }

    // ตั้งค่า event listeners สำหรับทุกปุ่ม dropdown
    document.querySelectorAll('button[onclick*="toggleDropdown"]').forEach(button => {
        const dropdownId = button.getAttribute('onclick').match(/'([^']+)'/)[1];
        button.onclick = (event) => toggleDropdown(dropdownId, event);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    feather.replace();
    setupInitialDropdowns();
    fetchBookingHistory();
    updateNotificationBadge();
});