
/* Get HTML elements */
const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");

/* Store tasks */
let tasks = [];

/* Add a new task */
function addTask() {
    const taskText = taskInput.value.trim();

    if (taskText === "") {
        alert("Please enter a task!");
        return;
    }

    const newTask = {
        id: crypto.randomUUID(),
        text: taskText,
        completed: false
    };

    tasks.push(newTask);

    taskInput.value = "";

    updateTasks();
    taskInput.focus();
}

/* Display all tasks */
function displayTasks() {
    taskList.innerHTML = "";

    tasks.forEach(function(task) {

        const li = document.createElement("li");

        // Create checkbox
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute(
            "aria-label",
            "Complete " + task.text
        );

        checkbox.addEventListener("change", function() {
            toggleTask(task.id);
        });

        // Create task description
        const span = document.createElement("span");
        span.textContent = task.text;

        if (task.completed) {
            span.classList.add("completed");
        }

        // Create Delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "delete-btn";
        deleteBtn.type = "button";

        deleteBtn.setAttribute(
            "aria-label",
            "Delete " + task.text
        );

        deleteBtn.addEventListener("click", function() {
            deleteTask(task.id);
        });

        // Add elements to task
        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(deleteBtn);

        // Add task to list
        taskList.appendChild(li);
    });
}

/* Mark task as complete or incomplete */
function toggleTask(id) {
    const task = tasks.find(function(item) {
        return item.id === id;
    });

    if (task) {
        task.completed = !task.completed;
        updateTasks();
    }
}

/* Delete a task */
function deleteTask(id) {
    tasks = tasks.filter(function(task) {
        return task.id !== id;
    });

    updateTasks();
}

/* Save tasks to browser storage */
function saveTasks() {
    localStorage.setItem(
        "tasks",
        JSON.stringify(tasks)
    );
}

/* Load saved tasks */
function loadTasks() {
    try {
        const savedTasks = localStorage.getItem("tasks");

        if (savedTasks) {
            const loadedTasks = JSON.parse(savedTasks);

            if (Array.isArray(loadedTasks)) {
                tasks = loadedTasks;
            }
        }
    } catch (error) {
        console.error("Error loading tasks:", error);
        tasks = [];
    }

    displayTasks();
}

/* Save and refresh the task list */
function updateTasks() {
    saveTasks();
    displayTasks();
}

/* Add Task button */
addTaskBtn.addEventListener("click", addTask);

/* Enter key */
taskInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        addTask();
    }
});

/* Load tasks when webpage opens */
loadTasks();
