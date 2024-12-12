import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, where } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const firebaseConfig = {
   apiKey: "AIzaSyCTRAyaI-eBBfWUjMSv1XprKAaIDlacy3g",
   authDomain: "bulibrary-770bb.firebaseapp.com", 
   projectId: "bulibrary-770bb",
   storageBucket: "bulibrary-770bb.appspot.com",
   messagingSenderId: "688134819645",
   appId: "1:688134819645:web:97a300cfac462f5459bf54"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function formatDate(date) {
   return new Date(date).toLocaleDateString('th-TH', {
       year: 'numeric',
       month: 'long',
       day: 'numeric',
       hour: '2-digit',
       minute: '2-digit'
   });
}

async function loadRooms() {
   const roomsSnapshot = await getDocs(collection(db, 'movieRooms'));
   const roomTableBody = document.getElementById('roomTable');
   roomTableBody.innerHTML = '';
   
   roomsSnapshot.forEach(doc => {
       const room = doc.data();
       const row = document.createElement('tr');
       row.innerHTML = `
           <td class="px-6 py-4">${room.name}</td>
           <td class="px-6 py-4">${room.floor}</td>
           <td class="px-6 py-4">${formatDate(room.createdAt.toDate())} น.</td>
           <td class="px-6 py-4">
               <button onclick="deleteRoom('${doc.id}')" class="bg-red-500 hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition-colors duration-200">ลบ</button>
           </td>
       `;
       roomTableBody.appendChild(row);
   });
}

document.getElementById('roomForm')?.addEventListener('submit', async (e) => {
   e.preventDefault();
   
   const roomName = document.getElementById('roomName').value;
   const floorNumber = document.getElementById('floorNumber').value;

   if (confirm('ต้องการเพิ่มห้องใหม่หรือไม่?')) {
       try {
           await addDoc(collection(db, 'movieRooms'), {
               name: roomName,
               floor: floorNumber,
               status: 'ว่าง',
               createdAt: new Date()
           });
           alert('เพิ่มห้องสำเร็จ');
           document.getElementById('roomForm').reset();
           loadRooms();
       } catch (error) {
           alert('เกิดข้อผิดพลาด: ' + error.message);
       }
   }
});

window.deleteRoom = async (id) => {
   if (confirm('ต้องการลบห้องนี้หรือไม่?')) {
       try {
           await deleteDoc(doc(db, 'movieRooms', id));
           alert('ลบห้องสำเร็จ');
           loadRooms();
       } catch (error) {
           alert('เกิดข้อผิดพลาด: ' + error.message);
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
    loadRooms();
    updateNotificationBadge();
});