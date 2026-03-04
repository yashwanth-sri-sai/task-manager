AI Development Guidelines

Architecture
- Follow layered architecture: routes → services → models → database.

Backend Rules
- Use Flask REST APIs.
- Validate inputs using Marshmallow.
- Prevent invalid states (e.g., completing a task twice).

Frontend Rules
- Use React functional components.
- Keep API calls inside a service layer.

Code Quality
- Keep functions small and readable.
- Prefer maintainable code over complex logic.