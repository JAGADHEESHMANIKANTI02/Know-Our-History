# Library Management System

A full-stack library management application built with React, TypeScript, Supabase, and Edge Functions.

## Features

- **Authentication**: JWT-based authentication with email/password login and registration
- **Books Management**: Create, read, update, and delete books with filtering by author, availability, and search
- **Authors Management**: Manage book authors with full CRUD operations
- **Users Management**: Create and manage user profiles
- **Borrowing System**: Track book borrowings and returns with due dates
- **Responsive UI**: Clean, modern interface built with Tailwind CSS and Lucide React icons

## Tech Stack

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- Lucide React (icons)
- Supabase JS client

### Backend (Serverless)
- Supabase Edge Functions
- PostgreSQL (Supabase)
- Row Level Security (RLS)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Environment variables configured

### Environment Setup

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Create a `.env` file in the project root with your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project dashboard under Settings > API.

3. Update `.env.example` for documentation purposes (already created with placeholders)

### Running the Application

Development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Database Schema

### Tables

#### `authors`
- `id` (UUID, PK)
- `name` (TEXT)
- `bio` (TEXT)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

#### `books`
- `id` (UUID, PK)
- `title` (TEXT)
- `isbn` (TEXT, UNIQUE)
- `author_id` (UUID, FK)
- `description` (TEXT)
- `published_year` (INTEGER)
- `available` (BOOLEAN)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

#### `profiles`
- `id` (UUID, PK, FK to auth.users)
- `email` (TEXT)
- `full_name` (TEXT)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

#### `borrowings`
- `id` (UUID, PK)
- `book_id` (UUID, FK)
- `user_id` (UUID, FK)
- `borrowed_at` (TIMESTAMPTZ)
- `due_date` (TIMESTAMPTZ)
- `returned_at` (TIMESTAMPTZ, nullable)
- `created_at` (TIMESTAMPTZ)

### Row Level Security

All tables have RLS enabled with the following policies:
- **Authors**: Authenticated users can view, create, update, and delete
- **Books**: Authenticated users can view, create, update, and delete
- **Profiles**: Users can view all profiles, insert their own, and update their own
- **Borrowings**: Authenticated users can view and manage borrowings

## API Endpoints

All endpoints are protected with JWT authentication. Access token is obtained through Supabase auth.

### Authors
- `GET /functions/v1/authors` - List all authors
- `GET /functions/v1/authors/:id` - Get author by ID
- `POST /functions/v1/authors` - Create new author
- `PUT /functions/v1/authors/:id` - Update author
- `DELETE /functions/v1/authors/:id` - Delete author

### Books
- `GET /functions/v1/books` - List books (supports filters: `author_id`, `available`, `search`)
- `GET /functions/v1/books/:id` - Get book by ID
- `POST /functions/v1/books` - Create new book
- `PUT /functions/v1/books/:id` - Update book
- `DELETE /functions/v1/books/:id` - Delete book

### Users
- `GET /functions/v1/users` - List all users
- `GET /functions/v1/users/:id` - Get user by ID
- `POST /functions/v1/users` - Create new user

### Borrowings
- `GET /functions/v1/borrowings` - List borrowings (supports filters: `user_id`, `active_only`)
- `POST /functions/v1/borrowings/borrow` - Borrow a book
- `POST /functions/v1/borrowings/return` - Return a borrowed book

## Authentication Flow

1. **Sign Up**: Create new account with email, password, and full name
   - Supabase Auth creates user in `auth.users`
   - Profile is automatically created in `profiles` table

2. **Sign In**: Login with email and password
   - Returns JWT token stored in Supabase session
   - Token automatically included in API requests

3. **Protected Routes**: All API endpoints require valid JWT token
   - Unauthenticated requests return 401

## Project Structure

