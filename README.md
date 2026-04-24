# -it3030-paf-2026-smart-campus-group_WE_272_4.2

## Member 1 Scope - Facilities Catalogue + Resource Management

### Authentication (temporary demo credentials)
- `admin / admin123` -> role `ADMIN`
- `user / user123` -> role `USER`

All `/api/resources/**` endpoints require authentication. Write operations require `ADMIN`.

### Implemented endpoints
- `POST /api/resources` - create resource (`ADMIN`)
- `GET /api/resources` - list resources with optional filters
- `GET /api/resources/{id}` - get one resource by id
- `PATCH /api/resources/{id}` - partial update (`ADMIN`)
- `DELETE /api/resources/{id}` - soft delete (sets status to `INACTIVE`) (`ADMIN`)

### Filters for catalogue search
Use query params in list endpoint:
- `type` (`LECTURE_HALL`, `LAB`, `MEETING_ROOM`, `EQUIPMENT`)
- `minCapacity` (integer)
- `location` (contains, case-insensitive)
- `status` (`ACTIVE`, `OUT_OF_SERVICE`, `INACTIVE`)
- `availableFrom` (time, `HH:mm:ss`)
- `availableTo` (time, `HH:mm:ss`)

Example:
`GET /api/resources?type=LAB&minCapacity=30&location=building-a&status=ACTIVE&availableFrom=09:00:00&availableTo=16:00:00`

### Resource payload fields
- `name` (required)
- `type` (required enum)
- `capacity` (required, minimum `0`)
- `location` (required)
- `availableFrom` (required for create)
- `availableTo` (required for create, must be later than `availableFrom`)
- `status` (required enum)

### Technical notes
- H2 database configured (`jdbc:h2:mem:campus_hub`)
- H2 console enabled at `/h2-console`
- Standardized error responses for validation failures and not-found cases
- CORS enabled for React client on `http://localhost:5173`

### Frontend (Member 1 UI)
Minimal React client is under `frontend/` and includes:
- login credentials input for basic auth
- list + filtering of resources
- admin create resource form
- admin patch location + deactivate actions

Run frontend:
1. `cd frontend`
2. `npm install`
3. `npm run dev`

Run backend:
1. Ensure Maven is available (`mvn`) or restore Maven wrapper files in `.mvn/wrapper`
2. Start app with `mvn spring-boot:run` (or `./mvnw spring-boot:run` when wrapper is fixed)