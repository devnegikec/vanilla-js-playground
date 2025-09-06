/**
 * Opens a modal with a smooth transition.
 * @param {HTMLElement} modal - The modal container element.
 * @param {HTMLElement} content - The content element inside the modal.
 */
export function openModal(modal, content) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setTimeout(() => {
        content.classList.remove('scale-95', 'opacity-0');
        content.classList.add('scale-100', 'opacity-100');
    }, 10);
}

/**
 * Closes a modal with a smooth transition.
 * @param {HTMLElement} modal - The modal container element.
 * @param {HTMLElement} content - The content element inside the modal.
 */
export function closeModal(modal, content) {
    content.classList.remove('scale-100', 'opacity-100');
    content.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }, 200);
}

/**
 * Displays a custom alert modal.
 * @param {string} title - The title of the alert.
 * @param {string} message - The message to display in the alert.
 */
export function showAlert(title, message) {
    const alertModal = document.getElementById('alertModal');
    const alertModalContent = document.getElementById('alertModalContent');
    document.getElementById('alertTitle').textContent = title;
    document.getElementById('alertMessage').textContent = message;
    openModal(alertModal, alertModalContent);
}

/**
 * Simplifies debts between group members to show the minimum number of transactions required.
 * @param {Map<string, number>} balances - A map of memberId to their balance.
 * @returns {Array<{from: string, to: string, amount: number}>} - An array of simplified debt objects.
 */
function simplifyDebts(balances) {
    const debtors = [];
    const creditors = [];

    // Separate members into debtors (negative balance) and creditors (positive balance)
    balances.forEach((amount, memberId) => {
        if (amount < -0.01) {
            debtors.push({ memberId, amount });
        } else if (amount > 0.01) {
            creditors.push({ memberId, amount });
        }
    });
    
    const debts = [];
    
    // Settle debts by matching debtors with creditors
    while (debtors.length > 0 && creditors.length > 0) {
        const debtor = debtors[0];
        const creditor = creditors[0];
        const amountToSettle = Math.min(-debtor.amount, creditor.amount);

        debts.push({
            from: debtor.memberId,
            to: creditor.memberId,
            amount: amountToSettle
        });

        debtor.amount += amountToSettle;
        creditor.amount -= amountToSettle;

        // Remove members who are settled up
        if (Math.abs(debtor.amount) < 0.01) {
            debtors.shift();
        }
        if (Math.abs(creditor.amount) < 0.01) {
            creditors.shift();
        }
    }
    return debts;
}

/**
 * Calculates the final balances from a list of expenses and triggers rendering.
 * @param {Array<Object>} expenses - The list of expense objects.
 * @param {Array<Object>} groupMembers - The list of members in the group.
 */
export function calculateAndRenderBalances(expenses, groupMembers) {
    const balances = new Map();
    groupMembers.forEach(member => balances.set(member.id, 0));

    expenses.forEach(expense => {
        // Credit the person who paid
        if (balances.has(expense.paidBy)) {
            balances.set(expense.paidBy, balances.get(expense.paidBy) + expense.amount);
        }
        
        // Debit the members included in the split
        expense.splits.forEach(split => {
            if (balances.has(split.memberId)) {
                balances.set(split.memberId, balances.get(split.memberId) - split.amount);
            }
        });
    });

    const simplifiedDebts = simplifyDebts(balances);
    renderBalances(simplifiedDebts, groupMembers);
}


/**
 * Renders the simplified balances to the UI.
 * @param {Array<Object>} debts - The array of simplified debt objects.
 * @param {Array<Object>} groupMembers - The list of members in the group.
 */
function renderBalances(debts, groupMembers) {
    const listEl = document.getElementById('balances-list');
    if (debts.length === 0) {
        listEl.innerHTML = `<div class="text-center text-slate-500 p-4 bg-white rounded-lg shadow-sm">Everyone is settled up!</div>`;
        return;
    }
    
    listEl.innerHTML = '';
    debts.forEach(debt => {
        const fromMember = groupMembers.find(m => m.id === debt.from);
        const toMember = groupMembers.find(m => m.id === debt.to);
        
        if (!fromMember || !toMember) return;
        
        const balanceEl = document.createElement('div');
        balanceEl.className = 'bg-white p-3 rounded-lg shadow-sm flex items-center justify-between';
        balanceEl.innerHTML = `
            <div class="flex items-center">
                 <div class="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold mr-3">${fromMember.name.charAt(0)}</div>
                <div>
                    <span class="font-semibold">${fromMember.name}</span>
                    <span class="text-sm text-slate-500"> owes </span>
                    <span class="font-semibold">${toMember.name}</span>
                </div>
            </div>
            <div class="font-bold text-red-500">$${debt.amount.toFixed(2)}</div>
        `;
        listEl.appendChild(balanceEl);
    });
}
