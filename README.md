# UTasks

A simplified Trello clone: a Vue 3 front-end that consumes the existing [UTasks API](https://utasks-026af75f15a3.herokuapp.com/docs/).

This is deliverable 1. All the code is in `frontend/`; deliverable 2 will add `backend/`.

## Getting started

**Prerequisites:** Node.js 22.18+ or 24.12+ (tested with 24.21) and npm, plus Google Chrome.

```bash
cd frontend
npm install
npm run dev
```

Then open **http://localhost:5173**.

The first API call can take several seconds if the Heroku server is asleep.

To test on a real phone or tablet on the same network, run `npm run dev -- --host` and open the "Network" URL it prints.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Serve the production build |
| `npm run lint` | Run oxlint and ESLint |
| `npm run format` | Format the code with Prettier |

## How to test each feature

To test iPad and iPhone in Chrome, open DevTools (F12) and toggle the device toolbar (Ctrl+Shift+M). **Reload the page after switching device** so that touch input is detected.

| # | Feature | Points | How to test |
| --- | --- | --- | --- |
| 1 | Create a user | /3 | Click **Create one** and choose a username. The next screen shows your user ID. An existing username shows an error on the field. |
| 2 | Log in | | Click **Log out**, then log in with the username (not case-sensitive). The session survives a reload. Opening `/boards` while logged out redirects to the login page. See [Known limitations](#known-limitations) for logging in from another browser. |
| 3 | Create boards | /5 | On **My boards**, click **Create a board** or **New board**. Boards are shown in a grid. |
| 4 | Create a list | /5 | Open a board and click **Add a list**. |
| 5 | Create a card | /5 | In a list, click **Add a card**. All the fields are required by the API. Choose a past date to see the overdue highlight. |
| 6 | View boards, lists and cards | /3 | The board shows its lists as columns with horizontal scrolling. On iPhone, the columns snap into place when swiping. |
| 7 | Edit | /5 | Click a board title or a list title to rename it (Enter saves, Esc cancels). Use the pencil icon on **My boards** to edit a board and its description. Click a card to open its details. |
| 8 | Delete | /3 | Use the trash icons on boards and lists, and **Delete** in the card details. Each one asks for confirmation. |
| 9 | Drag cards between lists | /20 | Drag a card to another list, including an empty one, then reload: the change persists. **On touch screens, hold the card for a moment before moving it**; a quick swipe scrolls instead. Drag near the screen edge to scroll to the next column. |
| 10 | Reorder lists | /20 | Drag a list by its **dotted handle**, left of its title, for example to swap lists 1 and 3. Reload: the order persists. |
| 11 | Sort cards | /15 | Use the **Sort** selector of a list: Manual, Priority, Due date, or Priority then due date. The button next to it reverses the direction. Each list has its own sort. While a sort is active, cards cannot be reordered inside the list but can still move to another list. |
| 12 | Error handling | /8 | See below. |

**Testing error handling (12):**

- **Validation:** submit a form that is empty or too long. For example, a card description has a limit of 30 characters.
- **Offline:** in DevTools, set Network to **Offline**. A banner appears, and failed actions show a toast. Moving a card puts it back in its original list.
- **Server errors:** in the DevTools Network panel, block a request or override its response with a 500. Loading errors show a **Try again** button.
- **Not found:** open `/boards/unknown` or `/nope`.
- **Loading and empty states:** throttle the network to see the skeletons, and use a new account to see "No boards yet".

## Technical choices

- **Stack:** Vue 3 with `<script setup>`, TypeScript, Vite, vue-router, Pinia and axios.
- **Drag and drop:** `vuedraggable@next` (SortableJS), which handles touch input.
- **`src/api/`:** one file per resource, plus `client.ts`, the shared axios instance. Its interceptor turns every failure into an `ApiError` with an English message.
- **`src/stores/`:** the only callers of the API layer for boards, lists and cards. Components call store actions.
- **Optimistic moves:** a dragged card moves at once. If the API refuses, only that card goes back and a toast explains why. A card being saved cannot be dragged again, which rules out overlapping updates.
- **Sorting:** a pure function (`utils/cardSort.ts`) computes the displayed order, so the manual order is kept and restored when going back to Manual. In "Priority then due date", the direction applies to the priority, and ties always show the earliest due date first.
- **Form limits:** the API returns a 500 for some values that are too long, so forms check them first. The observed limits are in [docs/API_NOTES.md](docs/API_NOTES.md).

## Known limitations

These all come from what the API offers. Details are in [docs/API_NOTES.md](docs/API_NOTES.md).

- **Logging in on another browser or device needs the user ID.** The API has no login endpoint, no lookup by username and no way to list users. Accounts are therefore remembered in the browser's `localStorage` when they are created or first used. To log in where the username is not known, the form asks once for the user ID shown after registration. After that, the username is enough on that browser.
- **The order of the lists is stored locally.** The API has no `position` or `order` field, so the order is kept in `localStorage`, per board. The same goes for the manual order of cards inside a list and for each list's sort selection. These do not follow the user to another browser. In contrast, moving a card to another list is saved through the API.
- **No real security.** The API has no authentication and does not check ownership. The route guard and the "my boards" filter are client-side only.
- **Card fields are all required by the API.** Description (1 to 30 characters), priority and due date must be filled in, so there is no title-only quick add.
- **Network errors in the console.** The app logs nothing itself and handles every failed call, but Chrome always prints a "Failed to load resource" line for a failed request. It can appear for an expected error, such as a username already taken.
- **Drag and drop has no keyboard alternative.**
