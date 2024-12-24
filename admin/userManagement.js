import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore, collection, getDocs, deleteDoc, doc, query, where, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCTRAyaI-eBBfWUjMSv1XprKAaIDlacy3g",
    authDomain: "bulibrary-770bb.firebaseapp.com",
    projectId: "bulibrary-770bb",
    storageBucket: "bulibrary-770bb.appspot.com",
    messagingSenderId: "688134819645",
    appId: "1:688134819645:web:97a300cfac462f5459bf54"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let allUsers = [];

// Main function to fetch users data
async function fetchUsers(searchTerm = '') {
    try {
        // Only fetch from Firestore if local cache is empty
        if (allUsers.length === 0) {
            const usersSnapshot = await getDocs(collection(db, 'user'));
            allUsers = usersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                status: doc.data().status || 'active' // Default status if not set
            }));
            console.log('Fetched users:', allUsers); // For debugging
        }

        // Filter users based on search term
        const filteredUsers = searchTerm 
            ? allUsers.filter(user => 
                (user.studentId?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()))
            : allUsers;

        displayUsers(filteredUsers);
        await updateNotificationBadges();
    } catch (error) {
        console.error("Error fetching users:", error);
        alert('เกิดข้อผิดพลาดในการดึงข้อมูล: ' + error.message);
    }
}

// Function to display users in table
function displayUsers(users) {
    const tableBody = document.getElementById('userTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="py-3 px-4">${user.studentId || '-'}</td>
            <td class="py-3 px-4">${user.firstName +" "+ user.lastName || '-'}</td>
            <td class="py-3 px-4">${user.email || '-'}</td>
            <td class="py-3 px-4 flex justify-center gap-2">
                <button onclick="editUser('${user.id}')" 
                    class="text-sm bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded">
                    แก้ไข
                </button>
                <button onclick="deleteUser('${user.id}')" 
                    class="text-sm bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded">
                    ลบ
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

window.editUser = async function(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;

    document.getElementById('editUserId').value = userId;
    document.getElementById('editStudentId').value = user.studentId || '';
    document.getElementById('editFirstName').value = user.firstName || '';
    document.getElementById('editLastName').value = user.lastName || '';
    document.getElementById('editEmail').value = user.email || '';

    document.getElementById('editUserModal').classList.remove('hidden');
};

window.closeEditModal = function() {
    document.getElementById('editUserModal').classList.add('hidden');
    document.getElementById('editUserForm').reset();
};

document.getElementById('editUserForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!confirm('คุณต้องการบันทึกการเปลี่ยนแปลงหรือไม่?')) {
        return;
    }

    const userId = document.getElementById('editUserId').value;

    try {
        const userRef = doc(db, 'user', userId);
        const userData = {
            studentId: document.getElementById('editStudentId').value,
            firstName: document.getElementById('editFirstName').value,
            lastName: document.getElementById('editLastName').value,
            email: document.getElementById('editEmail').value
        };

        await updateDoc(userRef, userData);
        const userIndex = allUsers.findIndex(user => user.id === userId);
        if (userIndex !== -1) {
            allUsers[userIndex] = { ...allUsers[userIndex], ...userData };
            displayUsers(allUsers);
        }
        
        closeEditModal();
        
    } catch (error) {
        console.error('เกิดข้อผิดพลาด:', error);
        alert('เกิดข้อผิดพลาดในการแก้ไขข้อมูล: ' + error.message);
    }
});

window.deleteUser = async function(userId) {
    if (confirm('คุณต้องการลบผู้ใช้นี้หรือไม่?')) {
        try {
            const userRef = doc(db, 'user', userId);
            await deleteDoc(userRef);
            
            // Update local data
            allUsers = allUsers.filter(user => user.id !== userId);
            displayUsers(allUsers);
            
            
        } catch (error) {
            console.error("Error deleting user:", error);
            alert('เกิดข้อผิดพลาดในการลบผู้ใช้: ' + error.message);
        }
    }
};

// Setup search functionality
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                fetchUsers(e.target.value);
            }, 300);
        });
    }
}

// Notification badges update
async function updateNotificationBadges() {
    try {
        const [meetingSnapshot, movieSnapshot] = await Promise.all([
            getDocs(query(
                collection(db, 'bookings'),
                where('room_type', '==', 'Meeting Room'),
                where('status', '==', 'รออนุมัติ')
            )),
            getDocs(query(
                collection(db, 'bookings'),
                where('room_type', '==', 'Movie Room'),
                where('status', '==', 'รออนุมัติ')
            ))
        ]);

        updateBadge('meeting', meetingSnapshot.size);
        updateBadge('movie', movieSnapshot.size);
    } catch (error) {
        console.error("Error updating badges:", error);
    }
}

function updateBadge(type, count) {
    const badge = document.getElementById(`${type}-notification-badge`);
    const dropdown = document.getElementById(`${type}Room`);
    
    if (badge && dropdown) {
        if (count > 0) {
            badge.textContent = count;
            badge.classList.remove('hidden');
            
            if (!badge.dataset.prevCount || parseInt(badge.dataset.prevCount) < count) {
                dropdown.classList.remove('hidden');
                const button = dropdown.previousElementSibling;
                const icon = button?.querySelector('[data-feather="chevron-down"]');
                if (icon) icon.style.transform = 'rotate(180deg)';
                feather.replace();
            }
            badge.dataset.prevCount = count;
        } else {
            badge.classList.add('hidden');
            badge.dataset.prevCount = 0;
        }
    }
}

// Dropdown functionality
window.toggleDropdown = function(dropdownId) {
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

// Logout handler
function handleLogout() {
    if (confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
        window.location.href = 'adminLogin.html';
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded, initializing...');
    feather.replace();
    fetchUsers();
    setupSearch();
    updateNotificationBadges();

    const logoutButton = document.querySelector('.mt-auto');
    logoutButton?.addEventListener('click', handleLogout);
});