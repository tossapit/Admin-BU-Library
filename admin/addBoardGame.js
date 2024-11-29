// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCTRAyaI-eBBfWUjMSv1XprKAaIDlacy3g",
    authDomain: "bulibrary-770bb.firebaseapp.com",
    projectId: "bulibrary-770bb",
    storageBucket: "bulibrary-770bb.appspot.com",
    messagingSenderId: "688134819645",
    appId: "1:688134819645:web:97a300cfac462f5459bf54",
    measurementId: "G-C72Z3EK47W",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initialize Feather Icons when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    feather.replace();
    setupFormSubmission();
});

// Get next board game ID
async function getNextBoardgameId() {
    try {
        const boardgamesRef = collection(db, 'boardgame');
        const q = query(boardgamesRef, orderBy('bgame_id', 'desc'), limit(1));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            return 'bg001';
        }

        const lastDoc = snapshot.docs[0].data();
        const lastId = lastDoc.bgame_id || 'bg000';
        // ตัด 'bg' ออก แล้วแปลงเป็นตัวเลข
        const lastNumber = parseInt(lastId.replace('bg', ''));
        // เพิ่มค่าและเติม 0 ข้างหน้า
        const nextId = 'bg' + String(lastNumber + 1).padStart(3, '0');
        return nextId;
    } catch (error) {
        console.error("Error getting next ID:", error);
        return 'bg001';
    }
}

// Setup form submission
function setupFormSubmission() {
    const form = document.getElementById('addBoardgameForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'กำลังบันทึก...';

        try {
            const name_bg = document.getElementById('name_bg').value.trim();

            if (!name_bg) {
                throw new Error('กรุณากรอกชื่อบอร์ดเกม');
            }

            // Get next ID first
            const bgame_id = await getNextBoardgameId();
            console.log('Generated ID:', bgame_id);

            // Save to Firestore
            console.log('Saving to Firestore...');
            const boardgameData = {
                bgame_id,
                name_bg,
                created_at: new Date().toISOString()
            };

            const docRef = await addDoc(collection(db, 'boardgame'), boardgameData);
            console.log('Document written with ID:', docRef.id);

            alert('บันทึกข้อมูลสำเร็จ');
            window.location.href = 'dataBoardGame.html';

        } catch (error) {
            console.error('Error:', error);
            alert('เกิดข้อผิดพลาด: ' + error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'บันทึก';
        }
    });
}

// Dropdown functionality (if needed)
window.toggleDropdown = function(id) {
    const dropdown = document.getElementById(id);
    const icon = event.currentTarget.querySelector('[data-feather="chevron-down"]');
    
    if (dropdown && icon) {
        dropdown.classList.toggle('hidden');
        icon.style.transform = dropdown.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
        feather.replace();
    }
}