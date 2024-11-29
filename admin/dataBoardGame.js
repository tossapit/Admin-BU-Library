// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCTRAyaI-eBBfWUjMSv1XprKAaIDlacy3g",
    authDomain: "bulibrary-770bb.firebaseapp.com",
    projectId: "bulibrary-770bb",
    storageBucket: "bulibrary-770bb.firebasestorage.app",
    messagingSenderId: "688134819645",
    appId: "1:688134819645:web:97a300cfac462f5459bf54",
    measurementId: "G-C72Z3EK47W",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to update overview statistics
async function updateOverviewStats() {
    try {
        const bookingsRef = collection(db, 'bookingboardgame');
        const bookingsSnapshot = await getDocs(bookingsRef);
        
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        
        // Count today's bookings
        const todayBookings = bookingsSnapshot.docs.filter(doc => 
            doc.data().bbgame_date === today
        ).length;

        // Update UI
        document.querySelector('.bg-white:nth-child(1) p').textContent = `จำนวนบอร์ดเกมทั้งหมด: 20 เกม`;
        document.querySelector('.bg-white:nth-child(2) p').textContent = `การจองทั้งหมด: ${todayBookings} ครั้ง`;
        document.querySelector('.bg-white:nth-child(3) p').textContent = `การจองที่รอดำเนินการ: ${bookingsSnapshot.size} ครั้ง`;
    } catch (error) {
        console.error("Error updating overview stats:", error);
    }
}

// Function to populate booking table
async function populateBookingTable() {
    try {
        const bookingsRef = collection(db, 'bookingboardgame');
        const q = query(bookingsRef, orderBy('bbgame_date', 'desc'));
        const querySnapshot = await getDocs(q);

        const tbody = document.querySelector('tbody');
        tbody.innerHTML = ''; // Clear existing rows

        querySnapshot.forEach((doc) => {
            const booking = doc.data();
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td class="py-3 px-4">#${booking.bbgame_id}</td>
                <td class="py-3 px-4">${booking.student_fname} ${booking.student_lname}</td>
                <td class="py-3 px-4">${formatTime(booking.bbgame_time)}</td>
                <td class="py-3 px-4">${formatDate(booking.bbgame_date)}</td>
                <td class="py-3 px-4 text-yellow-600">รอดำเนินการ</td>
                <td class="py-3 px-4">
                    <button onclick="showBookingDetails('${doc.id}')" class="bg-blue-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-blue-600">เเสดง</button>
                    <button onclick="cancelBooking('${doc.id}')" class="bg-red-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-red-600">ยกเลิก</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error("Error populating booking table:", error);
    }
}

// Helper function to format date
function formatDate(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

// Helper function to format time
function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes} น.`;
}

// Function to show booking details
async function showBookingDetails(bookingId) {
    try {
        // Implement your booking details view logic here
        console.log(`Showing details for booking ${bookingId}`);
    } catch (error) {
        console.error("Error showing booking details:", error);
    }
}

// Function to cancel booking
async function cancelBooking(bookingId) {
    if (confirm('คุณต้องการยกเลิกการจองนี้ใช่หรือไม่?')) {
        try {
            // Implement your cancellation logic here
            console.log(`Cancelling booking ${bookingId}`);
            // Refresh the table and stats after cancellation
            await updateOverviewStats();
            await populateBookingTable();
        } catch (error) {
            console.error("Error cancelling booking:", error);
            alert('เกิดข้อผิดพลาดในการยกเลิกการจอง');
        }
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
    await updateOverviewStats();
    await populateBookingTable();
});

// Make functions available globally
window.showBookingDetails = showBookingDetails;
window.cancelBooking = cancelBooking;

// Export functions for use in other files if needed
export {
    updateOverviewStats,
    populateBookingTable,
    showBookingDetails,
    cancelBooking
};