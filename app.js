const checklistInput = document.getElementById('list-input');
const checklistAddButton = document.getElementById('add-button');
const checklistsContainer = document.getElementById('checklists-container');

let initialItemText;
const greetings = ['great', 'lovely', 'marvelous', 'wonderful', 'happy', 'terrific', 'pleasent'];

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
        checklistsContainer.style.padding = '0';
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

    if (initialItemText !== e.target.innerText.trim()) {
        let updatedItem = getLists().map(list => {
            if (list.item === initialItemText) {
                list.item = e.target.innerText;
            };
            return list;
        })

        saveLists(updatedItem);
    } else {
        e.target.innerText = initialItemText;
    }
}

// add new list
function addNewItem(e) {
    e.preventDefault();
    let newItem = checklistInput.value.trim();

    let isDuplicate = getLists()
        .find(({ item }) => item.toLowerCase() === newItem.toLowerCase());

    if (newItem && !isDuplicate) {
        createListUI(newItem);
        let newChecklist = { item: newItem, completed: false };
        let checklists = getLists();
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
    checklistsContainer.style.padding = '20px';

    if (isComplete) {
        checklistWrap.classList.add('completed');
    }
}


document.addEventListener('DOMContentLoaded', () => {
    getLists().forEach(({ item, completed }) => createListUI(item, completed));
    checklistAddButton.addEventListener('click', addNewItem);

    let today = new Date().toLocaleString('en-US', { weekday: 'long' });
    document.getElementById('day').innerText = today;

    document.getElementById('greet').innerText = greetings[Math.floor(Math.random() * greetings.length)]
})