```
src/
├── components/
│   ├── Auth/
│   │   ├── Login.tsx
│   │   └── SignUp.tsx
│   └── Dashboard/
│       ├── Dashboard.tsx
│       ├── AuthorsManager.tsx
│       ├── BooksManager.tsx
│       ├── UsersManager.tsx
│       └── BorrowingsManager.tsx
├── contexts/
│   └── AuthContext.tsx
├── lib/
│   ├── supabase.ts
│   └── api.ts
├── types/
│   └── index.ts
├── App.tsx
├── main.tsx
└── index.css
```

## Usage Guide

### Creating an Author
1. Navigate to the "Authors" tab
2. Click "Add Author"
3. Enter author name and biography
4. Click "Create"

### Adding a Book
1. Navigate to the "Books" tab
2. Click "Add Book"
3. Fill in title, ISBN, select author, add description and year
4. Click "Create"
5. Use filters to search by title, author, or availability

### Creating a User
1. Navigate to the "Users" tab
2. Click "Add User"
3. Enter full name, email, and password
4. Click "Create"

### Borrowing and Returning Books
1. Navigate to the "Borrowings" tab
2. To borrow: Click "Borrow Book", select user and available book, set due date
3. To return: Click "Return" on an active borrowing
4. View history of all borrowings in the same tab

## Seed Data

To populate the database with sample data, use Supabase SQL editor:

```sql
-- Insert sample authors
INSERT INTO authors (name, bio) VALUES
('J.R.R. Tolkien', 'Author of The Lord of the Rings'),
('George R.R. Martin', 'Author of A Song of Ice and Fire'),
('J.K. Rowling', 'Author of Harry Potter series'),
('Isaac Asimov', 'Science fiction pioneer and writer');

-- Insert sample books
INSERT INTO books (title, isbn, author_id, description, published_year, available) VALUES
('The Fellowship of the Ring', '978-0-544-92912-3', (SELECT id FROM authors WHERE name = 'J.R.R. Tolkien'), 'The first book in The Lord of the Rings trilogy', 1954, true),
('A Game of Thrones', '978-0-553-10364-8', (SELECT id FROM authors WHERE name = 'George R.R. Martin'), 'The first book in A Song of Ice and Fire series', 1996, true),
('Harry Potter and the Philosophers Stone', '978-0-747-53260-1', (SELECT id FROM authors WHERE name = 'J.K. Rowling'), 'The first book in the Harry Potter series', 1997, true),
('Foundation', '978-0-553-29438-0', (SELECT id FROM authors WHERE name = 'Isaac Asimov'), 'A science fiction masterpiece', 1951, true);
```

## Troubleshooting

### "No authorization header" error
- Ensure you're logged in
- Check that the token is valid in browser DevTools Network tab

### Books not showing after creation
- Verify the author exists
- Check that ISBN is unique
- Ensure all required fields are filled

### Borrowing errors
- Can only borrow available books
- User must exist in system
- Check due_days is a positive number

### CORS errors
- Supabase Edge Functions are pre-configured with proper CORS headers
- If issues persist, verify `.env` values are correct

## Performance Considerations

- Indexes on foreign keys and frequently queried columns
- RLS policies optimized for single-table queries
- Client-side caching could be added for frequently accessed data

## Security Features

- Row Level Security on all tables
- JWT authentication on all API endpoints
- Automatic updated_at timestamp tracking
- Foreign key constraints prevent orphaned records

## Future Enhancements

- Advanced filtering with date ranges and pagination
- Book categories/genres
- User reviews and ratings
- Email notifications for due books
- Reservation system for borrowed books
- Analytics dashboard
- Dark mode support
- Mobile app (React Native)

## Development Notes

### Adding New Endpoints
1. Create new Edge Function in Supabase
2. Add API client method in `src/lib/api.ts`
3. Create UI component in `src/components/`
4. Add TypeScript types in `src/types/index.ts`

### Modifying Database Schema
1. Create migration in Supabase SQL editor
2. Update TypeScript types
3. Update RLS policies if needed
4. Test with client API calls

## Support

For issues or questions:
1. Check Supabase documentation at https://supabase.com/docs
2. Review Edge Functions guide at https://supabase.com/docs/guides/functions
3. Check browser console for error messages
4. Verify database and RLS policies in Supabase dashboard

## License

MIT
