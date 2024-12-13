import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

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

async function loadBoardGames() {
    try {
        const boardgamesRef = collection(db, 'boardgame');
        const q = query(boardgamesRef, orderBy('bgame_id', 'asc'));
        const snapshot = await getDocs(q);
        const tableBody = document.getElementById('boardGameTableBody');
        tableBody.innerHTML = '';

        if (snapshot.empty) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `
                <td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">
                    ไม่พบข้อมูลบอร์ดเกม
                </td>
            `;
            tableBody.appendChild(emptyRow);
            return;
        }

        snapshot.forEach((doc) => {
            const data = doc.data();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${data.bgame_id}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${data.name_bg}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${data.quantity}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onclick="openDeleteModal('${doc.id}')" class="text-red-600 hover:text-red-900">
                        <i data-feather="trash-2" class="w-4 h-4"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        feather.replace();
    } catch (error) {
        console.error("Error loading board games:", error);
        alert('เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + error.message);
    }
}

async function getNextBoardgameId() {
    try {
        const boardgamesRef = collection(db, 'boardgame');
        const q = query(boardgamesRef, orderBy('bgame_id', 'desc'), limit(1));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) return 'bg001';

        const lastDoc = snapshot.docs[0].data();
        const lastId = lastDoc.bgame_id || 'bg000';
        const lastNumber = parseInt(lastId.replace('bg', ''));
        return 'bg' + String(lastNumber + 1).padStart(3, '0');
    } catch (error) {
        console.error("Error getting next ID:", error);
        return 'bg001';
    }
}

function setupFormSubmission() {
    const form = document.getElementById('addBoardgameForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'กำลังบันทึก...';

        try {
            const name_bg = document.getElementById('name_bg').value.trim();
            const image_url = document.getElementById('image_url').value.trim();
            const quantity = parseInt(document.getElementById('quantity').value);

            // Validation
            if (!name_bg) throw new Error('กรุณากรอกชื่อบอร์ดเกม');
            if (!image_url) throw new Error('กรุณากรอก URL รูปภาพ');
            if (!isValidUrl(image_url)) throw new Error('กรุณากรอก URL รูปภาพที่ถูกต้อง');
            if (isNaN(quantity) || quantity < 1) throw new Error('กรุณากรอกจำนวนบอร์ดเกมที่ถูกต้อง');

            const bgame_id = await getNextBoardgameId();
            const boardgameData = {
                bgame_id,
                name_bg,
                image_url,
                quantity,
                created_at: new Date().toISOString()
            };

            await addDoc(collection(db, 'boardgame'), boardgameData);
            alert('บันทึกข้อมูลสำเร็จ');
            closeAddModal();
            loadBoardGames();

        } catch (error) {
            console.error('Error:', error);
            alert('เกิดข้อผิดพลาด: ' + error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'บันทึก';
        }
    });
}

// Add delete function to window object
window.deleteBoardGame = async function(docId) {
    try {
        const docRef = doc(db, 'boardgame', docId);
        await deleteDoc(docRef);
        closeDeleteModal();
        loadBoardGames();
        alert('ลบข้อมูลสำเร็จ');
    } catch (error) {
        console.error('Error:', error);
        alert('เกิดข้อผิดพลาดในการลบข้อมูล: ' + error.message);
    }
}

// เพิ่มฟังก์ชันตรวจสอบ URL
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

window.toggleDropdown = function(dropdownId, event) {
    // ตรวจสอบ parameters
    event = event || window.event;
    if (!event) return;
    
    // หา dropdown element
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown) return;

    // หา icon จากปุ่มที่ถูกคลิก
    const button = event.currentTarget;
    const icon = button.querySelector('[data-feather="chevron-down"]');
    
    // Toggle dropdown
    dropdown.classList.toggle('hidden');
    
    // หมุน icon ถ้ามี
    if (icon) {
        icon.style.transform = dropdown.classList.contains('hidden') ? 
            'rotate(0deg)' : 'rotate(180deg)';
    }

    // Re-render Feather icons
    feather.replace();
};

// Setup dropdowns
function setupDropdowns() {
    // ตั้งค่า event listeners สำหรับทุกปุ่ม dropdown
    document.querySelectorAll('button[onclick*="toggleDropdown"]').forEach(button => {
        const dropdownId = button.getAttribute('onclick').match(/'([^']+)'/)?.[1];
        if (dropdownId) {
            button.onclick = (event) => toggleDropdown(dropdownId, event);
        }
    });

    // Setup initial state for dropdowns
    const dropdowns = {
        'meetingRoom': document.getElementById('meetingRoom'),
        'movieRoom': document.getElementById('movieRoom'),
        'boardGame': document.getElementById('boardGame')
    };

    Object.entries(dropdowns).forEach(([id, element]) => {
        if (element) {
            element.classList.add('hidden');
        }
    });
}

function handleLogout() {
    if (confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
        window.location.href = 'adminLogin.html';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    feather.replace();
    loadBoardGames();
    setupFormSubmission();

    const logoutButton = document.querySelector('.mt-auto');
    logoutButton?.addEventListener('click', handleLogout);
});