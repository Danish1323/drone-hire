/**
 * dashboard.js
 * Logic for fetching user data and booking history
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Auth Check
    const currentUser = JSON.parse(localStorage.getItem('dronehire_current_user'));
    
    if (!currentUser || !currentUser.email) {
        // Redirect to login if not authorized
        window.location.href = 'auth.html';
        return;
    }

    // 2. Setup Navbar Auth Area
    const navAuthArea = document.getElementById('navAuthArea');
    navAuthArea.innerHTML = `
        <div class="user-profile-badge dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
            ${currentUser.name.split(' ')[0].toUpperCase()}
        </div>
        <ul class="dropdown-menu dropdown-menu-dark dropdown-menu-end">
            <li><a class="dropdown-item" href="dashboard.html">/Dashboard</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item text-danger" href="#" id="navbarLogoutBtn">/Terminate_Session</a></li>
        </ul>
        <a href="booking.html" class="btn-primary-custom ms-2" style="font-size: 0.8rem; padding: 10px 16px;">DEPLOY</a>
    `;

    // 3. Populate Sidebar Info
    document.getElementById('userNameDisplay').textContent = currentUser.name;
    document.getElementById('userEmailDisplay').textContent = currentUser.email;
    document.getElementById('userInitial').textContent = currentUser.name.charAt(0).toUpperCase();

    // 4. Logout Handlers
    const handleLogout = (e) => {
        e.preventDefault();
        localStorage.removeItem('dronehire_current_user');
        window.location.href = 'index.html';
    };
    
    document.getElementById('navbarLogoutBtn').addEventListener('click', handleLogout);
    document.getElementById('sidebarLogoutBtn').addEventListener('click', handleLogout);

    // 5. Fetch Bookings specific to this user
    loadUserBookings(currentUser.email);
});

function loadUserBookings(userEmail) {
    // All bookings are stored in 'dronehire_bookings' array
    const allBookings = JSON.parse(localStorage.getItem('dronehire_bookings')) || [];
    
    // Filter by the logged-in user's email
    const myBookings = allBookings.filter(b => b.clientEmail === userEmail);
    
    const tableContainer = document.getElementById('tableContainer');
    const emptyState = document.getElementById('emptyState');
    const tableBody = document.getElementById('bookingsTableBody');
    const counter = document.getElementById('totalBookingsCounter');

    counter.textContent = `${myBookings.length} RECORD${myBookings.length !== 1 ? 'S' : ''}`;

    if (myBookings.length === 0) {
        tableContainer.style.display = 'none';
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';
        tableContainer.style.display = 'block';
        tableBody.innerHTML = '';

        // Sort by newest first (assuming ID loosely correlates with time or date string)
        // Better: just reverse the array so newest added is first
        myBookings.reverse().forEach(booking => {
            const tr = document.createElement('tr');
            
            // Format ID nicely
            const refID = booking.id ? booking.id.toUpperCase() : 'N/A';
            
            // Format date safely
            let flightDate = booking.date || 'TBD';
            
            tr.innerHTML = `
                <td class="font-monospace fw-bold">#${refID}</td>
                <td>
                    <div class="fw-bold">${flightDate}</div>
                    <div class="small text-muted font-monospace">${booking.time || 'Any'} | ${booking.duration || 1} Day(s)</div>
                </td>
                <td class="text-uppercase">${booking.service || 'Custom Operator'}</td>
                <td class="text-uppercase font-monospace text-muted small">${booking.equipment || 'Standard Allocation'}</td>
                <td><span class="booking-status confirmed">CONFIRMED</span></td>
            `;
            
            tableBody.appendChild(tr);
        });
    }
}
