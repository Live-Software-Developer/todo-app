"use strict"

const APP_NAME = "todo-app"

class TodoApp {

	constructor(local_storage_key) {
		this.LOCAL_STORAGE_KEY = local_storage_key
		this.lists = []
		this.ACTIVE_LIST_INDEX = null
		this.ACTIVE_TAB = 'tab-1'
	}

	init(){
		this.readLocalStorage()
	}

	// Update local storage
	updateLocalStorage(){
		const app_data = {
			lists: this.lists,
			active_list_index: this.ACTIVE_LIST_INDEX,
			active_tab: this.ACTIVE_TAB
		}
		localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(app_data))
	}

	// Read local storage
	readLocalStorage(){
		const loc_data = localStorage.getItem(this.LOCAL_STORAGE_KEY)

		if(loc_data) {
			const app_data = JSON.parse(loc_data)
			this.lists = app_data.lists
			this.ACTIVE_LIST_INDEX = app_data.active_list_index
			this.ACTIVE_TAB = app_data.active_tab
		}

		this.printListsToDoc()
		this.printTodosToDoc()
		this.renderListTitle()
		this.activateActiveList()
		this.activateTab(this.ACTIVE_TAB)

	}

	// Factory function -> to generate new list groups given a list_name
	generateList(list_name) {
		return {
			list_name: list_name,
			todos: []
		}
	}

	// Factory function to create a new todo
	generateTodo(todo_value) {
		return {
			todo: todo_value,
			is_complete: false
		}
	}

	activateTab(tab_id) {

		deactivateAllTabs()

		this.ACTIVE_TAB = tab_id
		const tab = getElement(tab_id)
		tab.classList.add('active')
		this.printTodosToDoc()

		this.updateLocalStorage()
	}

	addList(list_name) {
		this.lists = [
			...this.lists,
			this.generateList(list_name)
		]
		this.printListsToDoc()
		this.setActiveList(this.ACTIVE_LIST_INDEX)

		this.updateLocalStorage()
	}

	deleteList(list_position) {
		if (this.ACTIVE_LIST_INDEX === list_position) {
			this.unsetActiveList()
			this.ACTIVE_LIST_INDEX = null
		}
		this.lists = this.lists.filter((lists, index) => index !== list_position)
		this.printListsToDoc()

		this.updateLocalStorage()
	}

	addTodo(todo_value) {
		if (this.ACTIVE_LIST_INDEX === null) {
			alert("There is no active list. Kindly select before adding new tasks")
			return
		}
		const activeList = this.lists[this.ACTIVE_LIST_INDEX]
		const newTodo = this.generateTodo(todo_value)
		activeList.todos.push(newTodo)
		this.printTodosToDoc()

		this.updateLocalStorage()
	}

	updateTodo(todo_to_update) {
		if (this.ACTIVE_LIST_INDEX === null) {
			alert("There is no active list. Kindly select before adding new tasks")
			return
		}
		const activeList = this.lists[this.ACTIVE_LIST_INDEX]
		const todos = activeList.todos
		todos.map((todo, i) => {
			if (todo.todo === todo_to_update) {
				todo.is_complete = true
			}
		})
		activeList.todos = todos
		this.printTodosToDoc()

		this.updateLocalStorage()
	}

	deleteTodo(todo_to_delete) {
		if (this.ACTIVE_LIST_INDEX === null) {
			alert("There is no active list. Kindly select before adding new tasks")
			return
		}
		const activeList = this.lists[this.ACTIVE_LIST_INDEX]
		const todos = activeList.todos
		const new_todos = todos.filter(todo_item => todo_item.todo !== todo_to_delete)
		activeList.todos = new_todos
		this.printTodosToDoc()

		this.updateLocalStorage()
	}

	setActiveList(index) {
		this.ACTIVE_LIST_INDEX = index
		this.renderListTitle()
		this.activateActiveList()
		this.printTodosToDoc()
		if (this.ACTIVE_LIST_INDEX !== null) {
			this.activateTab('tab-1')
		}

		this.updateLocalStorage()
	}

	unsetActiveList() {
		this.ACTIVE_LIST_INDEX = null
		this.renderListTitle()
		this.activateActiveList()

		this.updateLocalStorage()
	}

	printListsToDoc() {
		const listsHolder = document.getElementById('list')
		if (listsHolder) {
			let listElements = ""
			this.lists.map((item, index) => {
				listElements += listItem(item, index)
			})
			if(this.lists.length === 0){
				listElements += "There are no lists, add some!"
			}
			listsHolder.innerHTML = listElements
		}
	}

	printTodosToDoc() {
		const todosHolder = getElement('todos')
		if (!todosHolder || this.ACTIVE_LIST_INDEX === null || !this.ACTIVE_TAB) return

		const activeList = this.lists[this.ACTIVE_LIST_INDEX]
		const todos = activeList.todos
		let todoItems = ""
		const activeTab = this.ACTIVE_TAB
		if (activeTab === 'tab-1') {
			if (todos.length === 0) {
				todoItems += "No todos here, add some!"
			}
			todos.map((todo, i) => {
				todoItems += todoItem(todo)
			})
		}
		else if (activeTab === 'tab-2') {
			let incomplete_todos = todos.filter(todo => !todo.is_complete)
			if (incomplete_todos.length === 0) {
				todoItems += "There are no incomplete todos."
			}
			incomplete_todos.map((todo, i) => {
				todoItems += todoItem(todo)
			})
		}

		else {
			let complete_todos = todos.filter(todo => todo.is_complete)
			if (complete_todos.length === 0) {
				todoItems += "There are no complete todos."
			}
			complete_todos.map((todo, i) => {
				todoItems += todoItem(todo)
			})
		}

		todosHolder.innerHTML = todoItems
	}

	renderListTitle() {
		const list_title_holder = getElement('list-title')

		if (this.ACTIVE_LIST_INDEX === null) {
			list_title_holder.textContent = 'Select List'
			return
		}

		const activeList = this.lists[this.ACTIVE_LIST_INDEX]
		list_title_holder.textContent = activeList.list_name
	}

	activateActiveList() {

		if (this.ACTIVE_LIST_INDEX === null) {
			deactivateAllListItems()
			return
		}

		const active_list = `list_${this.ACTIVE_LIST_INDEX}` // list_0, list_1, list_2
		// const active_list_item = document.querySelector(`[data-list='${active_list}']`)
		const active_list_item = getElement(active_list)
		deactivateAllListItems()
		if (active_list_item) {
			active_list_item.classList.add('active')
		}
		this.printTodosToDoc()

		this.updateLocalStorage()
	}

}

