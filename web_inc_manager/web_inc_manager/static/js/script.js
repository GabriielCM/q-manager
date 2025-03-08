// ===== Funções para manipulação de CRM =====
function openCRMLink(item, token) {
    if (!token) {
        showToast('Token CRM não disponível', 'danger');
        return;
    }
    
    const baseUrlElement = document.getElementById('crm-base-url');
    if (!baseUrlElement) {
        showToast('Configuração do CRM não disponível', 'danger');
        return;
    }
    
    const baseUrl = baseUrlElement.dataset.url;
    const encodedItem = encodeURIComponent(item);
    const link = `${baseUrl}&token=${token}&cod_item=${encodedItem}&filter_cod=${item.toLowerCase()}`;
    window.open(link, '_blank');
}

// ===== Funções para a rotina de inspeção =====
function saveScrollPosition() {
    const scrollPosition = window.scrollY || window.pageYOffset;
    
    // Armazena em localStorage para persistência entre requisições
    localStorage.setItem('inspecao_scroll_position', scrollPosition);
    
    // Atualiza todos os campos de posição de rolagem na página
    document.querySelectorAll('input[name="scroll_position"]').forEach(input => {
        input.value = scrollPosition;
    });
    
    return scrollPosition;
}

function saveAndSubmit(form, action, ar, index) {
    // Salva a posição de rolagem atual
    const scrollPosition = window.scrollY || window.pageYOffset;
    
    // Armazena em localStorage para persistência entre requisições
    localStorage.setItem('inspecao_scroll_position', scrollPosition);
    
    // Atualiza o campo hidden no formulário
    form.querySelector('.scroll-position-input').value = scrollPosition;
    
    // Permite que o formulário seja enviado
    return true;
}

function restoreScrollPosition() {
    // Tenta obter do localStorage primeiro (mais confiável)
    let scrollPosition = localStorage.getItem('inspecao_scroll_position');
    
    // Se não estiver no localStorage, tenta obter do campo hidden ou da URL
    if (!scrollPosition) {
        const storedElement = document.getElementById('stored_scroll_position');
        if (storedElement) {
            scrollPosition = storedElement.value;
        }
    }
    
    // Se encontrou uma posição, rola para ela com um pequeno atraso para garantir
    // que todos os elementos da página estejam carregados
    if (scrollPosition && scrollPosition !== '0') {
        setTimeout(() => {
            window.scrollTo({
                top: parseInt(scrollPosition),
                behavior: 'auto' // Usa 'auto' em vez de 'smooth' para evitar animação visível
            });
        }, 100);
    }
}

function updateSaveButton() {
    const statusCells = document.querySelectorAll('.status-cell');
    let allProcessed = true;
    let totalProcessed = 0;
    let total = statusCells.length;
    
    statusCells.forEach(cell => {
        const inspecionado = cell.getAttribute('data-inspecionado') === 'true';
        const adiado = cell.getAttribute('data-adiado') === 'true';
        if (!inspecionado && !adiado) {
            allProcessed = false;
        } else {
            totalProcessed++;
        }
    });
    
    const saveButton = document.getElementById('saveButton');
    if (saveButton) {
        saveButton.disabled = !allProcessed;
        
        // Adiciona um contador de progresso
        if (total > 0) {
            const progressPercent = Math.round((totalProcessed / total) * 100);
            const progressBadge = document.createElement('span');
            progressBadge.className = 'badge bg-info ms-2';
            progressBadge.textContent = `${progressPercent}% (${totalProcessed}/${total})`;
            
            // Remove badge anterior se existir
            const existingBadge = saveButton.querySelector('.badge');
            if (existingBadge) {
                existingBadge.remove();
            }
            
            // Adiciona nova badge apenas se não estiver 100% completo
            if (progressPercent < 100) {
                saveButton.appendChild(progressBadge);
            }
        }
    }
}

// ===== Toggle da Sidebar =====
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
}

