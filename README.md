# FrontendProjectTrello

FrontendProjectTrello is a web application designed to mimic the core functionalities of Trello. It allows users to manage projects by creating boards, which can contain multiple columns (lists), and within those columns, users can add, manage, and reorder tasks. The application features a responsive design, drag-and-drop capabilities for columns and tasks, user authentication, and a theme toggle for light/dark mode.

## Features

*   **User Authentication:** Secure registration and login for users.
*   **Board Management:**
    *   Create new boards.
    *   View a list of all created boards.
    *   Edit board names.
    *   Delete boards (along with their columns and tasks).
*   **Column Management:**
    *   Add new columns to a board.
    *   Edit column titles.
    *   Delete columns (along with their tasks).
    *   Drag-and-drop reordering of columns within a board.
*   **Task Management:**
    *   Add new tasks to a column.
    *   Edit task content.
    *   Delete tasks.
    *   Drag-and-drop reordering of tasks within a column.
    *   Drag-and-drop tasks between different columns.
*   **Drag & Drop Interface:** Intuitive drag-and-drop for reordering tasks and columns, powered by `react-dnd`.
*   **State Management:** Centralized state management using Redux Toolkit, with dedicated slices for authentication, boards, columns, and tasks.
*   **Responsive Design:** UI adapts to different screen sizes.
*   **Theme Toggling:** Switch between light and dark themes.
*   **Protected Routes:** Board and task functionalities are accessible only to authenticated users.
*   **Optimistic Updates:** UI updates immediately for a smoother user experience, with changes persisted to the backend.

## Technologies Used

*   **Frontend:**
    *   React 19
    *   Vite (Build Tool & Dev Server)
    *   React Router DOM (v7) for routing
    *   Redux Toolkit (for state management)
    *   React DnD (for drag and drop functionality)
    *   Axios (for API communication)
*   **Styling:**
    *   CSS Modules
    *   Global CSS with CSS Variables for theming
*   **Linting & Formatting:**
    *   ESLint
    *   Prettier
*   **Language:** JavaScript (JSX)

##  Prerequisites

*   Node.js (v18.x or higher recommended)
*   npm (or yarn)
*   A running backend API server. This project is configured to communicate with a backend at `http://localhost:8080`. Ensure your backend is running and accessible at this address.

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Arnatik76/FrontendProjectTrello
    cd FrontendProjectTrello
    ```

2.  **Navigate to the project directory:**
    The React project itself is within the `trello` subdirectory.
    ```bash
    cd trello
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    ```

4.  **Set up Environment Variables (if any):**
    *   Currently, the API base URL is hardcoded in `src/services/api.js`. If you need to change it, you can modify it there or implement environment variable handling (e.g., using `.env` files with Vite).

5.  **Ensure your backend API is running:**
    The application expects the backend to be available at `http://localhost:8080`.

## Available Scripts

Inside the `trello` directory, you can run the following scripts:

*   **`npm run dev` or `yarn dev`**
    Runs the app in development mode using Vite. Open [http://localhost:5173](http://localhost:5173) (or the port Vite assigns) to view it in your browser. The page will reload if you make edits.

*   **`npm run build` or `yarn build`**
    Builds the app for production to the `dist` folder. It correctly bundles React in production mode and optimizes the build for the best performance.

*   **`npm run lint` or `yarn lint`**
    Lints the project files using ESLint to check for code quality and style issues.

*   **`npm run preview` or `yarn preview`**
    Serves the production build locally. This is a good way to test the production build before deploying.

## 📂 Project Structure

The main application code resides in the `trello/src` directory:
* `trello/`
  * `public/` # Static assets (e.g., vite.svg)
  * `src/`
    * `auth/` # Authentication components (LoginForm, RegisterForm) and styles
    * `components/` # Reusable UI components (Board, Column, Task, ThemeToggle, etc.)
    * `contexts/` # React contexts (ThemeContext)
    * `pages/` # Page-level components (HomePage, BoardPage)
    * `routes/` # Application routing setup (AppRoutes)
    * `services/` # API communication layer (api.js)
    * `store/` # Redux store setup
      * `slices/` # Redux slices (auth, boards, columns, tasks)
      * `index.js` # Store configuration
      * `selectors.js` # Redux selectors for accessing state
    * `App.cssq` # Global app styles (some legacy styles)
    * `App.jsxq` # Root App component
    * `index.cssq` # Global base styles and theme variables
    * `main.jsxq` # Main entry point, renders the App
  * `.eslintrc.config.js` # ESLint configuration
  * `index.html` # Main HTML page for Vite
  * `package.json` # Project dependencies and scripts
  * `vite.config.js` # Vite configuration