let app = new TodoApp(APP_NAME)
app.init()

const listForm = getElement('list-form')
listForm.addEventListener('submit', (event) => {
	event.preventDefault()
	listFormOnSubmit()
})

const todoForm = getElement('todo-form')
todoForm.addEventListener('submit', (event) => {
	event.preventDefault()
	todoFormOnSubmit()
})



// Localstorage -> setItem, getItem, removeItem

// CRUD -> Create, Read, Update, Delete
// Create their account
// Profile page -> Reading the account information
// Change profile  picture ->  Updating
// Deleting your account





// const WEBSITE_USERS = [
// 	{
// 		name: "Dalmas ogembo",
// 		phone_number: "25470000000",
// 		email: "email@gmail.com",
//		likes: ['football', 'basketball', 'etc']
// 	},
// 	{
// 		name: "2nd user",
// 		phone_number: "25470000000",
// 		email: "email@gmail.com",
// 	},
// 	{
// 		name: "2nd user",
// 		phone_number: "25470000000",
// 		email: "email@gmail.com",
// 	},
// 	{
// 		name: "2nd user",
// 		phone_number: "25470000000",
// 		email: "email@gmail.com",
// 	},
// 	{
// 		name: "2nd user",
// 		phone_number: "25470000000",
// 		email: "email@gmail.com",
// 	},
// 	{
// 		name: "2nd user",
// 		phone_number: "25470000000",
// 		email: "email@gmail.com",
// 	},
// 	{
// 		name: "2nd user",
// 		phone_number: "25470000000",
// 		email: "email@gmail.com",
// 	},
// ]

