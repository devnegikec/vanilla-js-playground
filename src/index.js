// --- Firebase SDK Imports ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, onSnapshot, collection, addDoc, serverTimestamp, query, where } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- Utility Imports ---
import { openModal, closeModal, showAlert, calculateAndRenderBalances } from './utils.js';

// --- Firebase Config and Initialization ---
// These global variables are provided by the environment.
const appId = typeof __app_id !== 'undefined' ? __app_id : 'splitwise-clone-default';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// --- Global State ---
let app, auth, db, userId;
let currentGroupId = null;
let groupsUnsubscribe = null;
let expensesUnsubscribe = null;
let groupMembers = [];

// --- DOM Elements ---
const createGroupBtn = document.getElementById('createGroupBtn');
const createGroupModal = document.getElementById('createGroupModal');
const createGroupModalContent = document.getElementById('createGroupModalContent');
const cancelCreateGroup = document.getElementById('cancelCreateGroup');
const createGroupForm = document.getElementById('createGroupForm');
const groupList = document.getElementById('group-list');
const welcomeView = document.getElementById('welcome-view');
const groupView = document.getElementById('group-view');
const addExpenseBtn = document.getElementById('addExpenseBtn');
const addExpenseModal = document.getElementById('addExpenseModal');
const addExpenseModalContent = document.getElementById('addExpenseModalContent');
const cancelAddExpense = document.getElementById('cancelAddExpense');
const addExpenseForm = document.getElementById('addExpenseForm');
const alertModal = document.getElementById('alertModal');
const alertModalContent = document.getElementById('alertModalContent');

// --- Main Application Logic ---
async function main() {
    try {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);
        
        document.getElementById('auth-status').textContent = 'Authenticating...';
        
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                userId = user.uid;
                document.getElementById('userIdDisplay').textContent = userId;
                document.getElementById('auth-status').textContent = 'Online';
                document.getElementById('auth-status').classList.add('text-emerald-500');
                listenForGroups();
            } else {
                document.getElementById('auth-status').textContent = 'Offline';
                document.getElementById('auth-status').classList.remove('text-emerald-500');
            }
        });

        if (initialAuthToken) {
            await signInWithCustomToken(auth, initialAuthToken);
        } else {
            await signInAnonymously(auth);
        }

    } catch (error) {
        console.error("Firebase initialization failed:", error);
        showAlert("Initialization Error", "Could not connect to the database. Please refresh the page.");
    }
}

// --- Group Management ---
function listenForGroups() {
    if (groupsUnsubscribe) groupsUnsubscribe();
    
    const groupsRef = collection(db, `artifacts/${appId}/public/data/groups`);
    const q = query(groupsRef, where("memberIds", "array-contains", userId));
    
    groupsUnsubscribe = onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
            groupList.innerHTML = `<div class="text-center text-slate-500">No groups yet.</div>`;
            return;
        }
        
        groupList.innerHTML = '';
        snapshot.forEach(doc => {
            const group = doc.data();
            const groupElement = document.createElement('a');
            groupElement.href = '#';
            groupElement.className = `block p-3 rounded-lg transition-colors ${doc.id === currentGroupId ? 'bg-emerald-100 text-emerald-800 font-semibold' : 'hover:bg-slate-100'}`;
            groupElement.dataset.groupId = doc.id;
            groupElement.innerHTML = `
                <div class="flex items-center">
                    <div class="w-8 h-8 rounded-full bg-emerald-200 text-emerald-700 flex items-center justify-center font-bold mr-3">${group.name.charAt(0)}</div>
                    <span>${group.name}</span>
                </div>
            `;
            groupElement.addEventListener('click', (e) => {
                e.preventDefault();
                selectGroup(doc.id);
            });
            groupList.appendChild(groupElement);
        });
    }, (error) => {
        console.error("Error listening for groups:", error);
        showAlert("Error", "Could not fetch your groups.");
    });
}

async function selectGroup(groupId) {
    currentGroupId = groupId;
    
    // Update sidebar UI
    document.querySelectorAll('#group-list a').forEach(el => {
        el.classList.toggle('bg-emerald-100', el.dataset.groupId === groupId);
        el.classList.toggle('text-emerald-800', el.dataset.groupId === groupId);
        el.classList.toggle('font-semibold', el.dataset.groupId === groupId);
    });
    
    // Fetch group details
    const groupDocRef = doc(db, `artifacts/${appId}/public/data/groups`, groupId);
    const groupSnap = await getDoc(groupDocRef);
    
    if (groupSnap.exists()) {
        const groupData = groupSnap.data();
        groupMembers = groupData.members; // Store members with id and name
        
        document.getElementById('group-name-header').textContent = groupData.name;
        const memberNames = groupMembers.map(m => m.name).join(', ');
        document.getElementById('group-members-header').textContent = `Members: ${memberNames}`;
        
        welcomeView.classList.add('hidden');
        groupView.classList.remove('hidden');
        
        listenForExpenses();
    } else {
        console.error("Selected group not found");
        showAlert("Error", "The selected group could not be found.");
        currentGroupId = null;
        welcomeView.classList.remove('hidden');
        groupView.classList.add('hidden');
    }
}

