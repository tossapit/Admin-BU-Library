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

function formatTime(timeString) {
    if (!timeString) return '-';
    return `${timeString} น.`;
}

async function fetchBookings() {
    const bookingsTable = document.querySelector('table tbody');
    if (!bookingsTable) return;
    
    try {
        const q = query(
            collection(db, 'bookings'),
            where('room_type', '==', 'Meeting Room'),
            where('status', '==', 'รออนุมัติ')
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
                <td class="py-3 px-4">${formatTime(booking.booking_time)}</td>
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

async function findAvailableRoom() {
    try {
        const roomsRef = collection(db, 'meetingRooms');
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
            status: 'อนุมัติ',
            booking_time: bookingData.booking_time || new Date().toLocaleTimeString('th-TH')
        });

        const roomRef = doc(db, 'meetingRooms', availableRoom.id);
        await updateDoc(roomRef, {
            status: 'ไม่ว่าง',
            currentBooking: bookingId,
            lastUpdated: new Date().toISOString()
        });

        await setDoc(doc(db, 'bookingmeeting', bookingId), {
            ...bookingData,
            status: 'อนุมัติ',
            approved_at: new Date().toISOString(),
            booking_time: bookingData.booking_time || new Date().toLocaleTimeString('th-TH')
        });

        await setDoc(doc(db, 'historymeeting', bookingId), {
            ...bookingData,
            status: 'อนุมัติ',
            approved_at: new Date().toISOString(),
            action: 'อนุมัติการจอง',
            action_at: new Date().toISOString(),
            booking_time: bookingData.booking_time || new Date().toLocaleTimeString('th-TH')
        });
        
        fetchBookings();
        
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
            
            await updateDoc(bookingRef, {
                status: 'ยกเลิก'
            });
            
            await setDoc(doc(db, 'historymeeting', bookingId), {
                ...bookingData,
                status: 'ยกเลิก',
                rejected_at: new Date().toISOString(),
                action: 'ยกเลิกการจอง',
                action_at: new Date().toISOString(),
                booking_time: bookingData.booking_time || new Date().toLocaleTimeString('th-TH')
            });
        }
        
        fetchBookings();
        
    } catch (error) {
        console.error("Error rejecting booking:", error);
        alert('เกิดข้อผิดพลาดในการยกเลิก');
    }
}

window.toggleDropdown = function(dropdownId, event) {
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown) return;

    const button = event.currentTarget;
    const icon = button.querySelector('[data-feather="chevron-down"]');
    
    dropdown.classList.toggle('hidden');
    
    if (icon) {
        icon.style.transform = dropdown.classList.contains('hidden') ? 
            'rotate(0deg)' : 'rotate(180deg)';
    }

    feather.replace();
};

window.clearTable = async function() {
    if (confirm('คุณต้องการที่จะรีเซ็ตคิวใช่หรือไม่?')) {
        try {
            const q = query(collection(db, 'bookings'), where('room_type', '==', 'Meeting Room'));
            const snapshot = await getDocs(q);
            
            const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);
            
            const tbody = document.querySelector('table tbody');
            if (tbody) {
                tbody.innerHTML = '';
            }
            
        } catch (error) {
            console.error("Error clearing data:", error);
            alert('เกิดข้อผิดพลาดในการลบข้อมูล');
        }
    }
};

async function updateNotificationBadges() {
    try {
        // Check Meeting Room notifications
        const meetingQuery = query(
            collection(db, 'bookings'),
            where('room_type', '==', 'Meeting Room'),
            where('status', '==', 'รออนุมัติ')
        );
        const meetingSnapshot = await getDocs(meetingQuery);
        const meetingCount = meetingSnapshot.size;
        
        const meetingBadge = document.getElementById('meeting-notification-badge');
        const meetingDropdown = document.getElementById('meetingRoomDropdown');
        
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

        // Check Movie Room notifications
        const movieQuery = query(
            collection(db, 'bookings'),
            where('room_type', '==', 'Movie Room'),
            where('status', '==', 'รออนุมัติ')
        );
        const movieSnapshot = await getDocs(movieQuery);
        const movieCount = movieSnapshot.size;
        
        const movieBadge = document.getElementById('movie-notification-badge');
        const movieDropdown = document.getElementById('movieRoomDropdown');
        
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
    } catch (error) {
        console.error("Error fetching notification counts:", error);
    }
}

function setupDropdowns() {
    const meetingRoomDropdown = document.getElementById('meetingRoomDropdown');
    if (meetingRoomDropdown) {
        meetingRoomDropdown.classList.remove('hidden');
        const button = meetingRoomDropdown.previousElementSibling;
        const icon = button?.querySelector('[data-feather="chevron-down"]');
        if (icon) {
            icon.style.transform = 'rotate(180deg)';
        }
    }
}

function handleLogout() {
    if (confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
        window.location.href = 'adminLogin.html';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    feather.replace();
    setupDropdowns();
    fetchBookings();
    updateNotificationBadges();

    const logoutButton = document.querySelector('.mt-auto');
    logoutButton?.addEventListener('click', handleLogout);
});

setInterval(updateNotificationBadges, 500);