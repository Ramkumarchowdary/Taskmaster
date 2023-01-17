// selectors
const todoInput = document.querySelector('.todo-input');
const todoButton = document.querySelector('.todo-button');
const todoList = document.querySelector('.todo-list');
const filterOption = document.querySelector('.filter-todo');

// event Listeners
// document.addEventListener("DOMContentLoaded", getTodos);
todoButton.addEventListener('click', addTodo);
todoList.addEventListener('click', deleteCheck);
filterOption.addEventListener('change', filterTodo, false);

// functions
function addTodo(event) {
 event.preventDefault();
 // todo div
 const todoDiv = document.createElement('div');
 todoDiv.classList.add('todo');
 // creat li
 const newTodo = document.createElement('li');
 newTodo.innerText = todoInput.value;
//  /  add todos to local storage
//  saveLocalTodos(todoInput.value);
 newTodo.classList.add('todo-item');
 todoDiv.appendChild(newTodo);

// saveLocalTodos(todoInput.value);
 //  check mark button
 const completedButton = document.createElement('button');
 completedButton.innerHTML = '<i class="fas fa-check"></i>';
 completedButton.classList.add('complete-btn');
 todoDiv.appendChild(completedButton);

 //  check trash button
 const trashButton = document.createElement('button');
 trashButton.innerHTML = '<i class="fas fa-trash"></i>';
 trashButton.classList.add('trash-btn');
 todoDiv.appendChild(trashButton);
 // append to list
 todoList.appendChild(todoDiv);
 // clear  to do input in the value
 todoInput.value = '';
}

function deleteAnimation(todo) {
 // animation
 todo.classList.add('fall');
 todo.addEventListener('transitionend', function () {
  todo.remove();
 });
}

function deleteCheck(e) {
 const item = e.target;
 // delete todo
 if (item.classList[0] === 'trash-btn') {
  const todo = item.parentElement;

  //Check if task is done or not. If not, confirm delete action using alert box
  if (!todo.classList.contains('completed')) {
   let decision = confirm(
    'This item has not been completed. Are you sure you want to drop this?'
   );
   if (decision) {
    deleteAnimation(todo);
   }
  } else {
   deleteAnimation(todo);
  }
 }

 // check  mark

 if (item.classList[0] === 'complete-btn') {
  const todo = item.parentElement;
  todo.classList.toggle('completed');
  console.log(todo);
 }
}
function filterTodo(e) {
 const todos = todoList.childNodes;
 console.log('todos: ', todos);
 todos.forEach(function (todo) {
  console.log('todo: ', todo);
  console.log('e: ', e.target);
  switch (e.target.value) {
   case 'all':
    if (todo) todo.style.display = 'flex';
    break;
   case 'completed':
    console.log('todo: ', todo);
    if (todo.classList.contains('completed')) {
     todo.style.display = 'flex';
    } else {
     todo.style.display = 'none';
    }
    break;
   case 'uncompleted':
    if (!todo.classList.contains('completed')) {
     todo.style.display = 'flex';
    } else {
     todo.style.display = 'none';
    }
    break;
  }
 });
}

function removeLocalTodos(todo) {
  let todos;
  if (localStorage.getItem("todos") === null) {
    todos = [];
  } else {
    todos = JSON.parse(localStorage.getItem("todos"));
  }
  const todoIndex = todo.children[0].innerText;
  todos.splice(todos.indexOf(todoIndex), 1);
  localStorage.setItem("todos", JSON.stringify(todos));
}