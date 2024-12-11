import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore, collection, getDocs, deleteDoc, doc, query, where, updateDoc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

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

async function fetchApprovedBookings() {
    const bookingsTable = document.querySelector('table tbody');
    if (!bookingsTable) return;

    try {
        const q = query(
            collection(db, 'bookingmeeting'),
            where('room_type', '==', 'Meeting Room'),
            where('status', '==', 'อนุมัติ')
        );

        const snapshot = await getDocs(q);
        bookingsTable.innerHTML = '';

        snapshot.forEach((doc) => {
            const booking = doc.data();
            const row = document.createElement("tr");
            row.innerHTML = `
                <td class="py-3 px-4">#${doc.id}</td>
                <td class="py-3 px-4">${booking.mainBooker}</td>
                <td class="py-3 px-4">${booking.room_type}</td>
                <td class="py-3 px-4">${new Date(booking.created_at).toLocaleDateString("th-TH")}</td>
                <td class="py-3 px-4">${booking.status}</td>
                <td class="py-3 px-4">
                    <button onclick="showDetails('${doc.id}')" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded mr-2">
                        แสดง
                    </button>
                    <button onclick="deleteBooking('${doc.id}')" class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded">
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

window.showDetails = function(bookingId) {
    sessionStorage.setItem('selectedBooking', JSON.stringify({
        id: bookingId,
    }));
    window.location.href = "adminDetail.html";
};

// แก้ไขฟังก์ชัน deleteBooking ใน dataMeetingRoom.js
window.deleteBooking = async function(bookingId) {
    if (confirm('คุณต้องการยกเลิกการจองนี้หรือไม่?')) {
        try {
            // ค้นหาห้องที่มี currentBooking ตรงกับ bookingId
            const roomsRef = collection(db, 'meetingRooms');
            const q = query(roomsRef, where('currentBooking', '==', bookingId));
            const roomSnapshot = await getDocs(q);

            // อัพเดทสถานะห้อง
            if (!roomSnapshot.empty) {
                const roomDoc = roomSnapshot.docs[0];
                await updateDoc(doc(db, 'meetingRooms', roomDoc.id), {
                    status: 'ว่าง',
                    currentBooking: null,
                    lastUpdated: new Date().toISOString()
                });
                console.log("Updated room status:", roomDoc.id);
            }

            // ลบข้อมูลการจอง
            await deleteDoc(doc(db, 'bookingmeeting', bookingId));
            alert('ยกเลิกการจองสำเร็จ');
            fetchApprovedBookings();
            
        } catch (error) {
            console.error("Error in deleteBooking:", error);
            alert('เกิดข้อผิดพลาดในการยกเลิกการจอง');
        }
    }
};

// ฟังก์ชันสำหรับ toggle dropdown
window.toggleDropdown = function(dropdownId, event) {
    // หา dropdown element
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown) return;

    // หา icon element จากปุ่มที่ถูกคลิก
    const button = event.currentTarget;
    const icon = button.querySelector('[data-feather="chevron-down"]');
    
    // Toggle dropdown
    dropdown.classList.toggle('hidden');
    
    // Rotate icon
    if (icon) {
        icon.style.transform = dropdown.classList.contains('hidden') ? 
            'rotate(0deg)' : 'rotate(180deg)';
    }

    // Re-render Feather icons
    feather.replace();
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

// Setup all dropdowns when the page loads
function setupDropdowns() {
    // Meeting Room dropdown is always open by default (since this is the meeting room page)
    const meetingRoomDropdown = document.getElementById('meetingRoomDropdown');
    if (meetingRoomDropdown) {
        meetingRoomDropdown.classList.remove('hidden');
        const button = meetingRoomDropdown.previousElementSibling;
        const icon = button?.querySelector('[data-feather="chevron-down"]');
        if (icon) {
            icon.style.transform = 'rotate(180deg)';
        }
    }

    // Add click event listeners to all dropdown buttons
    document.querySelectorAll('button[onclick^="toggleDropdown"]').forEach(button => {
        const dropdownId = button.onclick.toString().match(/'([^']+)'/)[1];
        const dropdown = document.getElementById(dropdownId);
        const icon = button.querySelector('[data-feather="chevron-down"]');
        
        // Set initial state
        if (dropdown) {
            dropdown.classList.add('hidden');
        }
        if (icon) {
            icon.style.transform = 'rotate(0deg)';
        }
    });
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    feather.replace();
    setupDropdowns();
    fetchApprovedBookings();
    updateNotificationBadge();
});