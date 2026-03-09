// services.js | Services Page JavaScript | DroneHire

document.addEventListener("DOMContentLoaded", function () {
  // Get all service cards from the page
  const serviceCards = document.querySelectorAll(".service-card");

  // Get the selection status bar element
  const selectionStatus = document.getElementById("selectionStatus");

  // Get the element that will show the selected service name
  const selectedServiceName = document.getElementById("selectedServiceName");

  // Attach a click event listener to each service card
  serviceCards.forEach(function (card) {
    card.addEventListener("click", function () {
      // Step 1: Remove 'selected' class from ALL cards first
      serviceCards.forEach(function (c) {
        c.classList.remove("selected");
      });

      // Step 2: Add 'selected' class to the card that was clicked
      this.classList.add("selected");

      // Step 3: Read the service name from the card's data attribute
      const serviceName = this.getAttribute("data-service");

      // Step 4: Show the selection status bar with the service name and update the proceed link
      selectedServiceName.textContent = serviceName;
      selectionStatus.style.display = "flex";
      
      const proceedBtn = selectionStatus.querySelector('.btn-primary-custom');
      if (proceedBtn) {
          proceedBtn.href = `booking.html?service=${encodeURIComponent(serviceName)}`;
      }

      // Step 5: Scroll to the status bar smoothly
      selectionStatus.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });
});
