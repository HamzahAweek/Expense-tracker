let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

function saveTransactions() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

document.getElementById("transactionForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const amount = parseFloat(document.getElementById("amount").value);
    const type = document.getElementById("type").value;
    const date = document.getElementById("date").value;
    const notes = document.getElementById("notes").value;

    if (isNaN(amount) || amount <= 0) {
        alert("Please enter a valid amount.");
        return;
    }

    const editId = this.getAttribute('data-edit-id');

    if (editId) {
        const transactionIndex = transactions.findIndex(transaction => transaction.id == editId);
        transactions[transactionIndex] = {
            id: editId,
            amount,
            type,
            date,
            notes
        };
        this.removeAttribute('data-edit-id'); 
    } else {
        const transaction = {
            id: Date.now(),
            amount,
            type,
            date,
            notes
        };
        transactions.push(transaction);
    }

    saveTransactions();
    renderTransactions();
    updateTotalBudget();

    event.target.reset();
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("date").value = today; 
});


function renderTransactions(transactionsToRender = transactions) {
    const transactionList = document.getElementById('transactions');
    transactionList.innerHTML = '';


    const sortedTransactions = transactionsToRender.slice().sort((a, b) => {
        if (a.date === b.date) {
            return b.id - a.id; 
        }
        return new Date(b.date) - new Date(a.date); 
    });

    let dateGroups = {};
    sortedTransactions.forEach(transaction => {
        if (!dateGroups[transaction.date]) {
            dateGroups[transaction.date] = [];
        }
        dateGroups[transaction.date].push(transaction);
    });

    Object.keys(dateGroups).forEach(date => {
        const dateContainer = document.createElement('div');
        dateContainer.classList.add('transaction-date');
        dateContainer.innerHTML = `<span class="triangle">&#9660;</span> ${date}`;
        
        dateContainer.addEventListener('click', () => {
            transactionList.querySelectorAll(`.transaction-item[data-date="${date}"]`).forEach(item => {
                item.classList.toggle('hidden'); // Toggle visibility
            });
            
            const triangle = dateContainer.querySelector('.triangle');
            triangle.innerHTML = triangle.innerHTML === '▼' ? '&#9650;' : '&#9660;';
        });

        transactionList.appendChild(dateContainer);

        dateGroups[date].forEach(transaction => {
            const { id, amount, type, notes } = transaction;
            const transactionItem = document.createElement('li');
            transactionItem.classList.add(type, 'transaction-item', 'hidden');
            transactionItem.setAttribute('data-date', date);

            transactionItem.innerHTML = `
                <span>${notes}</span>
                <span>${type === 'income' ? '+' : '-'}$${amount}</span>
            `;

            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('delete-btn');
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', () => deleteTransaction(id)); // Attach event listener
            transactionItem.appendChild(deleteBtn);

            const editBtn = document.createElement('button');
            editBtn.classList.add('edit-btn');
            editBtn.textContent = 'Edit';
            editBtn.addEventListener('click', () => {
            document.getElementById("amount").value = amount;
            document.getElementById("type").value = type;
            document.getElementById("date").value = date;
            document.getElementById("notes").value = notes;

            document.getElementById("transactionForm").setAttribute('data-edit-id', id);
            });

                transactionItem.appendChild(editBtn);

            transactionList.appendChild(transactionItem);
        });
    });
}



function deleteTransaction(id) {
    transactions = transactions.filter(transaction => transaction.id !== id);
    saveTransactions();
    renderTransactions();
    updateTotalBudget();
}

function updateTotalBudget() {
    const totalAmount = transactions.reduce((total, transaction) => {
        return transaction.type === 'income' ? total + transaction.amount : total - transaction.amount;
    }, 0);

    document.getElementById("totalAmount").textContent = `$${totalAmount.toFixed(2)}`;
}

document.getElementById("applyFilters").addEventListener("click", function() {
    const minPrice = parseFloat(document.getElementById("minPrice").value);
    const maxPrice = parseFloat(document.getElementById("maxPrice").value);
    const filterType = document.getElementById("filterType").value;
    const filterDate = document.getElementById("filterDate").value;
    const filterNotes = document.getElementById("filterNotes").value.toLowerCase();

    const filteredTransactions = transactions.filter(transaction => {
        let isValid = true;

        if (!isNaN(minPrice)) isValid = isValid && transaction.amount >= minPrice;
        if (!isNaN(maxPrice)) isValid = isValid && transaction.amount <= maxPrice;
        if (filterType) isValid = isValid && transaction.type === filterType;
        if (filterDate) isValid = isValid && transaction.date === filterDate;
        if (filterNotes) isValid = isValid && transaction.notes.toLowerCase().includes(filterNotes);

        return isValid;
    });

    renderTransactions(filteredTransactions);
});

document.addEventListener('DOMContentLoaded', () => {
    renderTransactions();
    updateTotalBudget();
});

document.addEventListener("DOMContentLoaded", () => {
    const dateInput = document.getElementById("date");
    const today = new Date().toISOString().split("T")[0]; 
    dateInput.value = today;
});

