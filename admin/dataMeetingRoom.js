import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore, collection, getDocs, query, where, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

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
            collection(db, 'bookings'),
            where('room_type', '==', 'Meeting Room'),
            where('status', '==', 'อนุมัติ')
        );
        
        const snapshot = await getDocs(q);
        bookingsTable.innerHTML = '';
        
        snapshot.forEach((doc) => {
            const booking = doc.data();
            const row = document.createElement("tr");
            row.innerHTML = `
                <td class="border px-4 py-2">#${doc.id}</td>
                <td class="border px-4 py-2">${booking.mainBooker}</td>
                <td class="border px-4 py-2">${booking.room_type}</td>
                <td class="border px-4 py-2">${new Date(booking.created_at).toLocaleDateString("th-TH")}</td>
                <td class="border px-4 py-2">${booking.status}</td>
                <td class="border px-4 py-2">
                    <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded mr-2">
                        แสดง
                    </button>
                    <button class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded" onclick="deleteBooking('${doc.id}')">
                        ยกเลิก
                    </button>
                </td>
            `;
            
            const showButton = row.querySelector(".bg-blue-500");
            showButton.addEventListener("click", function() {
                sessionStorage.setItem('selectedBooking', JSON.stringify({
                    id: doc.id,
                    ...booking
                }));
                window.location.href = "adminDetail.html";
            });
 
            bookingsTable.appendChild(row);
        });
    } catch (error) {
        console.error("Error fetching bookings:", error);
        alert('เกิดข้อผิดพลาดในการดึงข้อมูล');
    }
 }
 
 // Add delete function
 window.deleteBooking = async function(bookingId) {
    if (confirm('คุณต้องการยกเลิกการจองนี้หรือไม่?')) {
        try {
            await deleteDoc(doc(db, 'bookings', bookingId));
            alert('ยกเลิกการจองสำเร็จ');
            fetchApprovedBookings(); // Refresh the table
        } catch (error) {
            console.error("Error deleting booking:", error);
            alert('เกิดข้อผิดพลาดในการยกเลิกการจอง');
        }
    }
 };

 window.toggleDropdown = function(id) {
    const dropdown = document.getElementById(id);
    const icon = event.currentTarget.querySelector('[data-feather="chevron-down"]');
    
    dropdown.classList.toggle('hidden');
    
    if (dropdown.classList.contains('hidden')) {
        icon.style.transform = 'rotate(0deg)';
    } else {
        icon.style.transform = 'rotate(180deg)';
    }
    
    feather.replace();
};

// Add this to approveMeetingRoom.js
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
    fetchApprovedBookings();
    updateNotificationBadge();
});