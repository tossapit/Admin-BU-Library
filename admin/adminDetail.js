import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";

const firebaseConfig = {
    apiKey: "AIzaSyCTRAyaI-eBBfWUjMSv1XprKAaIDlacy3g",
    authDomain: "bulibrary-770bb.firebaseapp.com",
    projectId: "bulibrary-770bb",
    storageBucket: "bulibrary-770bb.firebasestorage.app",
    messagingSenderId: "688134819645",
    appId: "1:688134819645:web:97a300cfac462f5459bf54",
    measurementId: "G-C72Z3EK47W",
};

initializeApp(firebaseConfig);

document.addEventListener('DOMContentLoaded', function() {
    feather.replace();
    
    const bookingData = JSON.parse(sessionStorage.getItem('selectedBooking'));
    
    if (bookingData) {
        document.getElementById('booking-id').textContent = `#${bookingData.queue_number}`;
        document.getElementById('booking-date').textContent = new Date(bookingData.created_at).toLocaleDateString('th-TH');
        document.getElementById('booking-time').textContent = bookingData.booking_time;
        document.getElementById('booking-room').textContent = bookingData.room_type;
        document.getElementById('booking-user').textContent = bookingData.mainBooker;
        
        const statusElement = document.getElementById('booking-status');
        statusElement.textContent = bookingData.status;
        
        // Add green color for approved status
        if (bookingData.status === 'อนุมัติ') {
            statusElement.classList.add('text-green-500');
        } else {
            statusElement.classList.add('text-yellow-500');
        }
        
        sessionStorage.removeItem('selectedBooking');
    }
});

function toggleDropdown(id) {
    const dropdown = document.getElementById(id);
    const icon = event.currentTarget.querySelector('[data-feather="chevron-down"]');
    
    dropdown.classList.toggle('hidden');
    
    if (dropdown.classList.contains('hidden')) {
        icon.style.transform = 'rotate(0deg)';
    } else {
        icon.style.transform = 'rotate(180deg)';
    }
    
    feather.replace();
}