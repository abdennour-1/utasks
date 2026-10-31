# UTasks API notes

- **Base URL:** `https://utasks-026af75f15a3.herokuapp.com`
- **Spec source:** OpenAPI 3.0.0 embedded in `/docs/swagger-ui-init.js` (`/swagger.json` and `/api-docs` return 404).
- **Verified:** every behaviour marked "observed" comes from live calls made on 2026-10-30.

## Key takeaways

| Topic | Finding | Consequence for the front-end |
| --- | --- | --- |
| Login | **No login endpoint.** No lookup by username: `GET /api/users/{id}` only accepts an id, and the 409 from register does not return one. | Logging in with only a username cannot be done through the API (see "Login options"). |
| Auth | No token, header or session. Ids in the URL/body are enough, and ownership is not checked. | The route guard and "my boards" are client-side only. |
| List order | **No `position`/`order` field.** Extra fields are silently dropped. | Order stored in `localStorage`, per board. |
| Card order | **No `position`/`order` field either.** | The list change is persisted by the API; the order inside a list is stored in `localStorage`. |
| Card updates | `PUT /api/cards/{id}` **requires every field**, despite the spec implying partial updates. | Always send the full card, even for a drag and drop. |
| Card fields | `description`, `dueDate` and `priority` are **all required**. | No title-only quick add: the form must collect all of them. |

## Response format

```jsonc
// Success
{ "success": true, "data": { /* object or array */ }, "message": "..." }
// DELETE success: no data
{ "success": true, "message": "..." }
// Error: an array of errors. A single field can produce several entries.
{ "success": false, "errors": [{ "message": "...", "field": "name" }] }
```

`field` is only present on validation errors. Many messages are just `"Invalid value"`, so the client needs its own validation messages.

## Endpoints

| Method | Path | Body | Success | Errors |
| --- | --- | --- | --- | --- |
| POST | `/api/users/register` | `{ username }` | 201 `User` | 400, 409 duplicate |
| GET | `/api/users/{id}` | | 200 `User` | 400, 404 |
| DELETE | `/api/users/{id}` | | 200 | 400, 404 |
| POST | `/api/boards` | `{ name, userId, description? }` | 201 `Board` | 400, 404 user |
| GET | `/api/boards/user/{userId}` | | 200 `Board[]` | 400, 404 user |
| GET | `/api/boards/{id}` | | 200 `Board` | 400, 404 |
| PUT | `/api/boards/{id}` | `{ name, description? }` | **201** `Board` (observed) | 400, 404 |
| DELETE | `/api/boards/{id}` | | 200 | 400, 404 |
| POST | `/api/lists` | `{ name, boardId }` | 201 `List` | 400, 404 board |
| GET | `/api/lists/board/{boardId}` | | 200 `List[]` | 400, 404 board |
| GET | `/api/lists/{id}` | | 200 `List` | 400, 404 |
| PUT | `/api/lists/{id}` | `{ name, boardId }` | **201** `List` (observed) | 400, 404 |
| DELETE | `/api/lists/{id}` | | 200 | 400, 404 |
| POST | `/api/cards` | `{ title, description, listId, dueDate, priority }` | 201 `Card` | 400, 404 list |
| GET | `/api/cards/list/{listId}` | | 200 `Card[]` | 400, 404 list |
| GET | `/api/cards/{id}` | | 200 `Card` | 400, 404 |
| PUT | `/api/cards/{id}` | `{ title, description, listId, dueDate, priority, isCompleted }` | **201** `Card` (observed) | 400, 404 |
| DELETE | `/api/cards/{id}` | | 200 | 400, 404 |
| GET | `/api/health` | | 200 | |

The spec documents 200 for `PUT`; the server actually answers 201. Treat any 2xx as success.

## Models

```ts
interface User  { id: string; username: string }
interface Board { id: string; name: string; userId: string; description?: string }
interface List  { id: string; name: string; boardId: string }
interface Card  {
  id: string;
  title: string;
  description: string;
  listId: string;
  dueDate: string;      // ISO 8601, e.g. "2030-01-01T00:00:00.000Z"
  priority: 1 | 2 | 3;  // 1 = Low, 2 = Medium, 3 = High
  isCompleted: boolean; // false on creation, required on PUT
}
```

## Field limits (observed)

| Field | Min | Longest accepted | Note |
| --- | --- | --- | --- |
| `username` | 3 | no limit found (5000 OK) | Below 3: 400 |
| `board.name` | 3 | 100 | 101: **500**, not 400 |
| `board.description` | none | 500 tested OK | 1000: **500**. Empty string OK when sent with `name` |
| `list.name` | 3 | 50 | 51: **500**, not 400 |
| `card.title` | 3 | 101 tested OK | 255: **500** |
| `card.description` | 1 | **30** | 31: 400. Empty string: 400 |
| `card.dueDate` | | | ISO 8601 required. `2030-01-01` is accepted and normalized. Past dates are accepted |
| `card.priority` | | | 1, 2 or 3 |

Some limits only surface as a 500, so the forms have to enforce them before sending.

## Other observed behaviour

- **Read order:** `GET` on boards, lists and cards returns newest first, by creation. Updating or moving an item does not change this order.
- **Moving a card:** `PUT` with the full card and a new `listId` works, and the card appears in the target list.
- **Invalid `listId` on update:** `PUT /api/cards/{id}` accepts a non-existent list id (201) and leaves the card orphaned, so the client must only send known list ids. `POST` does check it (404).
- **Cascades:** deleting a list deletes its cards. Deleting a board deletes its lists and cards. Deleting a user deletes their boards.
- **Whitespace-only names:** a board name of spaces returns a **500**, so the client must trim before validating.
- **Server messages:** not always accurate (`DELETE /api/cards/{id}` answers "List deleted successfully"), so success toasts use client-side text.
- **Malformed id:** 400 `Invalid ID format`. Valid format but unknown id: 404. Unknown route: 404.
- **CORS:** `Access-Control-Allow-Origin: *`, with GET, POST, PUT and DELETE. No dev proxy needed.

## Login options

The only documented ways to get a user's id are the register response and already knowing the id.

**Chosen approach, pending confirmation:** keep a `username -> id` directory in `localStorage`, filled at registration. Login looks the username up, then verifies the id with `GET /api/users/{id}`. If the username is unknown on this browser, the form offers a "User ID" field, and the id is displayed after registration so it can be copied.

**Known limitation:** an account created on another browser or device needs its user ID the first time it logs in on a new one.
