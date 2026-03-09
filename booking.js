/**
 * booking.js | DroneHire | Neo-Brutalist Edition
 * Handles step navigation, equipment selection, pricing logic, collision detection, and localStorage saving.
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- State Variables ---
    let currentStep = 1;
    let selectedService = '';
    let selectedEquipment = null;
    let selectedDate = '';
    let selectedDuration = 1;
    let selectedTime = '';
    
    const BASE_PRICES = {
        'Wedding Cinematography': 25000,
        'Real Estate Photography': 10000,
        'Event Coverage': 18000,
        'Land Surveying': 35000
    };

    const EQUIPMENT_RATES = [
        { 
            id: 'mavic3', name: 'DJI Mavic 3 Pro', rate: 4500, img: 'images/dji-mavic-3-pro.webp',
            specialties: ['Tri-Camera System', 'Omnidirectional Obstacle Sensing', '43-min Flight Time'],
            recommendedFor: ['Real Estate', 'Event Coverage', 'Wedding Cinematics', 'Custom Drone Operation']
        },
        { 
            id: 'inspire2', name: 'DJI Inspire 2', rate: 12000, img: 'images/dji-inspire-2.webp',
            specialties: ['Cinema-Grade 5.2K Video', 'Interchangeable Lenses', 'Dual Operator Control'],
            recommendedFor: ['Wedding Cinematics', 'Custom Drone Operation']
        },
        { 
            id: 'phantom4', name: 'Phantom 4 RTK', rate: 8500, img: 'images/dji-phantom-4-rtk.webp',
            specialties: ['CM-Level Accuracy', 'Mechanical Shutter', 'TimeSync System'],
            recommendedFor: ['Topography', 'Land Surveying']
        },
        { 
            id: 'evo2', name: 'Autel EVO II Pro', rate: 5500, img: 'images/Autel EVO II Pro.webp',
            specialties: ['6K Video Resolution', 'Adjustable Aperture', 'No Geofencing'],
            recommendedFor: ['Real Estate', 'Event Coverage']
        },
        { 
            id: 'agras', name: 'DJI Agras T40', rate: 15000, img: 'images/DJI Agras T40.webp',
            specialties: ['40L Spraying Payload', 'Coaxial Twin Rotor', 'Active Phased Array Radar'],
            recommendedFor: ['Custom Drone Operation'] 
        },
        { 
            id: 'skydio', name: 'Skydio 2+', rate: 6000, img: 'images/Skydio 2+.webp',
            specialties: ['Unmatched Autonomous Tracking', 'KeyFrame Cinematography', '360° Avoidance'],
            recommendedFor: ['Event Coverage', 'Custom Drone Operation']
        }
    ];

    // DOM Elements
    const eqGrid = document.getElementById('equipmentSelectGrid');
    const timeGrid = document.getElementById('timeSlotGrid');
    const warning = document.getElementById('availabilityWarning');
    const dSelect = document.getElementById('durationSelect');

    // --- Initialize ---
    initServiceFromUrl();
    renderEquipmentGrid();
    initFlatpickr();
    
    // --- STEP NAVIGATION ---
    const navigateToStep = (step) => {
        if (step === 2 && !selectedEquipment) {
            Swal.fire({
                icon: 'error', title: 'HARDWARE REQUIRED', text: 'Select a primary drone to continue.',
                customClass: { popup: 'border-dark rounded-0', confirmButton: 'btn-primary-custom' }
            });
            return;
        }
        if (step === 3 && (!selectedDate || !selectedTime)) {
            Swal.fire({
                icon: 'error', title: 'SCHEDULE REQUIRED', text: 'Define operation date and initial time slot.',
                customClass: { popup: 'border-dark rounded-0', confirmButton: 'btn-primary-custom' }
            });
            return;
        }

        document.getElementById(`step${currentStep}Panel`).classList.remove('active');
        document.getElementById(`step${step}Panel`).classList.add('active');
        
        // Update Progress UI
        document.querySelectorAll('.step-item').forEach(el => {
            const s = parseInt(el.dataset.step);
            if (s < step) {
                el.classList.add('completed');
                el.classList.remove('active');
            } else if (s === step) {
                el.classList.add('active');
                el.classList.remove('completed');
            } else {
                el.classList.remove('active', 'completed');
            }
        });
        
        currentStep = step;
        updateSummary();
    };

    // Attach listeners and expose globally
    document.getElementById('btnNextToStep2').addEventListener('click', () => navigateToStep(2));
    document.getElementById('btnPrevToStep1').addEventListener('click', () => navigateToStep(1));
    document.getElementById('btnNextToStep3').addEventListener('click', () => navigateToStep(3));
    document.getElementById('btnPrevToStep2').addEventListener('click', () => navigateToStep(2));

    window.nextStep = navigateToStep;
    window.prevStep = navigateToStep;

    // --- LOGIC: INITIALIZE SERVICE ---
    function initServiceFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        selectedService = urlParams.get('service') || 'Custom Drone Operation';
        document.getElementById('sumService').textContent = selectedService;
    }

    // --- LOGIC: HARDWARE GRID ---
    function renderEquipmentGrid() {
        const grid = document.getElementById('equipmentSelectGrid');
        grid.innerHTML = '';
        EQUIPMENT_RATES.forEach(eq => {
            const btn = document.createElement('div');
            btn.className = 'select-btn equipment-btn';
            btn.dataset.id = eq.id;
            
            const isRecommended = selectedService && eq.recommendedFor && eq.recommendedFor.includes(selectedService);
            const badgeHtml = isRecommended ? `<div class="recommended-badge"><i class="bi bi-star-fill"></i> Best for ${selectedService}</div>` : '';
            const specsHtml = eq.specialties ? `<ul class="equipment-specs">${eq.specialties.map(s => `<li>${s}</li>`).join('')}</ul>` : '';

            btn.innerHTML = `
                ${badgeHtml}
                <img src="${eq.img}" onerror="this.src='https://via.placeholder.com/60/e4e4e7/09090b?text=DRONE'">
                <div class="equipment-title">${eq.name}</div>
                ${specsHtml}
                <div class="equipment-price">+₹${eq.rate}/day</div>
            `;
            
            if(isRecommended) {
                btn.style.borderColor = 'var(--primary)';
            }

            btn.addEventListener('click', () => {
                document.querySelectorAll('.equipment-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedEquipment = eq;
                updateSummary();
                validateTimeSlots(); // Re-check collisions if drone changes
            });
            grid.appendChild(btn);
        });
    }

    // --- LOGIC: DATE & TIME ---
    function initFlatpickr() {
        flatpickr("#datePicker", {
            minDate: "today",
            dateFormat: "Y-m-d",
            onChange: function(selectedDates, dateStr, instance) {
                selectedDate = dateStr;
                updateSummary();
                validateTimeSlots();
            }
        });
        
        dSelect.addEventListener('change', (e) => {
            selectedDuration = parseInt(e.target.value);
            updateSummary();
            validateTimeSlots();
        });

        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (btn.classList.contains('disabled')) return;
                document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedTime = btn.dataset.time;
                updateSummary();
            });
        });
    }

    // --- LOGIC: COLLISION AVOIDANCE (3 Units Available per Hardware Type) ---
    function validateTimeSlots() {
        if (!selectedEquipment || !selectedDate) return;
        
        const allBookings = JSON.parse(localStorage.getItem('dronehire_bookings')) || [];
        const warningEl = document.getElementById('availabilityWarning');
        warningEl.style.display = 'none';

        // Get dates required for this operation
        let requiredDates = [];
        let curDate = new Date(selectedDate);
        for (let i=0; i<selectedDuration; i++) {
            requiredDates.push(curDate.toISOString().split('T')[0]);
            curDate.setDate(curDate.getDate() + 1);
        }

        // We check hardware overlap. We assume 3 units max per hardware type.
        // For simplicity: If ANY date in requiredDates has >= 3 active operations for this exact hardware + time slot combo, we disable that timeslot.
        
        document.querySelectorAll('.time-btn').forEach(tBtn => {
            const timeVal = tBtn.dataset.time;
            let maxOverlap = 0;

            requiredDates.forEach(rDate => {
                let overlapCount = 0;
                allBookings.forEach(b => {
                    // Normalize saved dates to check overlap
                    if (b.equipment === selectedEquipment.name) {
                        // Very rough overlap detection: If the saved booking covers 'rDate' AND time matches
                        // (Usually duration in days applies for full day, but sticking to identical timeslot collision)
                        let bStartDate = new Date(b.date);
                        let bDates = [];
                        for(let d=0; d<b.duration; d++) {
                            bDates.push(new Date(bStartDate).toISOString().split('T')[0]);
                            bStartDate.setDate(bStartDate.getDate() + 1);
                        }
                        
                        if (bDates.includes(rDate) && (b.time === timeVal || b.time === 'Any')) {
                            overlapCount++;
                        }
                    }
                });
                if (overlapCount > maxOverlap) maxOverlap = overlapCount;
            });

            // If 3 or more units are deployed at that time over those days, hardware is exhausted.
            if (maxOverlap >= 3) {
                tBtn.classList.add('disabled');
                tBtn.classList.remove('selected');
                if (selectedTime === timeVal) {
                    selectedTime = ''; // deselect if disabled
                    updateSummary();
                    warningEl.style.display = 'block';
                }
            } else {
                tBtn.classList.remove('disabled');
            }
        });
    }

    // --- LOGIC: SUMMARY UPDATER ---
    function updateSummary() {
        document.getElementById('sumEquipment').textContent = selectedEquipment ? selectedEquipment.name : 'None';
        document.getElementById('sumDate').textContent = selectedDate || 'Not set';
        document.getElementById('sumTime').textContent = selectedTime || 'Not set';
        document.getElementById('sumDuration').textContent = `${selectedDuration} Day(s)`;

        // Price Calc
        const baseService = BASE_PRICES[selectedService] || 15000; // default 15k if custom
        const eqRate = selectedEquipment ? selectedEquipment.rate : 0;
        const total = (baseService + eqRate) * selectedDuration;

        document.getElementById('sumTotal').textContent = `₹${total.toLocaleString()}`;
    }

    // --- LOGIC: SUBMISSION ---
    document.getElementById('bookingForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const btnText = document.getElementById('btnText');
        const spinner = document.getElementById('btnSpinner');
        const confirmBtn = document.getElementById('confirmBtn');
        
        btnText.textContent = 'COMMUNICATING...';
        spinner.classList.remove('d-none');
        confirmBtn.disabled = true;

        setTimeout(() => {
            // Save to localStorage
            saveBooking();

            // UI
            document.getElementById('bookingProgress').style.display = 'none';
            document.getElementById('step3Panel').classList.remove('active');
            document.getElementById('successPanel').classList.add('active');
            document.getElementById('summaryBox').style.opacity = '0.5';

        }, 1200);
    });

    function saveBooking() {
        const refId = Math.random().toString(36).substr(2, 6).toUpperCase();
        document.getElementById('bookingRefID').textContent = refId;
        
        const newBooking = {
            id: refId,
            service: selectedService,
            equipment: selectedEquipment.name,
            totalCost: document.getElementById('sumTotal').textContent,
            date: selectedDate,
            time: selectedTime,
            duration: selectedDuration,
            clientName: document.getElementById('clientName').value,
            clientEmail: document.getElementById('clientEmail').value,
            clientPhone: document.getElementById('clientPhone').value,
            address: document.getElementById('clientAddress').value,
            timestamp: new Date().toISOString()
        };

        const existingBookings = JSON.parse(localStorage.getItem('dronehire_bookings')) || [];
        existingBookings.push(newBooking);
        localStorage.setItem('dronehire_bookings', JSON.stringify(existingBookings));

        // Setup PDF Download Link
        document.getElementById('downloadInvoiceBtn').onclick = () => generatePDF(newBooking);
    }

    // --- LOGIC: PDF INVOICE (jsPDF) ---
    function generatePDF(data) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.setFont("courier", "bold");
        doc.setFontSize(22);
        doc.text("DRONEHIRE_ LOG", 20, 20);
        
        doc.setFontSize(10);
        doc.setFont("courier", "normal");
        doc.text("AUTHORIZED MISSION INVOICE", 20, 28);
        doc.line(20, 32, 190, 32);

        doc.setFontSize(12);
        doc.text(`REF ID:      #${data.id}`, 20, 45);
        doc.text(`DATE:        ${data.date}`, 20, 52);
        doc.text(`CLIENT Node: ${data.clientName.toUpperCase()}`, 20, 59);
        
        doc.line(20, 70, 190, 70);
        
        doc.text("MANIFEST:", 20, 80);
        doc.text(`Operation:   ${data.service.toUpperCase()}`, 20, 90);
        doc.text(`Hardware:    ${data.equipment.toUpperCase()}`, 20, 97);
        doc.text(`Duration:    ${data.duration} Day(s)`, 20, 104);
        
        doc.line(20, 115, 190, 115);
        
        doc.setFontSize(16);
        doc.setFont("courier", "bold");
        doc.text(`TOTAL BILLED:  ${data.totalCost}`, 20, 130);
        
        doc.setFontSize(10);
        doc.setFont("courier", "normal");
        doc.text("All flight paths subject to DGCA constraints.", 20, 150);
        doc.text("Clearances are digitally verified.", 20, 155);

        doc.save(`DroneHire_Invoice_${data.id}.pdf`);
    }
});
