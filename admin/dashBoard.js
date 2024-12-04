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
        const [usersSnapshot, bookingsSnapshot, activeSnapshot] = await Promise.all([
            getDocs(collection(db, 'users')),
            getDocs(collection(db, 'bookings')),
            getDocs(query(collection(db, 'bookings'), where('status', '==', 'active')))
        ]);

        document.getElementById('totalUsers').textContent = usersSnapshot.size;
        document.getElementById('totalBookings').textContent = bookingsSnapshot.size;
        document.getElementById('activeBookings').textContent = activeSnapshot.size;
    } catch (error) {
        console.error("Error fetching stats:", error);
    }
}

async function updateRoomStats() {
    try {
        const rooms = ['Meeting Room', 'Movie Room', 'Board Game'];
        const contentIds = ['meeting-content', 'movie-content', 'boardgame-content'];
        
        for (let i = 0; i < rooms.length; i++) {
            const roomType = rooms[i];
            const contentId = contentIds[i];
            
            const [totalSnapshot, activeSnapshot] = await Promise.all([
                getDocs(query(collection(db, 'bookings'), where('room_type', '==', roomType))),
                getDocs(query(collection(db, 'bookings'), 
                    where('room_type', '==', roomType),
                    where('status', '==', 'active')))
            ]);
            
            const content = document.getElementById(contentId);
            if (content) {
                const stats = content.getElementsByClassName('flex items-center justify-between');
                stats[0].lastElementChild.textContent = totalSnapshot.size;
                stats[1].lastElementChild.textContent = activeSnapshot.size;
                
                const usageRate = totalSnapshot.size ? 
                    ((activeSnapshot.size / totalSnapshot.size) * 100).toFixed(1) : 0;
                stats[2].querySelector('.flex.items-center').textContent = `${usageRate}%`;
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

// Make functions globally accessible
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

// Dropdown functionality
// Make toggleDropdown globally accessible
window.toggleDropdown = function(id) {
    const dropdown = document.getElementById(id);
    const button = document.querySelector(`button[onclick="toggleDropdown('${id}')"]`);
    const icon = button.querySelector('[data-feather="chevron-down"]');
    
    dropdown.classList.toggle('hidden');
    
    if (dropdown.classList.contains('hidden')) {
        icon.style.transform = 'rotate(0deg)';
    } else {
        icon.style.transform = 'rotate(180deg)';
    }
    
    feather.replace();
};

document.addEventListener('DOMContentLoaded', async () => {
    feather.replace();
    await Promise.all([
        updateStats(), 
        updateRoomStats(),
        updateNotificationBadge()
    ]);
    showTab('meeting');
    
    // Add event listeners
    const logoutButton = document.querySelector('.mt-auto');
    logoutButton?.addEventListener('click', handleLogout);

    // Add dropdown event listeners to menu items
    const dropdownButtons = document.querySelectorAll('[data-dropdown]');
    dropdownButtons.forEach(button => {
        button.addEventListener('click', () => toggleDropdown(button.dataset.dropdown));
    });
});