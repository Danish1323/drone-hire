// equipment.js | Equipment Page JavaScript | DroneHire

document.addEventListener('DOMContentLoaded', function() {

  // =============================================
  // GET ALL TAB BUTTONS AND EQUIPMENT CARDS
  // =============================================
  const tabButtons = document.querySelectorAll('.tab-btn');
  const equipmentCards = document.querySelectorAll('.equipment-card-col');

  // =============================================
  // FILTER FUNCTION
  // Shows only cards matching the selected category
  // =============================================
  function filterEquipment(category) {
    // Loop through each equipment card
    equipmentCards.forEach(function(col) {
      // Find the inner card to get data-category
      const card = col.querySelector('.equipment-card');
      if (!card) return;

      // Read the data-category attribute from the card's HTML
      const cardCategory = card.getAttribute('data-category');

      if (category === 'all' || cardCategory === category) {
        // Show this column
        col.style.display = 'block';
        // Small fade-in effect by briefly setting opacity
        col.style.opacity = '0';
        // Use setTimeout to allow the display change to render first,
        // then fade the card in by setting opacity to 1
        setTimeout(function() {
          col.style.transition = 'opacity 0.3s ease';
          col.style.opacity = '1';
        }, 30);
      } else {
        // Hide this column wrapper
        col.style.display = 'none';
      }
    });
  }

  // =============================================
  // ATTACH CLICK EVENTS TO ALL TAB BUTTONS
  // =============================================
  tabButtons.forEach(function(button) {
    button.addEventListener('click', function() {

      // Remove 'active' class from ALL tab buttons
      tabButtons.forEach(function(btn) {
        btn.classList.remove('active');
      });

      // Add 'active' class to the button that was clicked
      this.classList.add('active');

      // Read the data-filter attribute from the clicked button
      const filterValue = this.getAttribute('data-filter');

      // Call the filter function with the selected category
      filterEquipment(filterValue);
    });
  });

  // =============================================
  // INITIALIZE — show all cards on page load
  // =============================================
  filterEquipment('all');

});
