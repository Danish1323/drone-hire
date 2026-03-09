document.addEventListener('DOMContentLoaded', () => {
    const pincodeInput = document.getElementById('pincodeInput');
    const verifyZoneBtn = document.getElementById('verifyZoneBtn');
    
    const resultIndicator = document.getElementById('resultIndicator');
    const resultStatus = document.getElementById('resultStatus');
    const resultMsg = document.getElementById('resultMsg');
    const zoneResult = document.getElementById('zoneResult');

    // MOCK PIN CODE / ZIP CODE DATA (For demo purposes)
    // Red: Restricted, Yellow: Controlled, Green: Free Fly
    const zoneData = {
        '400001': 'red',   // South Mumbai (Naval Base / Govt)
        '110001': 'red',   // New Delhi (Parliament)
        '411001': 'yellow', // Pune (Airport proximity)
        '560001': 'yellow', // Bangalore Central
        '403001': 'green', // Goa (Panjim)
        '171001': 'green', // Shimla
        '10001': 'red',    // NYC example
        '90210': 'yellow', // Beverly Hills example
        '33101': 'green',  // Miami example
        'default': 'green' // Assume green if not explicitly red/yellow
    };

    const zoneDetails = {
        'red': {
            status: 'RESTRICTED (RED)',
            msg: 'Flight is PROHIBITED. This PIN lies in a Red Zone due to critical infrastructure or government facilities. Deployment denied.',
            color: 'var(--danger)'
        },
        'yellow': {
            status: 'CONTROLLED (YELLOW)',
            msg: 'ATC clearance required. This area is under controlled airspace. Provide authorization ID during deployment.',
            color: '#EAB308'
        },
        'green': {
            status: 'UNRESTRICTED (GREEN)',
            msg: 'Airspace is clear up to 400ft. Standard visual line-of-sight (VLOS) regulations apply. Cleared for flight.',
            color: 'var(--success)'
        }
    };

    function simulateScan() {
        const pin = pincodeInput.value.trim();
        
        // Show the result container
        zoneResult.style.display = 'block';

        if (!pin || pin.length < 5) {
            resultIndicator.style.background = 'transparent';
            resultStatus.textContent = 'ERROR';
            resultStatus.style.color = 'var(--danger)';
            resultMsg.textContent = 'Invalid ZIP/PIN format. Enter a valid code.';
            return;
        }

        // Simulate radar scan UI
        verifyZoneBtn.innerHTML = 'SCANNING... <span class="spinner-border spinner-border-sm ms-2"></span>';
        verifyZoneBtn.disabled = true;
        resultIndicator.style.background = 'var(--text-muted)';
        resultStatus.textContent = 'ANALYZING...';
        resultStatus.style.color = 'var(--text-main)';
        resultMsg.textContent = `Triangulating airspace data for PIN: ${pin}...`;

        setTimeout(() => {
            // Restore button
            verifyZoneBtn.innerHTML = 'EXECUTE SCAN <i class="bi bi-radar ms-2"></i>';
            verifyZoneBtn.disabled = false;

            // Determine zone
            let zoneType = zoneData[pin];
            if (!zoneType) {
                // Pseudo-random deterministic fallback based on last digit
                const lastDigit = parseInt(pin.slice(-1));
                if (lastDigit <= 2) zoneType = 'red';
                else if (lastDigit <= 5) zoneType = 'yellow';
                else zoneType = 'green';
            }

            const details = zoneDetails[zoneType];

            // Update UI
            resultIndicator.style.background = details.color;
            resultStatus.textContent = details.status;
            resultStatus.style.color = details.color;
            resultMsg.textContent = details.msg;
            
        }, 800);
    }

    verifyZoneBtn.addEventListener('click', simulateScan);

    pincodeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            simulateScan();
        }
    });
});
