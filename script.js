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

    // Ajusta o texto da IA no passo 2 (Chat) com o equipamento escolhido
    if (step === 2) {
        document.getElementById('chatEquipName').textContent = state.equipment || 'dispositivo';
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

// ------ Lógica do Chat de Triagem da IA ------ //

function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if(!text) return;

    const chatMessages = document.getElementById('chatMessages');

    // Renderiza a Mensagem do Usuário
    chatMessages.innerHTML += `
        <div class="flex items-start gap-3 flex-row-reverse">
            <div class="w-8 h-8 rounded-lg bg-[#1E293B] flex items-center justify-center text-white font-bold text-[10px] shrink-0 border border-[#334155]">VOCÊ</div>
            <div class="bg-primaryBlue text-white text-sm p-3 rounded-2xl rounded-tr-none shadow-[0_0_10px_rgba(37,99,235,0.2)]">
                ${text}
            </div>
        </div>
    `;
    
    input.value = '';
    state.description = text; // Salva a descrição no estado global
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Simula a IA "pensando" e respondendo
    setTimeout(() => {
        chatMessages.innerHTML += `
            <div class="flex items-start gap-3 animate-[fadeIn_0.3s_ease-in-out]">
                <div class="w-8 h-8 rounded-lg bg-primaryBlue flex items-center justify-center text-white font-bold text-[10px] shrink-0 shadow-[0_0_10px_rgba(37,99,235,0.5)]">IA</div>
                <div class="bg-borderDark text-white text-sm p-3 rounded-2xl rounded-tl-none border border-primaryBlue/30">
                    <strong>Pré-diagnóstico concluído:</strong> Baseado no seu relato, já gerei um escopo técnico para o nosso atendimento. <br><br>
                    Você já pode <strong>Abrir o Chamado</strong> clicando no botão abaixo para que nossa equipe assuma o caso!
                </div>
            </div>
        `;
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Habilita o botão de abrir chamado
        const btn = document.getElementById('btnOpenTicket');
        btn.disabled = false;
        btn.classList.remove('opacity-50', 'cursor-not-allowed');
        btn.classList.add('btn-glow');
    }, 1500);
}

function handleChatEnter(e) {
    if(e.key === 'Enter') sendChatMessage();
}

async function submitTicket() {
    // Validação básica
    if (!state.equipment) {
        alert("Por favor, volte e selecione o tipo do seu equipamento no Passo 1.");
        return;
    }

    // Pega os dados digitados na tela de Login (Passo 0)
    const nome = document.getElementById('loginName').value || 'Usuário Padrão';
    const email = document.getElementById('loginEmail').value || 'usuario@email.com';
    const senha = document.getElementById('loginPassword').value || '123456';
    
    // Converte os serviços selecionados em um texto separado por vírgula
    const servicosStr = Array.from(state.services).join(', ');

    // Gera o protocolo do chamado
    const protocolo = '#JP-' + Math.floor(1000 + Math.random() * 9000);
    document.getElementById('ticketNumber').textContent = protocolo.replace('#JP-', '');

    // Monta o "pacote" de dados para enviar ao backend
    const ticketData = {
        nome: nome,
        email: email,
        senha: senha,
        equipamentoTipo: state.equipment,
        servicos: servicosStr || "Nenhum serviço extra",
        descricao: state.description || "Sem descrição",
        protocolo: protocolo
    };

    try {
        // Muda o texto do botão para dar feedback visual
        const btn = document.getElementById('btnOpenTicket');
        btn.disabled = true;
        btn.innerHTML = 'Salvando... <i class="fa-solid fa-spinner fa-spin"></i>';

        // ENVIA OS DADOS PARA A API DO NOSSO SERVIDOR
        const response = await fetch('/api/chamados', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(ticketData)
        });

        if (response.ok) {
            // Se o servidor confirmou que salvou no banco, vai para a tela de Sucesso
            goToStep(3);

            // Limpa o formulário após 1 segundo
            setTimeout(() => {
                document.getElementById('loginName').value = '';
                document.getElementById('loginEmail').value = '';
                document.getElementById('loginPassword').value = '';
                state.equipment = '';
                state.services.clear();
                state.description = '';
                
                document.querySelectorAll('.checkbox-custom').forEach(cb => cb.checked = false);
                document.querySelectorAll('.service-item.selected').forEach(el => el.classList.remove('selected'));
                document.querySelectorAll('.selectable-card.selected').forEach(el => el.classList.remove('selected'));
                
                // Reseta o Chat da IA
                document.getElementById('chatMessages').innerHTML = `
                    <div class="flex items-start gap-3">
                        <div class="w-8 h-8 rounded-lg bg-primaryBlue flex items-center justify-center text-white font-bold text-[10px] shrink-0 shadow-[0_0_10px_rgba(37,99,235,0.5)]">IA</div>
                        <div class="bg-borderDark text-white text-sm p-3 rounded-2xl rounded-tl-none border border-[#2d3748]">
                            Olá! Vi que você selecionou um(a) <strong id="chatEquipName" class="text-primaryBlue">Equipamento</strong>. Para eu criar um pré-diagnóstico para o técnico, por favor, me descreva detalhadamente o que está acontecendo.
                        </div>
                    </div>
                `;
                btn.disabled = true;
                btn.classList.add('opacity-50', 'cursor-not-allowed');
                btn.classList.remove('btn-glow');
                btn.innerHTML = 'Finalizar Triagem e Abrir Chamado <i class="fa-solid fa-check text-xs"></i>';
            }, 1000);
        } else {
            alert("Erro ao salvar o chamado no banco de dados.");
            btn.innerHTML = 'Finalizar Triagem e Abrir Chamado <i class="fa-solid fa-check text-xs"></i>';
            btn.disabled = false;
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
        alert("Erro de conexão com o servidor. Verifique se o backend está rodando.");
    }
}