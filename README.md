# Tasks — To-Do Web App

A simple, colorful task manager built with plain HTML, CSS, and JavaScript. No frameworks, no build step — just open `index.html` in a browser.

## Features

- **Three-column layout** — sidebar for navigation, task list in the center, and a detail panel for editing
- **Smart views** — Today, Upcoming, and Completed
- **Custom lists** — create your own lists (e.g. Personal, Work) with color-coded dots
- **Priority levels** — mark tasks High, Medium, or Low, shown as a colored bar on each task
- **Due dates & times** — set a date and time for any task; overdue tasks are flagged
- **Search & filter** — search by task name, or filter the list by priority
- **Stats dashboard** — quick counts for open, due today, overdue, and completed tasks
- **Weekly progress card** — shows the percentage of this week's tasks completed
- **Task details panel** — edit title, notes, list, priority, and due date/time; delete tasks
- **Light & dark mode** — toggle in the sidebar; the app opens in dark mode by default
- **Saved automatically** — tasks, lists, and theme are stored in the browser (`localStorage`), so your data stays after closing the tab

## Files

| File | Purpose |
|---|---|
| `index.html` | Page structure and layout |
| `style.css` | Colors, typography, layout, hover effects, and responsive rules |
| `script.js` | App logic: adding, editing, filtering, and saving tasks |

## Getting started

1. Download all three files into the same folder.
2. Open `index.html` in any modern browser (Chrome, Edge, Firefox, Safari).
3. Start adding tasks — no installation or server required.

Optional: to preview with live reload during editing, use a tool like the VS Code "Live Server" extension and open the folder there instead.

## Notes on data storage

- All data is stored locally in your browser using `localStorage` under the key `tasks-v2` (tasks and lists) and `tasks-theme` (light/dark preference).
- Data does not sync across browsers or devices, and clearing your browser's site data will erase it.
- There is no backend or account system — this is a fully client-side app.

## Customizing

- **Colors:** edit the CSS variables at the top of `style.css` u
