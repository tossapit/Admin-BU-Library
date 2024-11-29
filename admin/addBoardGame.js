// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-storage.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCTRAyaI-eBBfWUjMSv1XprKAaIDlacy3g",
    authDomain: "bulibrary-770bb.firebaseapp.com",
    projectId: "bulibrary-770bb",
    storageBucket: "bulibrary-770bb.appspot.com", // แก้ไขจาก firebasestorage.app เป็น appspot.com
    messagingSenderId: "688134819645",
    appId: "1:688134819645:web:97a300cfac462f5459bf54",
    measurementId: "G-C72Z3EK47W",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Feather Icons
    feather.replace();

    // Set up image preview handler
    const imageInput = document.getElementById('image');
    if (imageInput) {
        imageInput.addEventListener('change', handleImagePreview);
    }

    // Set up form submission handler
    const form = document.getElementById('addBoardgameForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
});

// Handle image preview
function handleImagePreview(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('preview');
            if (preview) {
                preview.src = e.target.result;
                preview.classList.remove('hidden');
            }
        }
        reader.readAsDataURL(file);
    }
}

// Function to get next ID
async function getNextBoardgameId() {
    try {
        const boardgamesRef = collection(db, 'boardgame');
        const q = query(boardgamesRef, orderBy('bgame_id', 'desc'), limit(1));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            return '001';
        }

        const lastId = querySnapshot.docs[0].data().bgame_id;
        const nextNum = String(Number(lastId) + 1).padStart(3, '0');
        return nextNum;
    } catch (error) {
        console.error("Error getting next ID:", error);
        return '001';
    }
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();

    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;

    try {
        // Disable submit button and show loading state
        submitButton.disabled = true;
        submitButton.innerHTML = 'กำลังบันทึก...';

        // Get form values
        const name_bg = document.getElementById('name_bg').value;
        const imageFile = document.getElementById('image').files[0];

        if (!name_bg || !imageFile) {
            throw new Error('กรุณากรอกข้อมูลให้ครบถ้วน');
        }

        // Get next ID
        const bgame_id = await getNextBoardgameId();

        // Upload image
        const storageRef = ref(storage, `boardgame-images/${bgame_id}`);
        await uploadBytes(storageRef, imageFile);
        const imageUrl = await getDownloadURL(storageRef);

        // Create document data
        const boardgameData = {
            bgame_id,
            name_bg,
            image_url: imageUrl,
            created_at: new Date().toISOString()
        };

        // Add to Firestore
        const docRef = await addDoc(collection(db, 'boardgame'), boardgameData);
        console.log("Document written with ID: ", docRef.id);

        alert('เพิ่มบอร์ดเกมสำเร็จ');
        window.location.href = 'dataBoardGame.html';

    } catch (error) {
        console.error("Error adding boardgame:", error);
        alert(error.message || 'เกิดข้อผิดพลาดในการเพิ่มบอร์ดเกม');
        
        // Reset button state
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
    }
}

// Dropdown functionality
window.toggleDropdown = function(id) {
    const dropdown = document.getElementById(id);
    const icon = event.currentTarget.querySelector('[data-feather="chevron-down"]');
    
    if (dropdown && icon) {
        dropdown.classList.toggle('hidden');
        icon.style.transform = dropdown.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
        feather.replace();
    }
}