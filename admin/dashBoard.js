document.addEventListener('DOMContentLoaded', function() {
    // Initialize Feather Icons
    feather.replace();

    // Default tab selection
    showTab('meeting');
    
    // Update stats on page load
    updateStats();
});

// Tab Switching Logic
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

// Sample data update function
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

// Dropdown functionality
function toggleDropdown(id) {
    const dropdown = document.getElementById(id);
    const icon = event.currentTarget.querySelector('[data-feather="chevron-down"]');
    
    // Toggle visibility using Tailwind classes
    dropdown.classList.toggle('hidden');
    
    // Rotate icon
    if (dropdown.classList.contains('hidden')) {
        icon.style.transform = 'rotate(0deg)';
    } else {
        icon.style.transform = 'rotate(180deg)';
    }
    
    feather.replace();
}

// Booking system toggle
function toggleBookingSystem(isOpen) {
    document.getElementById('openBookingButton').classList.toggle("hidden", isOpen);
    document.getElementById('closeBookingButton').classList.toggle("hidden", !isOpen);
}
