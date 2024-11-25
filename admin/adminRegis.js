// adminRegis.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

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
const form = document.getElementById("adminRegister");
const submitBtn = form.querySelector('button[type="submit"]');
const confirmPasswordInput = form.confirmPassword;
const passwordInput = form.password;
const errorMessage = document.createElement('p');
errorMessage.className = 'text-sm text-red-500 mt-1 hidden';
confirmPasswordInput.parentNode.appendChild(errorMessage);

function validatePassword() {
    if (confirmPasswordInput.value && passwordInput.value !== confirmPasswordInput.value) {
        errorMessage.textContent = 'รหัสผ่านไม่ตรงกัน';
        errorMessage.classList.remove('hidden');
    } else {
        errorMessage.classList.add('hidden');
    }
}

confirmPasswordInput.addEventListener('input', validatePassword);
passwordInput.addEventListener('input', validatePassword);

function checkFormValidity() {
    const username = form.username.value.trim();
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;
    
    submitBtn.disabled = !(
        username && 
        password && 
        password.length >= 6 && 
        password === confirmPassword
    );
}

function clearForm() {
    form.reset();
    checkFormValidity();
}

// Add input validation
form.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', checkFormValidity);
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        await addDoc(collection(db, 'admin'), {
            username: form.username.value.trim(),
            password: form.password.value
        });
        
        clearForm();
        alert("ลงทะเบียนสำเร็จ");
    } catch (error) {
        console.error("Error adding document: ", error);
        alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง');
    }
});