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

function clearForm() {
 form.username.value = "";
 form.password.value = "";
 form.confirmPassword.value = "";
}

form.addEventListener('submit', async (e) => {
 e.preventDefault();

 const username = form.username.value.trim();
 const password = form.password.value;
 const confirmPassword = form.confirmPassword.value;

 if (!username) {
     return showError('username', 'กรุณากรอกชื่อผู้ใช้');
 }

 if (!password) {
     return showError('password', 'กรุณากรอกรหัสผ่าน');
 }

 if (password.length < 6) {
     return showError('password', 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
 }

 if (password !== confirmPassword) {
     return showError('confirmPassword', 'รหัสผ่านไม่ตรงกัน');
 }

 try {
     await addDoc(collection(db, 'admin'), {
         username,
         password
     });

     clearForm();
     const successAlert = document.getElementById('successAlert');
     if (successAlert) {
         successAlert.classList.remove('hidden');
         setTimeout(() => {
             successAlert.classList.add('hidden');
         }, 3000);
     } else {
         alert("บันทึกข้อมูลสำเร็จ");
     }
 } catch (error) {
     console.error("Error adding document: ", error);
     alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง');
 }
});