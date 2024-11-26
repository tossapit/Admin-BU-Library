// Add this to your existing JavaScript (dashBoard.js)
function handleLogout() {
    const confirmed = confirm("คุณต้องการออกจากระบบใช่หรือไม่?");
    if (confirmed) {
        // Add your logout logic here - for example:
        window.location.href = 'adminLogin.html'; // Redirect to login page
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Your existing initialization code
    feather.replace();
    showTab('meeting');
    updateStats();
    
    // Add logout button event listener
    const logoutButton = document.querySelector('.logout-btn');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }
});

// Rest of your existing JavaScript functions...
function showTab(tabName) {
    // Hide all content and reset tab styles
    document.querySelectorAll('[id$="-content"]').forEach(content => content.classList.add('hidden'));
    document.querySelectorAll('[id$="-tab"]').forEach(tab => {
        tab.classList.remove('text-blue-600', 'border-b-2', 'border-blue-600');
        tab.classList.add('text-gray-500');
    });

    // Show selected content and update tab styles
    document.getElementById(tabName + '-content').classList.remove('hidden');
    const selectedTab = document.getElementById(tabName + '-tab');
    selectedTab.classList.add('text-blue-600', 'border-b-2', 'border-blue-600');
    selectedTab.classList.remove('text-gray-500');
}

function updateStats() {
    const stats = {
        totalUsers: 485,
        totalBookings: 150,
        activeBookings: 12
    };

    document.getElementById('totalUsers').textContent = stats.totalUsers;
    document.getElementById('totalBookings').textContent = stats.totalBookings;
    document.getElementById('activeBookings').textContent = stats.activeBookings;
}

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

function toggleBookingSystem(isOpen) {
    document.getElementById('openBookingButton').classList.toggle("hidden", isOpen);
    document.getElementById('closeBookingButton').classList.toggle("hidden", !isOpen);
}