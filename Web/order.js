// ============================================
// ORDER PAGE - DISCORD WEBHOOK
// ============================================
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1467566032938860615/N3CpHUAP_d59bPlvZ6j4-lk1Tqld5GzRgEHKA_FZVx-Q1dZVV7lNCUYffXwD3gTCbgAf';

// ============================================
// STATE MANAGEMENT
// ============================================
let currentStep = 1;
let orderData = {
    botType: null,
    basePrice: 0,
    features: [],
    addons: [],
    specialRequests: '',
    customerInfo: {}
};

// ============================================
// STEP NAVIGATION
// ============================================
const steps = document.querySelectorAll('.step');
const stepContents = document.querySelectorAll('.step-content');
const stepLines = document.querySelectorAll('.step-line');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

function updateSteps() {
    // Update step indicators
    steps.forEach((step, index) => {
        const stepNum = index + 1;
        step.classList.remove('active', 'completed');
        
        if (stepNum < currentStep) {
            step.classList.add('completed');
        } else if (stepNum === currentStep) {
            step.classList.add('active');
        }
    });
    
    // Update step lines
    stepLines.forEach((line, index) => {
        if (index < currentStep - 1) {
            line.classList.add('completed');
        } else {
            line.classList.remove('completed');
        }
    });
    
    // Update content visibility
    stepContents.forEach((content, index) => {
        content.classList.remove('active');
        if (index + 1 === currentStep) {
            content.classList.add('active');
        }
    });
    
    // Update navigation buttons
    prevBtn.disabled = currentStep === 1;
    
    if (currentStep === 4) {
        nextBtn.style.display = 'none';
        updateOrderSummary();
    } else {
        nextBtn.style.display = 'flex';
    }
}

function nextStep() {
    // Validation
    if (currentStep === 1 && !orderData.botType) {
        alert('Please select a bot type to continue');
        return;
    }
    
    if (currentStep < 4) {
        currentStep++;
        updateSteps();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        updateSteps();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

nextBtn.addEventListener('click', nextStep);
prevBtn.addEventListener('click', prevStep);

// ============================================
// PRESET PLAN SELECTION
// ============================================
const presetPlanCards = document.querySelectorAll('.preset-plan-card');
const presetPrices = {
    'starter-plan': { base: 15, monthly: 5, name: 'Starter Bot' },
    'growth-plan': { base: 35, monthly: 10, name: 'Growth Bot' },
    'pro-plan': { base: 80, monthly: 20, name: 'Pro Bot' }
};

presetPlanCards.forEach(card => {
    card.addEventListener('click', () => {
        // Deselect all cards (both preset and custom)
        presetPlanCards.forEach(c => c.classList.remove('selected'));
        botTypeCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        
        const type = card.dataset.type;
        orderData.botType = type;
        orderData.basePrice = presetPrices[type].base;
        orderData.isPreset = true;
        orderData.presetName = presetPrices[type].name;
        orderData.monthlyPrice = presetPrices[type].monthly;
        
        updatePriceCalculator();
    });
});

// ============================================
// BOT TYPE SELECTION (Custom)
// ============================================
const botTypeCards = document.querySelectorAll('.bot-type-card');
const basePrices = {
    moderation: 25,
    music: 35,
    economy: 45,
    leveling: 30,
    ticket: 25,
    multipurpose: 80,
    giveaway: 20,
    custom: 0
};

botTypeCards.forEach(card => {
    card.addEventListener('click', () => {
        // Deselect all cards (both preset and custom)
        presetPlanCards.forEach(c => c.classList.remove('selected'));
        botTypeCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        
        const type = card.dataset.type;
        orderData.botType = type;
        orderData.basePrice = basePrices[type];
        orderData.isPreset = false;
        orderData.presetName = null;
        orderData.monthlyPrice = null;
        
        updatePriceCalculator();
    });
});

// ============================================
// FEATURE SELECTION
// ============================================
const featureCheckboxes = document.querySelectorAll('.feature-checkbox input');

featureCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        const feature = checkbox.value;
        const price = parseInt(checkbox.dataset.price);
        
        if (checkbox.checked) {
            orderData.features.push({ name: feature, price: price });
        } else {
            orderData.features = orderData.features.filter(f => f.name !== feature);
        }
        
        updatePriceCalculator();
        updateSelectAllButtons();
    });
});

// ============================================
// SELECT ALL BUTTONS
// ============================================
const selectAllBtns = document.querySelectorAll('.select-all-btn');

function updateSelectAllButtons() {
    selectAllBtns.forEach(btn => {
        const category = btn.closest('.feature-category');
        const checkboxes = category.querySelectorAll('input[type="checkbox"]');
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        
        if (allChecked && checkboxes.length > 0) {
            btn.textContent = 'Deselect All';
            btn.classList.add('deselect');
        } else {
            btn.textContent = 'Select All';
            btn.classList.remove('deselect');
        }
    });
}

selectAllBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const category = btn.closest('.feature-category');
        const checkboxes = category.querySelectorAll('input[type="checkbox"]');
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        
        checkboxes.forEach(checkbox => {
            const shouldCheck = !allChecked;
            
            if (checkbox.checked !== shouldCheck) {
                checkbox.checked = shouldCheck;
                
                const feature = checkbox.value;
                const price = parseInt(checkbox.dataset.price);
                
                if (shouldCheck) {
                    if (!orderData.features.find(f => f.name === feature)) {
                        orderData.features.push({ name: feature, price: price });
                    }
                } else {
                    orderData.features = orderData.features.filter(f => f.name !== feature);
                }
            }
        });
        
        updatePriceCalculator();
        updateSelectAllButtons();
    });
});

// ============================================
// ADDON SELECTION
// ============================================
const addonCards = document.querySelectorAll('.addon-card');

addonCards.forEach(card => {
    card.addEventListener('click', () => {
        card.classList.toggle('selected');
        
        const addon = card.dataset.addon;
        const price = parseInt(card.dataset.price);
        
        if (card.classList.contains('selected')) {
            orderData.addons.push({ name: addon, price: price });
        } else {
            orderData.addons = orderData.addons.filter(a => a.name !== addon);
        }
        
        updatePriceCalculator();
    });
});

// ============================================
// PRICE CALCULATOR
// ============================================
const calcItems = document.getElementById('calcItems');
const totalPriceEl = document.getElementById('totalPrice');
const basePriceEl = document.getElementById('basePrice');

function updatePriceCalculator() {
    let html = '';
    let total = 0;
    
    // Base price
    if (orderData.botType) {
        if (orderData.isPreset && orderData.presetName) {
            html += `<div class="calc-item"><span>${orderData.presetName}</span><span>€${orderData.basePrice}</span></div>`;
            html += `<div class="calc-item"><span>Monthly Fee</span><span>€${orderData.monthlyPrice}/mo</span></div>`;
        } else {
            const typeName = orderData.botType.charAt(0).toUpperCase() + orderData.botType.slice(1).replace('-', ' ');
            html += `<div class="calc-item"><span>${typeName} Bot</span><span>€${orderData.basePrice}</span></div>`;
        }
        total += orderData.basePrice;
    } else {
        html += `<div class="calc-item"><span>Base Price</span><span>€0</span></div>`;
    }
    
    // Features
    orderData.features.forEach(feature => {
        const name = feature.name.charAt(0).toUpperCase() + feature.name.slice(1);
        html += `<div class="calc-item"><span>${name}</span><span>+€${feature.price}</span></div>`;
        total += feature.price;
    });
    
    // Addons
    orderData.addons.forEach(addon => {
        const name = addon.name.charAt(0).toUpperCase() + addon.name.slice(1);
        const isMonthly = addon.name === 'hosting';
        html += `<div class="calc-item"><span>${name}</span><span>+€${addon.price}${isMonthly ? '/mo' : ''}</span></div>`;
        total += addon.price;
    });
    
    calcItems.innerHTML = html;
    totalPriceEl.textContent = '€' + total;
}

// ============================================
// ORDER SUMMARY
// ============================================
function updateOrderSummary() {
    // Bot type
    const botTypeEl = document.getElementById('summaryBotType');
    if (orderData.isPreset && orderData.presetName) {
        const monthlyText = orderData.monthlyPrice ? ' + €' + orderData.monthlyPrice + '/mo' : '';
        botTypeEl.innerHTML = '<strong style="color: var(--accent-cyan);">' + orderData.presetName + ' Plan</strong> (€' + orderData.basePrice + monthlyText + ')';
    } else if (orderData.botType) {
        botTypeEl.textContent = orderData.botType.charAt(0).toUpperCase() + orderData.botType.slice(1) + ' Bot (€' + orderData.basePrice + ')';
    } else {
        botTypeEl.textContent = 'Not selected';
    }
    
    // Features
    const featuresEl = document.getElementById('summaryFeatures');
    if (orderData.features.length > 0) {
        featuresEl.innerHTML = orderData.features.map(f => {
            const name = f.name.charAt(0).toUpperCase() + f.name.slice(1);
            return `<li>${name} (+€${f.price})</li>`;
        }).join('');
    } else {
        featuresEl.innerHTML = '<li style="opacity: 0.5;">No features selected</li>';
    }
    
    // Addons
    const addonsEl = document.getElementById('summaryAddons');
    if (orderData.addons.length > 0) {
        addonsEl.innerHTML = orderData.addons.map(a => {
            const name = a.name.charAt(0).toUpperCase() + a.name.slice(1);
            const isMonthly = a.name === 'hosting';
            return `<li>${name} (+€${a.price}${isMonthly ? '/mo' : ''})</li>`;
        }).join('');
    } else {
        addonsEl.innerHTML = '<li style="opacity: 0.5;">No add-ons selected</li>';
    }
    
    // Total
    let total = orderData.basePrice;
    orderData.features.forEach(f => total += f.price);
    orderData.addons.forEach(a => total += a.price);
    
    document.getElementById('summaryTotal').textContent = '€' + total;
}

