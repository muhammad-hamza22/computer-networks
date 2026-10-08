# University Research Opportunity Portal

A web application where faculty members can post, view, update, close and delete research opportunities in one place.
Built for the Computer Networks course.

**GitHub Repository:** https://github.com/muhammad-hamza22/computer-networks

**Author:** Muhammad Hamza

## Tech stack

- **Backend:** Node.js with Express (REST API)
- **Database:** MySQL
- **Frontend:** HTML, CSS and JavaScript (talks to the API with `fetch`)
- **API testing:** Bruno

## Project structure

```
backend/              Express REST API (server.js, .env.example)
frontend/             index.html (the web interface)
database/             schema.sql (database and table setup)
research-portal-api/  Bruno collection (API tests)
```

## Prerequisites

- Node.js (LTS)
- MySQL Server 8.0
- A browser (Chrome recommended)

## Setup and run

1. **Clone the repository**
```bash
   git clone https://github.com/muhammad-hamza22/computer-networks.git
   cd computer-networks
```

2. **Create the database.** Open MySQL Workbench, connect to your local server, open `database/schema.sql` and run it. This creates the `research_portal` database and the `opportunities` table.

3. **Install the backend libraries**
```bash
   cd backend
   npm install
```

4. **Create your `.env` file.** Copy `backend/.env.example` to `backend/.env` and put your own MySQL root password in `DB_PASSWORD`:
```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=research_portal
   PORT=3000
```
   The `.env` file is ignored by Git, so your password is never uploaded.

5. **Start the backend**
```bash
   node server.js
```
   You should see `Server running on http://localhost:3000`.

6. **Open the frontend.** Double-click `frontend/index.html` to open it in your browser. The backend must be running.

## API endpoints

| Method | Endpoint | Purpose | Success code |
|---|---|---|---|
| POST | `/api/opportunities` | Create an opportunity | 201 |
| GET | `/api/opportunities` | Get all opportunities | 200 |
| GET | `/api/opportunities/:id` | Get one opportunity | 200 |
| PUT | `/api/opportunities/:id` | Update an opportunity (send only the fields to change) | 200 |
| DELETE | `/api/opportunities/:id` | Delete an opportunity | 200 |

Error codes: **400** invalid or missing data, **404** opportunity not found, **500** server error.

A health check is available at `GET /api/health`.

## Testing with Bruno

Open Bruno, choose **Open Collection**, and select the `research-portal-api` folder. It contains requests for create (3), get all, get one, update, close, delete, get deleted (404) and invalid data (400). Start the backend first.

## Frontend features

- List all opportunities and view full details
- Create a new opportunity with form validation
- Edit an existing opportunity
- Close an opportunity (Open to Closed)
- Delete an opportunity (with confirmation)
- Success and error messages