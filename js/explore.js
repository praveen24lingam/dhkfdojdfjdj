// ===================================
// EXPLORE PAGE - explore.js
// Filter functionality for explore page
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    initExploreFilters();
});

function initExploreFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const placeCards = document.querySelectorAll('.explore-place-card');
    
    if (!filterButtons.length || !placeCards.length) return;
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('filter-btn-active'));
            
            // Add active class to clicked button
            this.classList.add('filter-btn-active');
            
            // Get filter value
            const filterValue = this.getAttribute('data-filter');
            
            // Filter cards with animation
            placeCards.forEach(card => {
                const category = card.getAttribute('data-category');
                
                if (filterValue === 'all' || category === filterValue) {
                    // Show card
                    card.style.display = 'block';
                    
                    // Fade in animation
                    setTimeout(() => {
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(20px)';
                    }, 0);
                    
                    setTimeout(() => {
                        card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    // Hide card
                    card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

// Update filter counts dynamically
function updateFilterCounts() {
    const placeCards = document.querySelectorAll('.explore-place-card');
    const categories = {};
    
    placeCards.forEach(card => {
        const category = card.getAttribute('data-category');
        categories[category] = (categories[category] || 0) + 1;
    });
    
    // Update count badges
    Object.keys(categories).forEach(category => {
        const button = document.querySelector(`[data-filter="${category}"]`);
        if (button) {
            const countBadge = button.querySelector('.filter-count');
            if (countBadge) {
                countBadge.textContent = categories[category];
            }
        }
    });
}

// Call on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateFilterCounts);
} else {
    updateFilterCounts();
}
