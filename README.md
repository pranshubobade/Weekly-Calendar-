# Weekly Calendar with Draggable Task Blocks

A fully responsive, interactive, frontend-only weekly calendar application that renders a weekly calendar grid (Monday–Sunday, 9 AM–6 PM view) with draggable task blocks. Users can add, edit, and reschedule tasks via drag-and-drop. Tasks persist in localStorage without requiring a backend.

## Features

- **Interactive Weekly Calendar**: 7-column grid (Mon–Sun) × hourly rows (9 AM–6 PM) with visible gridlines
- **Drag-and-Drop Tasks**: Easily reschedule tasks by dragging them to a new time slot
- **Task Management**: Add, edit, and delete tasks with a simple interface
- **Neumorphic UI Design**: Soft shadows and subtle inset/outset effects for modern look and feel
- **Responsive Layout**: Adapts to different screen sizes, with a mobile-friendly accordion view
- **Dark/Light Theme Toggle**: Switch between light and dark mode with persistent preference
- **Local Storage**: Tasks are saved in your browser's localStorage
- **Statistics Panel**: View task distribution across the week
- **Collision Prevention**: System prevents scheduling two tasks in the same time slot

## Usage

1. **Opening the App**: Simply open `index.html` in any modern web browser
2. **Adding Tasks**: 
   - Click the "+ New Task" button
   - Fill in task details (name, day, time, category)
   - Click "Add Task"
3. **Editing Tasks**:
   - Click on any existing task to edit its details
   - Make changes and click "Save Changes"
   - Or click "Delete Task" to remove it
4. **Rescheduling Tasks**:
   - Drag any task to a new time slot
   - The task will snap to the new position if it's available
   - If the slot is occupied, the task will shake and return to its original position
5. **Clearing All Tasks**:
   - Click "Clear All Tasks" in the footer to remove all tasks

## Accessibility Features

- Keyboard navigation support
- ARIA labels for screen readers
- Focus management for forms and interactive elements
- Color contrast compliance for readability

## Technologies Used

- HTML5
- CSS3 (with Neumorphic styling)
- Vanilla JavaScript
- localStorage API for data persistence
- @dnd-kit libraries for drag and drop functionality

## Project Structure

- `index.html` - Main HTML structure
- `styles.css` - All styling including responsive design and animations
- `script.js` - JavaScript for all functionality and interactivity

## Browser Compatibility

Tested and compatible with:
- Chrome
- Firefox
- Safari
- Edge

## License

This project is open source and available for personal and educational use.
