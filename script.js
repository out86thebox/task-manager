
"use strict";

/* =========================
   ELEMENTS AND SETTINGS
========================= */

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const taskError = document.getElementById("taskError");

const STORAGE_KEY = "tasks";
const EXPLOSION_TIME = 550;
const PARTICLE_TIME = 850;

const particleColors = [
    "#ff4500",
    "#ffcc00",
    "#ff1744",
    "#ff9100",
    "#ffd600"
];

let tasks = [];
const deletingTasks = new Set();

/* =========================
   TASK IDS
========================= */

function createTaskId() {
    if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
    ) {
        return crypto.randomUUID();
    }

    return Date.now() + "-" + Math.random();
}

/* =========================
   ADD TASK
========================= */

function addTask(event) {
    event.preventDefault();

    const taskText = taskInput.value.trim();

    if (!taskText) {
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

/* =========================
   DISPLAY TASKS
========================= */

function displayTasks() {
    taskList.replaceChildren();

    tasks.forEach(function(task) {
        const li = document.createElement("li");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = Boolean(task.completed);

        checkbox.setAttribute(
            "aria-label",
            "Complete " + task.text
        );

        checkbox.addEventListener("change", function() {
            toggleTask(task.id);
        });

        const span = document.createElement("span");
        span.className = "task-text";
        span.textContent = task.text;

        if (task.completed) {
            span.classList.add("completed");
        }

        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "Delete";

        deleteBtn.setAttribute(
            "aria-label",
            "Delete " + task.text
        );

        deleteBtn.addEventListener("click", function() {
            explodeTask(task.id, li, deleteBtn);
        });

        li.append(checkbox, span, deleteBtn);
        taskList.appendChild(li);
    });
}

/* =========================
   COMPLETE TASK
========================= */

function toggleTask(id) {
    const task = tasks.find(function(item) {
        return item.id === id;
    });

    if (!task || deletingTasks.has(id)) {
        return;
    }

    task.completed = !task.completed;
    updateTasks();
}

/* =========================
   EXPLOSION PARTICLES
========================= */

function createParticles(element) {
    const rect = element.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Create the bright flash
    const flash = document.createElement("span");
    flash.className = "explosion-flash";
    flash.setAttribute("aria-hidden", "true");

    flash.style.left = centerX + "px";
    flash.style.top = centerY + "px";

    document.body.appendChild(flash);

    flash.addEventListener("animationend", function() {
        flash.remove();
    }, { once: true });

    // Create 24 colorful particles
    for (let i = 0; i < 24; i++) {
        const particle = document.createElement("span");

        particle.className = "explosion-particle";
        particle.setAttribute("aria-hidden", "true");

        // Start at the center of the task
        particle.style.left = centerX + "px";
        particle.style.top = centerY + "px";

        // Spread particles in every direction
        const angle = (Math.PI * 2 * i) / 24;
        const distance = 80 + Math.random() * 100;

        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        particle.style.setProperty("--x", x + "px");
        particle.style.setProperty("--y", y + "px");

        particle.style.setProperty(
            "--particle-color",
            particleColors[i % particleColors.length]
        );

        document.body.appendChild(particle);

        // Remove particles after animation
        particle.addEventListener(
            "animationend",
            function() {
                particle.remove();
            },
            { once: true }
        );
    }
}

/* =========================
   DELETE TASK WITH EXPLOSION
========================= */

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

/* =========================
   LOCAL STORAGE
========================= */

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

function loadTasks() {
    try {
        const savedTasks = localStorage.getItem(STORAGE_KEY);

        if (savedTasks !== null) {
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

function updateTasks() {
    saveTasks();
    displayTasks();
}

/* =========================
   EVENT LISTENERS
========================= */

// Form submission handles button clicks and Enter
taskForm.addEventListener("submit", addTask);

// Hide the warning when typing begins
taskInput.addEventListener("input", function() {
    taskError.hidden = true;
});

/* =========================
   START APPLICATION
========================= */

loadTasks();