// const CART = [
// 	{
// 		name: "product 1",
// 		id: "1",
// 		price: 230,
// 		qty: 5,
// 		image: "imageurl"
// 	},
// 	{
// 		name: "product 1",
// 		id: "1",
// 		price: 230,
// 		qty: 4,
// 		image: "imageurl"
// 	},
// 	{
// 		name: "product 1",
// 		id: "1",
// 		price: 230,
// 		qty: 5,
// 		image: "imageurl"
// 	},
// 	{
// 		name: "product 1",
// 		id: "1",
// 		price: 230,
// 		qty: 6,
// 		image: "imageurl"
// 	},
// ]

// const cartTotal = CART.reduce((currentTotal, item) => {
// 	if(item.qty > 5){
// 		return (item.price * item.qty) + currentTotal
// 	}
// 	return currentTotal
// }, 0 )
// console.log("Cart total: ", cartTotal)

// JSON -> Javascript object notation {} []
// {} -> a single person
// [] -> alot of people


// function login(){
// 	document.cookie = "access_token=somevalue; "
// }

// login()




// Utility functions
// Generator/Factory function
function listItem(item, item_position) {
	return `
		<li class="list-item" id="list_${item_position}" data-list="list_${item_position}" onclick="activateList(${item_position})" >
			${item.list_name}
			<button class='btn btn-delete' onclick='deleteList(${item_position})'>Delete</button>
		</li>
	`
}

function todoItem(todo_item) {
	const is_complete = todo_item.is_complete
	let buttons = ''
	const delete_btn = `<button class="btn btn-delete" onclick="deleteTodo('${todo_item.todo}')">Delete</button>`
	const done_btn = `<button class="btn btn-done" onclick="updateTodo('${todo_item.todo}')">Done</button>`
	if (is_complete) {
		buttons += delete_btn
	}
	else {
		buttons += done_btn + delete_btn
	}
	return `
		<li class="todo-item">
			<p class="${is_complete ? 'complete' : 'not-complete'}">${todo_item.todo}</p>
			<div class="item-actions">
				${buttons}
			</div>
		</li>
	`
}

function getElement(elem_id) {
	return document.getElementById(elem_id)
}

function listFormOnSubmit() {
	const list_input_el = getElement('list-input')
	const list_name = list_input_el.value
	if (list_name === "") return
	app.addList(list_name)
	list_input_el.value = ""
}

function todoFormOnSubmit() {
	const todo_input_el = getElement('todo-input')
	const todo_value = todo_input_el.value
	if (todo_value === "") return
	app.addTodo(todo_value)
	todo_input_el.value = ""
}


function activateList(index) {
	app.setActiveList(index)
}


// DRY -> Don't Repeat Yourself

function updateTodo(todo) {
	const mark_as_complete = window.confirm('Are you sure you want to mark this todo as complete?')
	if (mark_as_complete) {
		app.updateTodo(todo)
	}
}


function deleteTodo(todo) {
	const delete_todo = confirm('Are you sure you want to delete this task?')
	if (delete_todo) {
		app.deleteTodo(todo)
	}
}


function deactivateAllListItems() {
	const list_items = document.querySelectorAll('.list-item')

	// list_items.forEach((el) => {
	// 	console.log("am being reached too")
	// 	el.classList.remove('active')
	// })

	for (let i = 0; i < list_items.length; i++) {
		const el = list_items[i];
		el.classList.remove('active')
	}

}

function deactivateAllTabs() {
	const tabs = document.querySelectorAll('.tab')
	tabs.forEach((el) => {
		el.classList.remove('active')
	})
}

function deselectActiveList() {
	app.unsetActiveList()
}

function deleteList(list_position) {
	app.deleteList(list_position)
}

function activateTab(tab_id) {
	app.activateTab(tab_id)
}