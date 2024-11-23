document.addEventListener('DOMContentLoaded', function() {
    feather.replace();
});

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