// ===== Notificações Toast =====
function showToast(message, type = 'info') {
    // Verifica se o container existe
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    
    // Gera um ID único para o toast
    const toastId = 'toast-' + Date.now();
    
    // Determina o ícone com base no tipo
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'warning') icon = 'exclamation-triangle';
    if (type === 'danger') icon = 'exclamation-circle';
    
    // Cria o HTML do toast
    const toast = `
        <div id="${toastId}" class="toast align-items-center text-white bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas fa-${icon} me-2"></i> ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;
    
    // Adiciona o toast ao container
    toastContainer.innerHTML += toast;
    
    // Inicializa e mostra o toast usando o Bootstrap
    const toastElement = document.getElementById(toastId);
    if (typeof bootstrap !== 'undefined') {
        const bsToast = new bootstrap.Toast(toastElement, {
            autohide: true,
            delay: 5000
        });
        bsToast.show();
    } else {
        // Fallback para navegadores sem Bootstrap
        toastElement.style.display = 'block';
        setTimeout(() => {
            toastElement.remove();
        }, 5000);
    }
    
    // Remove automaticamente após exibição
    toastElement.addEventListener('hidden.bs.toast', function () {
        toastElement.remove();
    });
}

// ===== Formatadores de dados =====
function formatDate(dateString) {
    if (!dateString) return '';
    
    // Verifica se está no formato DD-MM-YYYY
    if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
        const [day, month, year] = dateString.split('-');
        return `${day}/${month}/${year}`;
    }
    
    // Verifica se está no formato YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    }
    
    return dateString;
}

// ===== Animações e efeitos visuais =====
function addHoverEffects() {
    // Efeito de hover em imagens
    document.querySelectorAll('.image-container img').forEach(img => {
        img.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
            this.style.transition = 'transform 0.3s ease';
            this.style.zIndex = '1';
            this.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
        });
        
        img.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.zIndex = '0';
            this.style.boxShadow = 'none';
        });
    });
    
    // Efeito de hover em cards
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
            this.style.transition = 'box-shadow 0.3s ease';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
        });
    });
}

// ===== Validações de formulários =====
function validateDateRange(startEl, endEl) {
    if (!startEl || !endEl) return;
    
    endEl.addEventListener('change', function() {
        if (startEl.value && endEl.value) {
            if (new Date(endEl.value) < new Date(startEl.value)) {
                showToast('A data final não pode ser menor que a data inicial!', 'danger');
                endEl.value = '';
            }
        }
    });
}

// ===== Funções gerais da interface =====
document.addEventListener('DOMContentLoaded', function() {
    // Inicialização de elementos especiais
    const toggleNightMode = document.getElementById('toggleNightMode');
    if (toggleNightMode) {
        toggleNightMode.addEventListener('click', function() {
            document.body.classList.toggle('night-mode');
            
            // Alterna o ícone
            const icon = this.querySelector('i');
            if (icon) {
                if (document.body.classList.contains('night-mode')) {
                    icon.className = 'fas fa-sun';
                    this.classList.remove('btn-outline-light');
                    this.classList.add('btn-outline-warning');
                } else {
                    icon.className = 'fas fa-moon';
                    this.classList.remove('btn-outline-warning');
                    this.classList.add('btn-outline-light');
                }
            }
            
            // Atualiza a aparência do rodapé no modo noturno
            const footer = document.querySelector('.footer');
            if (footer) {
                if (document.body.classList.contains('night-mode')) {
                    footer.style.background = '#1a2530';
                } else {
                    footer.style.background = '';
                }
            }
            
            // Opcional: salvar preferência em localStorage
            if (document.body.classList.contains('night-mode')) {
                localStorage.setItem('nightMode', 'true');
            } else {
                localStorage.setItem('nightMode', 'false');
            }
        });
        
        // Carregar preferência salva, se houver
        if (localStorage.getItem('nightMode') === 'true') {
            document.body.classList.add('night-mode');
            const icon = toggleNightMode.querySelector('i');
            if (icon) {
                icon.className = 'fas fa-sun';
                toggleNightMode.classList.remove('btn-outline-light');
                toggleNightMode.classList.add('btn-outline-warning');
            }
            const footer = document.querySelector('.footer');
            if (footer) {
                footer.style.background = '#1a2530';
            }
        }
    }
    
    // Toggle da sidebar
    const sidebarCollapse = document.getElementById('sidebarCollapse');
    if (sidebarCollapse) {
        sidebarCollapse.addEventListener('click', toggleSidebar);
    }
    
    // Preenche todos os inputs de posição de rolagem com o valor atual
    document.querySelectorAll('.scroll-position-input').forEach(input => {
        input.value = window.scrollY || window.pageYOffset;
    });
    
    // Restaura a posição de rolagem em páginas relevantes
    if (document.getElementById('stored_scroll_position')) {
        restoreScrollPosition();
    }
    
    // Formatadores de dados
    document.querySelectorAll('.format-date').forEach(function(element) {
        const date = element.textContent.trim();
        if (date) {
            element.title = formatDate(date);
        }
    });
    
    // Inicializar tooltips Bootstrap, se disponível
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
    
    // Verificar botões de salvar para rotinas de inspeção
    updateSaveButton();
    
    // Auto-esconder alertas após 5 segundos
    document.querySelectorAll('.alert:not(.alert-permanent)').forEach(function(alert) {
        setTimeout(function() {
            const closeButton = alert.querySelector('.btn-close');
            if (closeButton) {
                closeButton.click();
            }
        }, 5000);
    });
    
    // Adicionar efeitos visuais
    addHoverEffects();
    
    // Validação de campos de data
    const startDateField = document.getElementById('start_date');
    const endDateField = document.getElementById('end_date');
    if (startDateField && endDateField) {
        validateDateRange(startDateField, endDateField);
    }
    
    // Destacar visualmente os status nas tabelas de inspeção
    document.querySelectorAll('.status-cell').forEach(cell => {
        const inspecionado = cell.getAttribute('data-inspecionado') === 'true';
        const adiado = cell.getAttribute('data-adiado') === 'true';
        
        if (inspecionado) {
            cell.parentElement.classList.add('table-success');
        } else if (adiado) {
            cell.parentElement.classList.add('table-warning');
        }
    });
    
    // Animações para elementos que aparecem na página
    document.querySelectorAll('.animated').forEach(function(el) {
        el.style.opacity = 0;
        setTimeout(function() {
            el.style.transition = 'opacity 0.5s ease';
            el.style.opacity = 1;
        }, 300);
    });
    
    // Ajustar padding do conteúdo em relação ao rodapé fixo
    const footer = document.querySelector('.footer');
    const contentBody = document.querySelector('.content-body');
    if (footer && contentBody) {
        contentBody.style.paddingBottom = (footer.offsetHeight + 20) + 'px';
    }
});
 //git remote set-url origin https://github.com/GabriielCM/q-manager