let transactions = [];
let today;

document.getElementById("signUpForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("signUpUsername").value;
    const email = document.getElementById("signUpEmail").value;
    const password = document.getElementById("signUpPassword").value;

    try {
        const response = await fetch("http://localhost/expense-tracker/server/register.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({ name: username, email: email, password: password })
        });

        const result = await response.json();

        if (result.success) {
            alert(result.message); 
        } else {
            alert(result.message); 
        }
    } catch (error) {
        console.error("Error during registration:", error);
    }
});

document.getElementById("signInForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("signInemail").value;
    const password = document.getElementById("signInPassword").value;

    try {
        const response = await fetch("http://localhost/expense-tracker/server/login.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({ email: email, password: password })
        });

        const result = await response.json();

        if (result.success) {
            alert("Login successful!");
            localStorage.setItem("user_id", result.user_id); 
            fetchTransactions(); 
        } else {
            alert(result.message); 
        }
    } catch (error) {
        console.error("Error during login:", error);
    }
});

async function signOutUser() {
    try {
        const response = await fetch("http://localhost/expense-tracker/server/logout.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        });

        const result = await response.json();

        if (result.success) {
            alert("Logged out successfully.");
            localStorage.removeItem("user_id"); 
            window.location.reload(); 
        } else {
            alert(result.message); 
        }
    } catch (error) {
        console.error("Error during logout:", error);
    }
}


document.addEventListener('DOMContentLoaded', () => {
    today = new Date().toISOString().split("T")[0];
    fetchTransactions();
    updateTotalBudget();

    const dateInput = document.getElementById("date");
    dateInput.value = today;
});

document.getElementById("transactionForm").addEventListener("submit", async function (event) {
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
        try {
            const response = await fetch("http://localhost/expense-tracker/server/update_transaction.php", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({ id: editId, amount, type, date, notes })
            });
            const result = await response.json();

            if (result.success) {
                fetchTransactions();
            } else {
                alert("Error updating transaction.");
            }
        } catch (error) {
            console.error("Error updating transaction:", error);
        }
        this.removeAttribute('data-edit-id');
    } else {
        try {
            const response = await fetch("http://localhost/expense-tracker/server/add_transaction.php", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({ amount, type, date, notes })
            });
            const result = await response.json();

            if (result.success) {
                fetchTransactions();
            } else {
                alert("Error adding transaction.");
            }
        } catch (error) {
            console.error("Error adding transaction:", error);
        }
    }

    event.target.reset();
    document.getElementById("date").value = today;
});

async function fetchTransactions() {
    try {
        const response = await fetch("http://localhost/expense-tracker/server/get_transaction.php");
        const data = await response.json();

        if (data.success) {
            transactions = data.transactions;
            renderTransactions();
            updateTotalBudget();
        } else {
            alert("Failed to load transactions.");
        }
    } catch (error) {
        console.error("Error fetching transactions:", error);
    }
}

function renderTransactions(transactionsToRender = transactions) {
    const transactionList = document.getElementById('transactions');
    transactionList.innerHTML = '';

    const sortedTransactions = transactionsToRender.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
    let dateGroups = {};
    sortedTransactions.forEach(transaction => {
        if (!dateGroups[transaction.date]) dateGroups[transaction.date] = [];
        dateGroups[transaction.date].push(transaction);
    });

    Object.keys(dateGroups).forEach(date => {
        const dateContainer = document.createElement('div');
        dateContainer.classList.add('transaction-date');
        dateContainer.innerHTML = `<span class="triangle">&#9660;</span> ${date}`;

        dateContainer.addEventListener('click', () => {
            transactionList.querySelectorAll(`.transaction-item[data-date="${date}"]`).forEach(item => item.classList.toggle('hidden'));
            const triangle = dateContainer.querySelector('.triangle');
            triangle.innerHTML = triangle.innerHTML === '▼' ? '&#9650;' : '&#9660;';
        });

        transactionList.appendChild(dateContainer);

        dateGroups[date].forEach(transaction => {
            const { id, amount, type, notes } = transaction;
            const transactionItem = document.createElement('li');
            transactionItem.classList.add(type, 'transaction-item', 'hidden');
            transactionItem.setAttribute('data-date', date);
            transactionItem.innerHTML = `<span>${notes}</span><span>${type === 'income' ? '+' : '-'}$${amount}</span>`;

            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('delete-btn');
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', () => deleteTransaction(id));
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

async function deleteTransaction(id) {
    try {
        const response = await fetch("http://localhost/expense-tracker/server/delete_transaction.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ id })
        });
        const result = await response.json();

        if (result.success) {
            fetchTransactions();
        } else {
            alert("Error deleting transaction.");
        }
    } catch (error) {
        console.error("Error deleting transaction:", error);
    }
}

function updateTotalBudget() {
    const totalAmount = transactions.reduce((total, transaction) => {
        return transaction.type === 'income' ? total + parseFloat(transaction.amount) : total - parseFloat(transaction.amount);
    }, 0);

    document.getElementById("totalAmount").textContent = `$${totalAmount.toFixed(2)}`;
}

document.getElementById("applyFilters").addEventListener("click", function () {
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