// ============================================
// SPECIAL REQUESTS
// ============================================
const specialRequestsInput = document.getElementById('specialRequests');
if (specialRequestsInput) {
    specialRequestsInput.addEventListener('input', () => {
        orderData.specialRequests = specialRequestsInput.value;
    });
}

// ============================================
// SUBMIT ORDER
// ============================================
const submitBtn = document.getElementById('submitOrder');

submitBtn.addEventListener('click', async () => {
    // Get form values
    const discordUser = document.getElementById('discordUser').value.trim();
    const discordId = document.getElementById('discordId').value.trim();
    const serverInvite = document.getElementById('serverInvite').value.trim();
    const vcWilling = document.querySelector('input[name="vcWilling"]:checked')?.value || 'no';
    const ageCheck = document.getElementById('ageCheck').checked;
    
    // Validation
    if (!discordUser || !discordId || !serverInvite) {
        alert('Please fill in all required fields');
        return;
    }
    
    if (!ageCheck) {
        alert('You must confirm you are 17 years or older');
        return;
    }
    
    if (!orderData.botType) {
        alert('Please select a bot type');
        return;
    }
    
    // Disable button
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Submitting...</span>';
    
    // Calculate total
    let total = orderData.basePrice;
    orderData.features.forEach(f => total += f.price);
    orderData.addons.forEach(a => total += a.price);
    
    // Create embed
    const embed = {
        title: '🎉 New Bot Order from Configuration Studio!',
        color: 0x00ff88,
        fields: [
            {
                name: '👤 Discord User',
                value: discordUser,
                inline: true
            },
            {
                name: '🆔 User ID',
                value: discordId,
                inline: true
            },
            {
                name: '🔗 Server Invite',
                value: serverInvite,
                inline: true
            },
            {
                name: '🎙️ Willing to VC',
                value: vcWilling === 'yes' ? '✅ Yes' : '❌ No',
                inline: true
            },
            {
                name: '🤖 Bot Type',
                value: orderData.isPreset 
                    ? `**${orderData.presetName}** (€${orderData.basePrice} + €${orderData.monthlyPrice}/mo)`
                    : orderData.botType.charAt(0).toUpperCase() + orderData.botType.slice(1) + ` (€${orderData.basePrice})`,
                inline: true
            },
            {
                name: '💰 Total Price',
                value: orderData.isPreset 
                    ? `€${total} setup + €${orderData.monthlyPrice}/mo`
                    : `€${total}`,
                inline: true
            },
            {
                name: '⚡ Features',
                value: orderData.features.length > 0 
                    ? orderData.features.map(f => `• ${f.name} (+€${f.price})`).join('\n')
                    : 'None selected',
                inline: false
            },
            {
                name: '🎁 Add-ons',
                value: orderData.addons.length > 0
                    ? orderData.addons.map(a => `• ${a.name} (+€${a.price})`).join('\n')
                    : 'None selected',
                inline: false
            }
        ],
        timestamp: new Date().toISOString(),
        footer: {
            text: 'BotMaker Configuration Studio • dx_nzaaa will contact you'
        }
    };
    
    // Add special requests if any
    if (orderData.specialRequests) {
        embed.fields.push({
            name: '📝 Special Requests',
            value: orderData.specialRequests.substring(0, 1000),
            inline: false
        });
    }
    
    // Send to Discord
    try {
        if (DISCORD_WEBHOOK_URL !== 'YOUR_DISCORD_WEBHOOK_URL_HERE') {
            await fetch(DISCORD_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: 'BotMaker Orders',
                    avatar_url: 'https://i.imgur.com/AfFp7pu.png',
                    embeds: [embed]
                })
            });
        }
        
        // Show success
        showSuccess();
        
    } catch (error) {
        console.error('Error:', error);
        alert('There was an error submitting your order. Please try again.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg> Submit Order';
    }
});

function showSuccess() {
    const overlay = document.createElement('div');
    overlay.className = 'success-overlay';
    overlay.innerHTML = `
        <div class="success-content">
            <div class="success-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
            </div>
            <h2>Order Submitted!</h2>
            <p>We've received your order. <strong>dx_nzaaa</strong> will contact you on Discord soon!</p>
            <a href="index.html">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Back to Home
            </a>
        </div>
    `;
    document.body.appendChild(overlay);
}

// Initialize
updateSteps();
updatePriceCalculator();
