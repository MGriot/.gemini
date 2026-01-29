# Build Docker and Verify Auth Flows

This plan outlines the steps to build the SynapsePlan application using Docker and verify the login and registration functionalities.

## Proposed Changes

### [Docker]
We will use the existing `docker-compose.yml` to build and run the services.

1.  **Build**: `docker-compose build`
2.  **Up**: `docker-compose up -d`

## Verification Plan

### Automated/Manual Verification via Browser
We will use the browser tool to perform the following steps:

1.  **Verify Root Page**: Navigate to `http://localhost` to ensure the application is served.
2.  **Registration Test**:
    *   Navigate to `/register` (or find the link on the login page).
    *   Create a new user with email `testuser@example.com` and password `TestPassword123!`.
    *   Verify successful redirection or login.
3.  **Login Test (New User)**:
    *   Log out if automatically logged in.
    *   Log in with `testuser@example.com` / `TestPassword123!`.
    *   Verify access to the dashboard/board.
4.  **Admin Login Test**:
    *   Log out.
    *   Log in with `matteo.griot@gmail.com` / `password123` (identified in `fix_password.py`).
    *   Verify admin access (if applicable).

### Troubleshooting
If login fails for the admin account:
*   Check if the user exists in the database.
*   Run `python backend/fix_password.py` within the backend container if necessary to ensure the hash is correct.