function addMemberField(value = '') {
    const container = document.getElementById('groupMembersContainer');
    const div = document.createElement('div');
    div.className = 'flex items-center space-x-2';
    div.innerHTML = `
        <input type="text" placeholder="User ID" value="${value}" class="member-id w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" required>
        <input type="text" placeholder="Display Name" class="member-name w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" required>
        <button type="button" class="remove-member-btn text-slate-400 hover:text-red-500">&times;</button>
    `;
    container.appendChild(div);
    div.querySelector('.remove-member-btn').addEventListener('click', () => div.remove());
}

// --- Expense Management ---
function listenForExpenses() {
    if (expensesUnsubscribe) expensesUnsubscribe();
    
    const expensesRef = collection(db, `artifacts/${appId}/public/data/groups/${currentGroupId}/expenses`);
    expensesUnsubscribe = onSnapshot(expensesRef, (snapshot) => {
        const expenses = [];
        snapshot.forEach(doc => {
            expenses.push({ id: doc.id, ...doc.data() });
        });
        // Sort by newest first
        expenses.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
        renderExpenses(expenses);
        calculateAndRenderBalances(expenses, groupMembers);
    }, (error) => {
        console.error("Error listening for expenses:", error);
        showAlert("Error", "Could not fetch expenses for this group.");
    });
}

function renderExpenses(expenses) {
    const listEl = document.getElementById('expenses-list');
    if (expenses.length === 0) {
        listEl.innerHTML = `<div class="text-center text-slate-500 p-4 bg-white rounded-lg shadow-sm">No expenses yet.</div>`;
        return;
    }
    
    listEl.innerHTML = '';
    expenses.forEach(expense => {
        const paidByMember = groupMembers.find(m => m.id === expense.paidBy);
        const date = expense.createdAt ? new Date(expense.createdAt.seconds * 1000) : new Date();
        const formattedDate = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

        const expenseEl = document.createElement('div');
        expenseEl.className = 'bg-white p-4 rounded-lg shadow-sm flex items-center';
        expenseEl.innerHTML = `
            <div class="mr-4 text-center w-12">
                <div class="text-xs text-slate-500">${formattedDate.split(' ')[0]}</div>
                <div class="font-bold text-lg">${formattedDate.split(' ')[1]}</div>
            </div>
            <div class="flex-1">
                <p class="font-semibold">${expense.description}</p>
                <p class="text-sm text-slate-500">${paidByMember ? paidByMember.name : 'Unknown'} paid</p>
            </div>
            <div class="text-right">
                <p class="font-bold text-xl text-slate-700">$${expense.amount.toFixed(2)}</p>
            </div>
        `;
        listEl.appendChild(expenseEl);
    });
}

function updateSplitDetails() {
    const splitType = document.getElementById('splitType').value;
    const container = document.getElementById('splitDetailsContainer');
    const totalAmount = parseFloat(document.getElementById('expenseAmount').value) || 0;
    container.innerHTML = '';

    if (splitType === 'equally') {
        const share = totalAmount > 0 && groupMembers.length > 0 ? (totalAmount / groupMembers.length).toFixed(2) : '0.00';
        container.innerHTML = `<p class="text-sm text-slate-500">Split equally among all ${groupMembers.length} members ($${share} each).</p>`;
    } else if (splitType === 'exact') {
        groupMembers.forEach(member => {
            const div = document.createElement('div');
            div.className = 'flex items-center justify-between';
            div.innerHTML = `
                <label for="split-${member.id}" class="text-sm">${member.name}</label>
                <input type="number" id="split-${member.id}" data-member-id="${member.id}" class="exact-split-amount w-1/3 px-2 py-1 border border-slate-300 rounded-md text-right" min="0" step="0.01" placeholder="0.00">
            `;
            container.appendChild(div);
        });
        container.insertAdjacentHTML('beforeend', `<p id="exact-split-total" class="text-sm text-right mt-2 font-semibold">Total: 0.00 / ${totalAmount.toFixed(2)}</p>`);
        
        container.querySelectorAll('.exact-split-amount').forEach(input => {
            input.addEventListener('input', () => {
                let currentTotal = 0;
                container.querySelectorAll('.exact-split-amount').forEach(i => {
                    currentTotal += parseFloat(i.value) || 0;
                });
                const totalEl = document.getElementById('exact-split-total');
                totalEl.textContent = `Total: ${currentTotal.toFixed(2)} / ${totalAmount.toFixed(2)}`;
                totalEl.classList.toggle('text-red-500', currentTotal.toFixed(2) !== totalAmount.toFixed(2));
            });
        });
    }
}

