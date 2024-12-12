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

async function fetchBookings() {
    const bookingsTable = document.querySelector('table tbody');
    if (!bookingsTable) return;
    
    try {
        const q = query(
            collection(db, 'bookings'),
            where('room_type', '==', 'Movie Room'),
            where('status', '==', 'รออนุมัติ')  // เพิ่ม condition นี้
        );
        
        const snapshot = await getDocs(q);
        bookingsTable.innerHTML = '';
        
        snapshot.forEach((doc) => {
            const booking = doc.data();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="py-3 px-4">#${doc.id}</td>
                <td class="py-3 px-4">${booking.mainBooker}</td>
                <td class="py-3 px-4">${booking.room_type}</td>
                <td class="py-3 px-4">${new Date(booking.created_at).toLocaleDateString('th-TH')}</td>
                <td class="py-3 px-4">${booking.status}</td>
                <td class="py-3 px-4">
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

// เพิ่มฟังก์ชันนี้ก่อน async function approveBooking(bookingId)
async function findAvailableRoom() {
    try {
        const roomsRef = collection(db, 'movieRooms');
        const q = query(roomsRef, where('status', '==', 'ว่าง'));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            return null;
        }
        
        return {
            id: snapshot.docs[0].id,
            ...snapshot.docs[0].data()
        };
    } catch (error) {
        console.error("Error finding available room:", error);
        return null;
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
        const availableRoom = await findAvailableRoom();
        
        if (!availableRoom) {
            alert('ไม่มีห้องว่างในขณะนี้ กรุณารอห้องว่าง');
            return;
        }

        const bookingRef = doc(db, 'bookings', bookingId);
        const bookingSnap = await getDoc(bookingRef);
        if (!bookingSnap.exists()) {
            throw new Error('Booking not found');
        }

        const bookingData = bookingSnap.data();

        await updateDoc(bookingRef, { 
            status: 'อนุมัติ' 
        });

        const roomRef = doc(db, 'movieRooms', availableRoom.id);
        await updateDoc(roomRef, {
            status: 'ไม่ว่าง',
            currentBooking: bookingId,
            lastUpdated: new Date().toISOString()
        });

        // Add to bookingmeeting collection
        const bookingMeetingRef = doc(db, 'bookingmovie', bookingId);
        await setDoc(bookingMeetingRef, {
            ...bookingData,
            status: 'อนุมัติ',
            approved_at: new Date().toISOString()
        });

        // Add to historymeeting collection
        const historyMeetingRef = doc(db, 'historymovie', bookingId);
        await setDoc(historyMeetingRef, {
            ...bookingData,
            status: 'อนุมัติ',
            approved_at: new Date().toISOString(),
            action: 'อนุมัติการจอง',
            action_at: new Date().toISOString()
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
        const bookingSnap = await getDoc(bookingRef);
        
        if (bookingSnap.exists()) {
            const bookingData = bookingSnap.data();
            
            // แทนที่จะลบข้อมูล เราจะอัพเดทสถานะเป็น 'ยกเลิก'
            await updateDoc(bookingRef, {
                status: 'ยกเลิก'
            });
            
            // เพิ่มข้อมูลในประวัติการจอง
            const historyMeetingRef = doc(db, 'historymovie', bookingId);
            await setDoc(historyMeetingRef, {
                ...bookingData,
                status: 'ยกเลิก',
                rejected_at: new Date().toISOString(),
                action: 'ยกเลิกการจอง',
                action_at: new Date().toISOString()
            });
        }

        // แทนที่จะใช้ deleteDoc เราแค่ refresh ตารางใหม่
        fetchBookings();
        alert('ยกเลิกการจองสำเร็จ');
    } catch (error) {
        console.error("Error rejecting booking:", error);
        alert('เกิดข้อผิดพลาดในการยกเลิก');
    }
}

// ฟังก์ชันสำหรับ toggle dropdown
window.toggleDropdown = function(dropdownId, event) {
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown) return;

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

window.clearTable = async function() {
    if (confirm('คุณต้องการล้างตารางหรือไม่? ข้อมูลจะถูกลบถาวร')) {
        try {
            const q = query(collection(db, 'bookings'), where('room_type', '==', 'Movie Room'));
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

// Setup dropdowns when the page loads
function setupDropdowns() {
    // Meeting Room dropdown is always open by default (since this is the meeting room page)
    const meetingRoomDropdown = document.getElementById('movieRoomDropdown');
    if (meetingRoomDropdown) {
        meetingRoomDropdown.classList.remove('hidden');
        const button = meetingRoomDropdown.previousElementSibling;
        const icon = button?.querySelector('[data-feather="chevron-down"]');
        if (icon) {
            icon.style.transform = 'rotate(180deg)';
        }
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    feather.replace();
    setupDropdowns();
    fetchBookings();
    updateNotificationBadge();
});