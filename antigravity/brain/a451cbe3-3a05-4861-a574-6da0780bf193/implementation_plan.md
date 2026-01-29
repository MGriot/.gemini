# Plan for Verifying Login in Docker Environment

This plan outlines the steps to build and run the SynapsePlan application using Docker Compose and verify the authentication (login/registration) flows.

## Proposed Changes

No code changes are expected, but the environment will be prepared and tested.

## Verification Plan

### Manual Verification

#### 1. Build and Start Docker Containers
- Run `docker-compose up --build -d` in the root directory.
- Verify all containers (`db`, `backend`, `nginx`) are running: `docker-compose ps`.
- Check backend logs to ensure migrations ran and the server started: `docker-compose logs backend`.

#### 2. Verify Backend API Accessibility
- Access `http://localhost/api/docs` in the browser or via `curl`.
- Verify the FastAPI documentation is visible.

#### 3. Test Registration and Login (Browser)
- Open `http://localhost` in the browser.
- Navigate to the registration page.
- Create a new user with a test email and password.
- Verify successful registration and redirection (or message).
- Attempt to login with the new credentials.
- Verify successful login (access to dashboard).

#### 4. Test Login with Admin Credentials
- Attempt to login with:
    - **Email**: `matteo.griot@gmail.com`
    - **Password**: `password123`
- Verify successful login and access to admin/dashboard features.

#### 5. Cleanup
- Stop and remove containers: `docker-compose down`.
