const checklistInput = document.getElementById('list-input');
const checklistsContainer = document.getElementById('checklists-container');
const quote = document.getElementById('quote');

let initialItemText;
const listLimit = 30;
const greetings = ['lovely', 'marvelous', 'wonderful', 'happy', 'pleasent'];
const colors = ['#F9C81C', '#2CADF6', '#58D6BF'];

//----------------- localstorage setup -----------------//
// get from localstorage
const getLists = () => {
    if (!localStorage.getItem('_checklists_')) {
        localStorage.setItem('_checklists_', JSON.stringify([]));
        return [];
    }
    return JSON.parse(localStorage.getItem('_checklists_'));
}

// set to localstorage
const saveLists = (items) => {
    localStorage.setItem('_checklists_', JSON.stringify(items));
}
// ----------------------------------------------------//


// toggle the complete state
function toggleCompleteItem(e) {
    e.target.parentElement.classList.toggle('completed');

    let newList = getLists().map(list => {
        if (list.item.toLowerCase() === e.target.nextElementSibling.innerText.toLowerCase()) {
            list.completed = !list.completed;
        };
        return list;
    });

    saveLists(newList);
}

// remove item from the list
function removeItem(e) {
    e.target.parentElement.remove();
    let removeEl = e.target.previousElementSibling.innerText.toLowerCase();
    let newList = getLists().filter(({ item }) => item.toLowerCase() !== removeEl);
    saveLists(newList);

    if (newList.length === 0) {
        getRandomQuote();
    }
}

// make list editable
function editItem(e) {
    e.target.setAttribute('contenteditable', 'true');
    initialItemText = e.target.innerText;
}

// update the list
function saveEditedItem(e) {
    e.target.setAttribute('contenteditable', 'false');

    let editedText = e.target.innerText.replace(/(\r\n|\n|\r)/gm, " ").replace(/\s+/g, " ");

    if (initialItemText !== editedText.trim()) {
        let updatedItem = getLists().map(list => {
            if (list.item === initialItemText) {
                list.item = editedText;
            };
            return list;
        })
        e.target.innerText = editedText;
        saveLists(updatedItem);
    } else {
        e.target.innerText = editedText;
    }
}

// add new list
function addNewItem(e) {
    e.preventDefault();
    let newItem = checklistInput.value.trim();

    let checklists = getLists();

    let isDuplicate = checklists
        .find(({ item }) => item.toLowerCase() === newItem.toLowerCase());

    if (newItem && !isDuplicate && checklists.length < listLimit) {
        createListUI(newItem);
        let newChecklist = { item: newItem, completed: false };
        checklists.push(newChecklist);
        saveLists(checklists);
    }

    checklistsContainer.scrollTop = checklistsContainer.scrollHeight;
    checklistInput.value = null;
}


// create  list UI
function createListUI(item, isComplete = false) {
    const checklistWrap = document.createElement('li');
    checklistWrap.classList.add('checklist');

    const completeButton = document.createElement('div');
    completeButton.classList.add('checklist__complete-btn');
    completeButton.innerHTML = '<i class="fas fa-check"></i>';
    completeButton.addEventListener('click', toggleCompleteItem);
    checklistWrap.appendChild(completeButton);

    const checklist = document.createElement('span');
    checklist.classList.add('checklist__item');
    checklist.setAttribute('role', 'textbox');
    checklist.innerText = item;
    checklist.addEventListener('click', editItem);
    checklist.addEventListener('blur', saveEditedItem);
    checklistWrap.appendChild(checklist);

    const deleteButton = document.createElement('div');
    deleteButton.classList.add('checklist__delete-btn');
    deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
    deleteButton.addEventListener('click', removeItem);
    checklistWrap.appendChild(deleteButton);

    checklistsContainer.appendChild(checklistWrap);
    checklistsContainer.classList.add('has-list');
    quote.style.display = 'none';

    if (isComplete) {
        checklistWrap.classList.add('completed');
    }
}

// Clear list UI
function clearlistUI() {
    let checkLists = checklistsContainer.childNodes;
    for (let i = checkLists.length - 1; i >= 0; i--) {
        checkLists[i].remove();
    }
}

// clear completed list
function clearCompleted() {
    clearlistUI();
    let newLists = getLists().filter(({ completed }) => !completed);
    newLists.forEach(({ item, completed }) => createListUI(item, completed));
    saveLists(newLists);

    if (newLists.length === 0) {
        getRandomQuote();
    }
}

// reset all
function resetAll() {
    let result = confirm('This action will clear all data.');
    if (result) {
        clearlistUI();
        localStorage.clear();
        getRandomQuote();
    }
}

async function getRandomQuote() {
    checklistsContainer.classList.remove('has-list');

    fetch('https://api.quotable.io/random?maxLength=150')
        .then(response => response.json())
        .then(data => {
            quote.style.display = 'block';
            document.getElementById('quote-content').innerText = data.content;
            document.getElementById('quote-author').innerText = data.author;
        })
        .catch(() => {
            quote.style.display = 'block';
            document.getElementById('quote-content').innerText = 'The present is theirs; the future, for which I really worked, is mine.';
            document.getElementById('quote-author').innerText = 'Nikola Tesla';
        })
}

document.addEventListener('DOMContentLoaded', () => {
    getLists().forEach(({ item, completed }) => createListUI(item, completed));
    document.getElementById('add-button').addEventListener('click', addNewItem);

    document.getElementById('clear-completed').addEventListener('click', clearCompleted);
    document.getElementById('reset-all').addEventListener('click', resetAll);

    let today = new Date().toLocaleString('en-US', { weekday: 'long' });
    document.getElementById('day').innerText = today;
    document.getElementById('day').style.color = colors[Math.floor(Math.random() * colors.length)];
    document.getElementById('greet').innerText = greetings[Math.floor(Math.random() * greetings.length)];

    if (getLists().length === 0)
        getRandomQuote()
})

const btnAdd = document.getElementById('intall-btn');

let deferredPrompt;
window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    btnAdd.style.display = 'block';
})

btnAdd.addEventListener('click', e => {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(choiceResult => {
        if (choiceResult.outcome === 'accepted') {
            console.log('User acceptrd the A2HS prompt');
        }
        deferredPrompt = null;
    })
})