// --- Event Listeners ---
createGroupBtn.addEventListener('click', () => {
    const container = document.getElementById('groupMembersContainer');
    container.innerHTML = ''; // Clear previous fields
    addMemberField(userId); // Add current user by default
    addMemberField(); // Add one empty field
    openModal(createGroupModal, createGroupModalContent);
});

cancelCreateGroup.addEventListener('click', () => closeModal(createGroupModal, createGroupModalContent));
document.getElementById('addMemberFieldBtn').addEventListener('click', () => addMemberField());

createGroupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const groupName = document.getElementById('groupName').value.trim();
    const memberIdInputs = document.querySelectorAll('.member-id');
    const memberNameInputs = document.querySelectorAll('.member-name');
    
    const members = [];
    const memberIds = new Set();

    for(let i = 0; i < memberIdInputs.length; i++) {
        const id = memberIdInputs[i].value.trim();
        const name = memberNameInputs[i].value.trim();
        if (id && name && !memberIds.has(id)) {
            members.push({ id, name });
            memberIds.add(id);
        }
    }
    
    if (!groupName || members.length < 2) {
        showAlert("Invalid Input", "Please provide a group name and at least two unique members.");
        return;
    }
    
    try {
        const groupsRef = collection(db, `artifacts/${appId}/public/data/groups`);
        await addDoc(groupsRef, {
            name: groupName,
            members: members,
            memberIds: Array.from(memberIds),
            createdAt: serverTimestamp()
        });
        closeModal(createGroupModal, createGroupModalContent);
        createGroupForm.reset();
    } catch (error) {
        console.error("Error creating group:", error);
        showAlert("Error", "Could not create the group. Please try again.");
    }
});

addExpenseBtn.addEventListener('click', () => {
    if (!currentGroupId || groupMembers.length === 0) return;
    
    const paidBySelect = document.getElementById('paidBy');
    paidBySelect.innerHTML = '';
    groupMembers.forEach(member => {
        const option = document.createElement('option');
        option.value = member.id;
        option.textContent = member.name;
        paidBySelect.appendChild(option);
    });
    
    document.getElementById('splitType').value = 'equally';
    addExpenseForm.reset(); // Reset form fields
    updateSplitDetails();
    openModal(addExpenseModal, addExpenseModalContent);
});

cancelAddExpense.addEventListener('click', () => closeModal(addExpenseModal, addExpenseModalContent));
document.getElementById('splitType').addEventListener('change', updateSplitDetails);
document.getElementById('expenseAmount').addEventListener('input', updateSplitDetails);

addExpenseForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const description = document.getElementById('expenseDescription').value.trim();
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    const paidBy = document.getElementById('paidBy').value;
    const splitType = document.getElementById('splitType').value;
    
    if (!description || isNaN(amount) || amount <= 0) {
        showAlert("Invalid Input", "Please enter a valid description and amount.");
        return;
    }
    
    const splits = [];
    if (splitType === 'equally') {
        const share = amount / groupMembers.length;
        groupMembers.forEach(member => {
            splits.push({ memberId: member.id, amount: share });
        });
    } else if (splitType === 'exact') {
        let totalSplit = 0;
        document.querySelectorAll('.exact-split-amount').forEach(input => {
            const splitAmount = parseFloat(input.value) || 0;
            if (splitAmount > 0) {
                splits.push({ memberId: input.dataset.memberId, amount: splitAmount });
            }
            totalSplit += splitAmount;
        });
        if (Math.abs(totalSplit - amount) > 0.01) {
            showAlert("Invalid Split", "The sum of exact amounts must equal the total expense amount.");
            return;
        }
    }
    
    try {
        const expensesRef = collection(db, `artifacts/${appId}/public/data/groups/${currentGroupId}/expenses`);
        await addDoc(expensesRef, {
            description,
            amount,
            paidBy,
            splitType,
            splits,
            createdAt: serverTimestamp()
        });
        closeModal(addExpenseModal, addExpenseModalContent);
        addExpenseForm.reset();
    } catch (error) {
        console.error("Error adding expense:", error);
        showAlert("Error", "Could not add the expense. Please try again.");
    }
});

document.getElementById('alertOkBtn').addEventListener('click', () => closeModal(alertModal, alertModalContent));

// --- Initialize App ---
window.onload = main;
