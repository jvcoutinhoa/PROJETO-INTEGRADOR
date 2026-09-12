// State
const state = {
    currentStep: 0,
    equipment: '',
    services: new Set(),
    description: ''
};

// Available Services Data
const availableServices = [
    "Montagem completa", "Formatação com Backup",
    "Formatação sem Backup", "Limpeza Básica",
    "Limpeza Média", "Limpeza Avançada",
    "Organização de cabos", "Reparo de componentes",
    "Troca de peças", "Instalação de Kit Upgrade"
];

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    renderServices();
    setupTextareaListener();
    updateProgressHeader(0);
});

function goToStep(step) {
    // Hide all steps
    document.querySelectorAll('.step-container').forEach(el => {
        el.classList.remove('active');
    });
    
    // Show target step
    document.getElementById(`step${step}`).classList.add('active');
    state.currentStep = step;

    // Handle Header Visibility
    const header = document.getElementById('mainHeader');
    if (step === 0 || step === 3) {
        header.classList.add('hidden');
    } else {
        header.classList.remove('hidden');
    }

    updateProgressHeader(step);

    // Pre-fill summary if going to step 2
    if (step === 2) {
        updateSummary();
    }
}

function updateProgressHeader(step) {
    if(step === 0 || step === 3) return;

    const ind1 = document.getElementById('step1Indicator');
    const ind2 = document.getElementById('step2Indicator');
    const ind3 = document.getElementById('step3Indicator');
    const fill = document.getElementById('progressFill');

    // Reset styles
    [ind1, ind2, ind3].forEach(el => {
        el.className = 'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium z-10 transition-colors duration-300';
    });

    if (step === 1) {
        // Done 1
        ind1.classList.add('bg-primaryBlue', 'text-white', 'shadow-[0_0_10px_rgba(37,99,235,0.5)]');
        ind1.innerHTML = '<i class="fa-solid fa-check text-xs"></i>';
        
        // Current 2
        ind2.classList.add('bg-primaryBlue', 'text-white');
        ind2.innerHTML = '2';
        
        ind3.classList.add('bg-cardDark', 'border', 'border-borderDark', 'text-textSecondary');
        ind3.innerHTML = '3';
        
        fill.style.width = '50%';
    } else if (step === 2) {
        // Done 1 & 2
        ind1.classList.add('bg-primaryBlue', 'text-white');
        ind1.innerHTML = '<i class="fa-solid fa-check text-xs"></i>';
        
        ind2.classList.add('bg-primaryBlue', 'text-white');
        ind2.innerHTML = '<i class="fa-solid fa-check text-xs"></i>';
        
        // Current 3
        ind3.classList.add('bg-primaryBlue', 'text-white');
        ind3.innerHTML = '3';
        
        fill.style.width = '100%';
    }
}

function selectEquipment(name, element) {
    state.equipment = name;
    
    // Remove selected class from all
    document.querySelectorAll('#step1 .selectable-card').forEach(el => {
        el.classList.remove('selected');
    });
    
    // Add to clicked
    element.classList.add('selected');
}

function toggleService(service, checkboxId, containerId) {
    const checkbox = document.getElementById(checkboxId);
    const container = document.getElementById(containerId);
    
    // Toggle checkbox state if clicked on container
    if(event.target.tagName !== 'INPUT') {
         checkbox.checked = !checkbox.checked;
    }

    if (checkbox.checked) {
        state.services.add(service);
        container.classList.add('selected');
    } else {
        state.services.delete(service);
        container.classList.remove('selected');
    }
}

function renderServices() {
    const grid = document.getElementById('servicesGrid');
    grid.innerHTML = '';
    
    availableServices.forEach((service, index) => {
        const id = `service_${index}`;
        const containerId = `container_${index}`;
        
        const div = document.createElement('div');
        div.id = containerId;
        div.className = 'service-item border border-borderDark rounded-xl p-3 flex items-center gap-3';
        div.onclick = (e) => toggleService(service, id, containerId);
        
        div.innerHTML = `
            <input type="checkbox" id="${id}" class="checkbox-custom" onclick="event.stopPropagation(); toggleService('${service}', '${id}', '${containerId}')">
            <label for="${id}" class="text-sm text-textSecondary cursor-pointer flex-1 select-none pointer-events-none">${service}</label>
        `;
        grid.appendChild(div);
    });
}

function updateSummary() {
    // Update Equipment
    const equipText = document.getElementById('summaryEquipText');
    const equipIcon = document.getElementById('summaryEquipIcon');
    
    if (state.equipment) {
        equipText.textContent = state.equipment;
        equipText.classList.remove('text-textSecondary', 'italic');
        
        // Set icon based on selection roughly
        equipIcon.className = 'fa-solid text-textSecondary ' + 
            (state.equipment.includes('Notebook') ? 'fa-laptop' : 
             state.equipment.includes('Gamer') ? 'fa-gamepad' : 
             state.equipment.includes('All-in') ? 'fa-display' : 'fa-desktop');
    } else {
        equipText.textContent = "Nenhum equipamento selecionado";
        equipText.classList.add('text-textSecondary', 'italic');
        equipIcon.className = 'fa-solid fa-circle-question text-textSecondary';
    }

    // Update Services
    const servicesList = document.getElementById('summaryServicesList');
    const noMsg = document.getElementById('noServicesMsg');
    
    // Clear current badges except the noMsg
    Array.from(servicesList.children).forEach(child => {
        if(child.id !== 'noServicesMsg') child.remove();
    });

    if (state.services.size > 0) {
        noMsg.style.display = 'none';
        state.services.forEach(service => {
            const badge = document.createElement('span');
            badge.className = 'bg-[rgba(37,99,235,0.1)] border border-primaryBlue/30 text-primaryBlue text-xs font-medium px-3 py-1.5 rounded-full';
            badge.textContent = service;
            servicesList.appendChild(badge);
        });
    } else {
        noMsg.style.display = 'block';
    }
}

function setupTextareaListener() {
    const textarea = document.getElementById('problemDescription');
    const charCount = document.getElementById('charCount');
    
    textarea.addEventListener('input', function() {
        state.description = this.value;
        charCount.textContent = `${this.value.length} caracteres`;
    });
}

function submitTicket() {
    // Basic validation
    if (!state.equipment) {
        // Highlight missing equipment visually
        document.getElementById('summaryEquipText').style.color = '#ef4444';
        setTimeout(() => document.getElementById('summaryEquipText').style.color = '', 2000);
        return;
    }

    // Generate random ticket number
    const ticketNum = Math.floor(1000 + Math.random() * 9000);
    document.getElementById('ticketNumber').textContent = ticketNum;
    
    goToStep(3);

    // Reset form fields after submission
    setTimeout(() => {
        document.getElementById('loginName').value = '';
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
        state.equipment = '';
        state.services.clear();
        state.description = '';
        document.getElementById('problemDescription').value = '';
        document.getElementById('charCount').textContent = '0 caracteres';
        
        // Uncheck all services
        document.querySelectorAll('.checkbox-custom').forEach(cb => cb.checked = false);
        document.querySelectorAll('.service-item.selected').forEach(el => el.classList.remove('selected'));
        document.querySelectorAll('.selectable-card.selected').forEach(el => el.classList.remove('selected'));
    }, 1000);
}