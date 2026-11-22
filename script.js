
/* Get HTML elements */
const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const taskError = document.getElementById("taskError");

/* Keep the original storage key */
const STORAGE_KEY = "tasks";
const EXPLOSION_TIME = 550;

let tasks = [];
const deletingTasks = new Set();

/* Generate a unique task ID */
function createTaskId() {
    if (typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }

    return Date.now() + "-" + Math.random();
}

/* Add a task */
function addTask() {
    const taskText = taskInput.value.trim();

    if (taskText === "") {
        taskError.hidden = false;
        taskInput.focus();
        return;
    }

    taskError.hidden = true;

    const newTask = {
        id: createTaskId(),
        text: taskText,
        completed: false
    };

    tasks.push(newTask);

    taskInput.value = "";
    updateTasks();
    taskInput.focus();
}

/* Display tasks */
function displayTasks() {
    taskList.innerHTML = "";

    tasks.forEach(function(task) {
        const li = document.createElement("li");

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

        const span = document.createElement("span");
        span.textContent = task.text;

        if (task.completed) {
            span.classList.add("completed");
        }

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.type = "button";
        deleteBtn.className = "delete-btn";

        deleteBtn.setAttribute(
            "aria-label",
            "Delete " + task.text
        );

        deleteBtn.addEventListener("click", function() {
            explodeTask(task.id, li, deleteBtn);
        });

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(deleteBtn);

        taskList.appendChild(li);
    });
}

/* Create explosion particles */
function createParticles(element) {
    const colors = [
        "#ff4500",
        "#ffcc00",
        "#ff1744",
        "#ff9100",
        "#ffd600"
    ];

    for (let i = 0; i < 12; i++) {
        const particle = document.createElement("span");
        particle.className = "explosion-particle";
        particle.setAttribute("aria-hidden", "true");

        const angle = (Math.PI * 2 * i) / 12;
        const distance = 60 + Math.random() * 65;

        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        particle.style.setProperty("--x", x + "px");
        particle.style.setProperty("--y", y + "px");

        particle.style.setProperty(
            "--particle-color",
            colors[i % colors.length]
        );

        element.appendChild(particle);
    }
}

/* Animate and delete a task */
function explodeTask(id, element, button) {
    if (deletingTasks.has(id)) {
        return;
    }

    deletingTasks.add(id);
    button.disabled = true;

    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!reduceMotion) {
        createParticles(element);
        element.classList.add("exploding");
    }

    const delay = reduceMotion ? 0 : EXPLOSION_TIME;

    setTimeout(function() {
        tasks = tasks.filter(function(task) {
            return task.id !== id;
        });

        deletingTasks.delete(id);
        updateTasks();
    }, delay);
}

/* Complete or uncomplete a task */
function toggleTask(id) {
    const task = tasks.find(function(item) {
        return item.id === id;
    });

    if (task) {
        task.completed = !task.completed;
        updateTasks();
    }
}

/* Save tasks */
function saveTasks() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(tasks)
        );
    } catch (error) {
        console.error("Could not save tasks:", error);
    }
}

/* Load existing tasks */
function loadTasks() {
    try {
        const savedTasks = localStorage.getItem(STORAGE_KEY);

        if (savedTasks) {
            const loadedTasks = JSON.parse(savedTasks);

            if (Array.isArray(loadedTasks)) {
                tasks = loadedTasks;
            }
        }
    } catch (error) {
        console.error("Could not load tasks:", error);
    }

    displayTasks();
}

/* Update storage and screen */
function updateTasks() {
    saveTasks();
    displayTasks();
}

/* Button click */
addTaskBtn.addEventListener("click", addTask);

/* Enter key */
taskInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        addTask();
    }
});

/* Hide error when user types */
taskInput.addEventListener("input", function() {
    taskError.hidden = true;
});

/* Load existing tasks on startup */
loadTasks();
