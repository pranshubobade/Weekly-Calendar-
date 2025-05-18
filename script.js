document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const weeklyGrid = document.getElementById('weeklyGrid');
    const gridContent = document.getElementById('gridContent');
    const newTaskForm = document.getElementById('newTaskForm');
    const modalTaskForm = document.getElementById('modalTaskForm');
    const newTaskModal = document.getElementById('newTaskModal');
    const getStartedBtn = document.getElementById('getStarted');
    const clearTasksBtn = document.getElementById('clearTasks');
    const themeToggleBtn = document.getElementById('themeToggle');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const statsContainer = document.getElementById('statsContainer');
    const closeModalBtn = document.querySelector('.close-modal');
    
    // Constants
    const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17];
    const CATEGORY_COLORS = {
        work: '#4A90E2',
        personal: '#50E3C2',
        other: '#F5A623'
    };
    
    // State
    let tasks = [];
    let currentDragTask = null;
    let isDarkTheme = localStorage.getItem('darkTheme') === 'true';
    
    // Initialize
    initializeGrid();
    loadTasksFromStorage();
    renderTasks();
    updateStats();
    
    // Apply dark theme if saved
    if (isDarkTheme) {
        document.body.classList.add('dark-theme');
    }
    
    // Initialize the grid with day columns and cells
    function initializeGrid() {
        // Create day columns
        for (let dayIndex = 0; dayIndex < DAYS.length; dayIndex++) {
            const dayColumn = document.createElement('div');
            dayColumn.className = 'day-cells';
            dayColumn.dataset.day = dayIndex + 1;
            
            // Create hour cells for this day
            for (let hourIndex = 0; hourIndex < HOURS.length; hourIndex++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.day = dayIndex + 1;
                cell.dataset.hour = HOURS[hourIndex];
                
                // Add drop event listeners
                cell.addEventListener('dragover', handleDragOver);
                cell.addEventListener('drop', handleDrop);
                cell.addEventListener('dragenter', handleDragEnter);
                cell.addEventListener('dragleave', handleDragLeave);
                
                dayColumn.appendChild(cell);
            }
            
            gridContent.appendChild(dayColumn);
        }
        
        // Create mobile accordion view (hidden by default)
        createMobileAccordion();
    }
    
    // Create mobile accordion for responsive view
    function createMobileAccordion() {
        const accordion = document.createElement('div');
        accordion.className = 'mobile-accordion';
        accordion.style.display = 'none';
        
        for (let dayIndex = 0; dayIndex < DAYS.length; dayIndex++) {
            const accordionItem = document.createElement('div');
            accordionItem.className = 'accordion-item';
            accordionItem.dataset.day = dayIndex + 1;
            
            const header = document.createElement('div');
            header.className = 'accordion-header';
            header.textContent = DAYS[dayIndex];
            header.innerHTML += '<span class="accordion-toggle">▼</span>';
            
            const content = document.createElement('div');
            content.className = 'accordion-content';
            content.dataset.day = dayIndex + 1;
            
            header.addEventListener('click', () => {
                accordionItem.classList.toggle('open');
            });
            
            accordionItem.appendChild(header);
            accordionItem.appendChild(content);
            accordion.appendChild(accordionItem);
        }
        
        weeklyGrid.insertAdjacentElement('afterend', accordion);
    }
    
    // Task Management Functions
    function addTask(name, day, hour, category) {
        // Check if a task already exists at this time slot
        const existingTask = tasks.find(task => 
            parseInt(task.day) === parseInt(day) && 
            parseInt(task.hour) === parseInt(hour)
        );
        
        if (existingTask) {
            return false; // Collision detected
        }
        
        // Create new task
        const newTask = {
            id: Date.now().toString(), // Unique ID
            name,
            day,
            hour,
            category
        };
        
        tasks.push(newTask);
        saveTasksToStorage();
        renderTasks();
        updateStats();
        return true;
    }
    
    function removeTask(taskId) {
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasksToStorage();
        renderTasks();
        updateStats();
    }
    
    function updateTaskPosition(taskId, newDay, newHour) {
        // Check for collision
        const existingTask = tasks.find(task => 
            parseInt(task.day) === parseInt(newDay) && 
            parseInt(task.hour) === parseInt(newHour) &&
            task.id !== taskId
        );
        
        if (existingTask) {
            return false; // Collision detected
        }
        
        // Update task position
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            tasks[taskIndex].day = newDay;
            tasks[taskIndex].hour = newHour;
            saveTasksToStorage();
            renderTasks();
            updateStats();
            return true;
        }
        
        return false;
    }
    
    // Storage Functions
    function saveTasksToStorage() {
        localStorage.setItem('weeklyCalendarTasks', JSON.stringify(tasks));
    }
    
    function loadTasksFromStorage() {
        const storedTasks = localStorage.getItem('weeklyCalendarTasks');
        if (storedTasks) {
            tasks = JSON.parse(storedTasks);
        }
    }
    
    function clearAllTasks() {
        tasks = [];
        saveTasksToStorage();
        renderTasks();
        updateStats();
    }
    
    // Rendering Functions
    function renderTasks() {
        // Clear existing task blocks
        document.querySelectorAll('.task-block').forEach(block => block.remove());
        
        // Create task blocks
        tasks.forEach(task => {
            // Find the correct cell
            const cell = document.querySelector(`.cell[data-day="${task.day}"][data-hour="${task.hour}"]`);
            if (!cell) return;
            
            // Create task block
            const taskBlock = document.createElement('div');
            taskBlock.className = `task-block ${task.category}`;
            taskBlock.id = `task-${task.id}`;
            taskBlock.dataset.taskId = task.id;
            taskBlock.draggable = true;
            
            // Accessibility attributes
            taskBlock.setAttribute('role', 'button');
            taskBlock.setAttribute('aria-label', `${task.name} at ${formatHour(task.hour)}`);
            taskBlock.setAttribute('tabindex', '0');
            
            // Get the category icon
            const iconId = `icon-${task.category}`;
            const iconSvg = document.getElementById(iconId);
            let iconHtml = '';
            
            if (iconSvg) {
                iconHtml = `<div class="task-icon">${iconSvg.outerHTML}</div>`;
            }
            
            // Task content
            taskBlock.innerHTML = `
                <div class="task-block-title">${task.name}</div>
                <div class="task-block-time">${formatHour(task.hour)} ${iconHtml}</div>
            `;
            
            // Drag events
            taskBlock.addEventListener('dragstart', handleDragStart);
            taskBlock.addEventListener('dragend', handleDragEnd);
            
            // Click to edit
            taskBlock.addEventListener('click', (e) => {
                e.stopPropagation();
                showEditTaskModal(task);
            });
            
            // Keyboard support
            taskBlock.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    showEditTaskModal(task);
                }
            });
            
            cell.appendChild(taskBlock);
        });
        
        // Update mobile view
        updateMobileView();
    }
    
    function updateMobileView() {
        const accordionContents = document.querySelectorAll('.accordion-content');
        
        // Clear existing mobile tasks
        accordionContents.forEach(content => {
            content.innerHTML = '';
        });
        
        // Group tasks by day
        const tasksByDay = {};
        DAYS.forEach((_, index) => {
            tasksByDay[index + 1] = [];
        });
        
        tasks.forEach(task => {
            tasksByDay[task.day].push(task);
        });
        
        // Render tasks in accordion
        for (const [day, dayTasks] of Object.entries(tasksByDay)) {
            const content = document.querySelector(`.accordion-content[data-day="${day}"]`);
            if (!content) continue;
            
            // Sort tasks by hour
            dayTasks.sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
            
            // Create task elements
            dayTasks.forEach(task => {
                const taskElement = document.createElement('div');
                taskElement.className = `mobile-task ${task.category}`;
                taskElement.dataset.taskId = task.id;
                
                taskElement.innerHTML = `
                    <div class="task-block-title">${task.name}</div>
                    <div class="task-block-time">${formatHour(task.hour)}</div>
                `;
                
                taskElement.addEventListener('click', () => {
                    showEditTaskModal(task);
                });
                
                content.appendChild(taskElement);
            });
            
            // Show empty message if no tasks
            if (dayTasks.length === 0) {
                content.innerHTML = '<p>No tasks for this day</p>';
            }
        }
    }
    
    function updateStats() {
        // Clear stats container
        statsContainer.innerHTML = '';
        
        // Count tasks per day
        const taskCounts = {};
        const taskCategories = {};
        
        DAYS.forEach((day, index) => {
            const dayNumber = index + 1;
            taskCounts[dayNumber] = 0;
            taskCategories[dayNumber] = { work: 0, personal: 0, other: 0 };
        });
        
        // Count tasks
        tasks.forEach(task => {
            taskCounts[task.day]++;
            taskCategories[task.day][task.category]++;
        });
        
        // Find maximum count for scaling
        const maxCount = Math.max(...Object.values(taskCounts), 1);
        
        // Create stat bars for each day
        DAYS.forEach((day, index) => {
            const dayNumber = index + 1;
            const count = taskCounts[dayNumber];
            const dayCategories = taskCategories[dayNumber];
            
            // Calculate percentages for stacked bar
            const workPercent = (dayCategories.work / maxCount) * 100;
            const personalPercent = (dayCategories.personal / maxCount) * 100;
            const otherPercent = (dayCategories.other / maxCount) * 100;
            
            const statItem = document.createElement('div');
            statItem.className = 'stat-item';
            
            statItem.innerHTML = `
                <div class="stat-label">
                    <span class="stat-day">${day}</span>
                    <span class="stat-count">${count} task${count !== 1 ? 's' : ''}</span>
                </div>
                <div class="stat-bar-container">
                    <div class="stat-bar work" style="width: ${workPercent}%"></div>
                    <div class="stat-bar personal" style="width: ${personalPercent}%"></div>
                    <div class="stat-bar other" style="width: ${otherPercent}%"></div>
                </div>
            `;
            
            statsContainer.appendChild(statItem);
        });
    }
    
    // Helper Functions
    function formatHour(hour) {
        hour = parseInt(hour);
        if (hour < 12) return `${hour} AM`;
        if (hour === 12) return '12 PM';
        return `${hour - 12} PM`;
    }
    
    function showNewTaskModal() {
        newTaskModal.classList.add('active');
        document.getElementById('modalTaskName').focus();
    }
    
    function showEditTaskModal(task) {
        // Fill in the modal with task data
        const editModal = document.createElement('div');
        editModal.className = 'modal active';
        editModal.id = 'editTaskModal';
        
        editModal.innerHTML = `
            <div class="modal-content">
                <span class="close-edit-modal">&times;</span>
                <h3>Edit Task</h3>
                <form id="editTaskForm">
                    <input type="hidden" id="editTaskId" value="${task.id}">
                    <div class="form-group">
                        <label for="editTaskName">Task Name</label>
                        <input type="text" id="editTaskName" value="${task.name}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="editTaskDay">Day</label>
                        <select id="editTaskDay" required>
                            ${DAYS.map((day, index) => 
                                `<option value="${index + 1}" ${parseInt(task.day) === index + 1 ? 'selected' : ''}>${day}</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="editTaskTime">Start Time</label>
                        <select id="editTaskTime" required>
                            ${HOURS.map(hour => 
                                `<option value="${hour}" ${parseInt(task.hour) === hour ? 'selected' : ''}>${formatHour(hour)}</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="editTaskCategory">Category</label>
                        <select id="editTaskCategory" required>
                            <option value="work" ${task.category === 'work' ? 'selected' : ''}>Work</option>
                            <option value="personal" ${task.category === 'personal' ? 'selected' : ''}>Personal</option>
                            <option value="other" ${task.category === 'other' ? 'selected' : ''}>Other</option>
                        </select>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">Save Changes</button>
                        <button type="button" id="deleteTaskBtn" class="btn btn-danger">Delete Task</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(editModal);
        document.getElementById('editTaskName').focus();
        
        // Close modal event
        const closeEditModalBtn = document.querySelector('.close-edit-modal');
        closeEditModalBtn.addEventListener('click', () => {
            document.body.removeChild(editModal);
        });
        
        // Submit form event
        const editTaskForm = document.getElementById('editTaskForm');
        editTaskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const taskId = document.getElementById('editTaskId').value;
            const name = document.getElementById('editTaskName').value;
            const day = document.getElementById('editTaskDay').value;
            const hour = document.getElementById('editTaskTime').value;
            const category = document.getElementById('editTaskCategory').value;
            
            // Remove old task and add updated one
            removeTask(taskId);
            
            // Check for collisions
            if (!addTask(name, day, hour, category)) {
                // If collision, add the original task back
                addTask(task.name, task.day, task.hour, task.category);
                alert('This time slot is already occupied!');
                return;
            }
            
            document.body.removeChild(editModal);
        });
        
        // Delete task event
        const deleteTaskBtn = document.getElementById('deleteTaskBtn');
        deleteTaskBtn.addEventListener('click', () => {
            const taskId = document.getElementById('editTaskId').value;
            removeTask(taskId);
            document.body.removeChild(editModal);
        });
    }
    
    // Drag and Drop Functions
    function handleDragStart(e) {
        const taskElement = e.target.closest('.task-block');
        if (!taskElement) return;
        
        // Set task data for transfer
        e.dataTransfer.setData('text/plain', taskElement.dataset.taskId);
        e.dataTransfer.effectAllowed = 'move';
        
        // Add dragging class
        taskElement.classList.add('dragging');
        
        // Store reference to the current dragging task
        currentDragTask = taskElement;
        
        // Add some delay for visual effect with scaling
        setTimeout(() => {
            taskElement.style.opacity = '0.8';
            taskElement.style.transform = 'scale(1.05)';
            taskElement.style.zIndex = '100';
            taskElement.style.boxShadow = '10px 10px 20px var(--dark-shadow)';
        }, 0);
    }
    
    function handleDragEnd(e) {
        const taskElement = e.target.closest('.task-block');
        if (!taskElement) return;
        
        // Remove dragging styles
        taskElement.classList.remove('dragging');
        taskElement.style.opacity = '1';
        taskElement.style.transform = 'scale(1)';
        taskElement.style.zIndex = '10';
        taskElement.style.boxShadow = '3px 3px 6px var(--dark-shadow)';
        
        // Add bounce animation on successful drop
        if (taskElement.getAttribute('data-dropped') === 'true') {
            taskElement.style.animation = 'bounce 0.5s ease';
            setTimeout(() => {
                taskElement.style.animation = '';
                taskElement.removeAttribute('data-dropped');
            }, 500);
        }
        
        // Clear reference
        currentDragTask = null;
        
        // Remove highlighting from all cells
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('drop-active');
        });
    }
    
    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }
    
    function handleDragEnter(e) {
        e.preventDefault();
        // Highlight drop target
        const cell = e.target.closest('.cell');
        if (cell) {
            cell.classList.add('drop-active');
        }
    }
    
    function handleDragLeave(e) {
        // Remove highlight when leaving
        const cell = e.target.closest('.cell');
        if (cell) {
            cell.classList.remove('drop-active');
        }
    }
    
    function handleDrop(e) {
        e.preventDefault();
        
        // Get drop target (cell)
        const cell = e.target.closest('.cell');
        if (!cell) return;
        
        // Remove highlight
        cell.classList.remove('drop-active');
        
        // Get task ID from dataTransfer
        const taskId = e.dataTransfer.getData('text/plain');
        if (!taskId) return;
        
        // Get new day and hour from the cell
        const newDay = cell.dataset.day;
        const newHour = cell.dataset.hour;
        
        // Update task position
        const success = updateTaskPosition(taskId, newDay, newHour);
        
        // If collision, show feedback
        if (!success && currentDragTask) {
            currentDragTask.classList.add('shake');
            setTimeout(() => {
                currentDragTask.classList.remove('shake');
            }, 500);
        } else if (success && currentDragTask) {
            // Mark as successfully dropped for bounce animation
            currentDragTask.setAttribute('data-dropped', 'true');
            
            // Show cell glow effect
            const glowEffect = document.createElement('div');
            glowEffect.className = 'cell-glow';
            cell.appendChild(glowEffect);
            
            setTimeout(() => {
                cell.removeChild(glowEffect);
            }, 800);
        }
    }
    
    // Event Listeners
    newTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('taskName').value;
        const day = document.getElementById('taskDay').value;
        const hour = document.getElementById('taskTime').value;
        const category = document.getElementById('taskCategory').value;
        
        const success = addTask(name, day, hour, category);
        
        if (success) {
            newTaskForm.reset();
        } else {
            alert('This time slot is already occupied!');
        }
    });
    
    modalTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('modalTaskName').value;
        const day = document.getElementById('modalTaskDay').value;
        const hour = document.getElementById('modalTaskTime').value;
        const category = document.getElementById('modalTaskCategory').value;
        
        const success = addTask(name, day, hour, category);
        
        if (success) {
            modalTaskForm.reset();
            newTaskModal.classList.remove('active');
        } else {
            alert('This time slot is already occupied!');
        }
    });
    
    getStartedBtn.addEventListener('click', () => {
        document.querySelector('.calendar-section').scrollIntoView({ 
            behavior: 'smooth' 
        });
    });
    
    clearTasksBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all tasks?')) {
            clearAllTasks();
        }
    });
    
    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        isDarkTheme = document.body.classList.contains('dark-theme');
        localStorage.setItem('darkTheme', isDarkTheme);
    });
    
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
    });
    
    closeModalBtn.addEventListener('click', () => {
        newTaskModal.classList.remove('active');
    });
    
    // Add "New Task" button that shows the modal
    const addTaskBtn = document.createElement('button');
    addTaskBtn.textContent = '+ New Task';
    addTaskBtn.className = 'btn btn-primary';
    addTaskBtn.style.marginBottom = '20px';
    addTaskBtn.style.width = '100%';
    
    addTaskBtn.addEventListener('click', showNewTaskModal);
    
    const calendarSection = document.querySelector('.calendar-section h2');
    calendarSection.insertAdjacentElement('afterend', addTaskBtn);
    
    // Check for window resize to handle responsive layout
    window.addEventListener('resize', handleResponsiveLayout);
    handleResponsiveLayout(); // Initial check
    
    function handleResponsiveLayout() {
        const mobileAccordion = document.querySelector('.mobile-accordion');
        if (!mobileAccordion) return;
        
        if (window.innerWidth <= 600) {
            weeklyGrid.style.display = 'none';
            mobileAccordion.style.display = 'block';
            updateMobileView();
        } else {
            weeklyGrid.style.display = 'block';
            mobileAccordion.style.display = 'none';
        }
    }
    
    // Initialize with some sample tasks for demo purposes
    if (tasks.length === 0) {
        addTask('Team Meeting', 1, 10, 'work');
        addTask('Lunch with Alex', 3, 12, 'personal');
        addTask('Gym Session', 5, 17, 'personal');
        addTask('Project Deadline', 4, 15, 'work');
        addTask('Doctor Appointment', 2, 14, 'other');
    }
});
