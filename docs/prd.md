# Library Management System Requirements Document
\n## 1. Application Overview\n
### 1.1 Application Name
Library Management System

### 1.2 Application Description
A web-based library management system that enables users to borrow and return books while allowing library staff to manage book inventory and track transactions. The system supports different user roles with specific permissions and borrowing rules. Users can open and read borrowed books online with access to full page content and take personal notes. The system tracks active user sessions and displays real-time login statistics.

### 1.3 Application Type
Web Application

## 2. Core Features

### 2.1 Book Management
- Display book catalog with detailed information\n- Track book availability and stock levels
- Update book inventory
- Search and filter books by title, author, or book ID
\n### 2.2 User Role Management
- Student: Limited borrowing privileges
- Teacher: Extended borrowing privileges
- Staff: Full administrative access with inventory management capabilities

### 2.3 User Session Management
- Track currently logged-in users in real-time
- Display total count of active users
- Show list of logged-in usernames with their roles
- Update login status dynamically when users log in or out
- Display user session information on dashboard

### 2.4 Borrowing and Returning
- Book checkout functionality with availability verification
- Book return processing with stock updates\n- Enforce role-based borrowing limits
- Real-time stock tracking

### 2.5 Book Reading
- Open borrowed books to view full content
- Display book pages with readable text and images
- Navigate through book pages (previous/next page)\n- Bookmark current reading position\n- Access borrowed books from personal library

### 2.6 Notebook Management
- Create and save personal notes while reading books
- Edit and delete existing notes
- Associate notes with specific books and page numbers
- View all notes organized by book
- Search notes by keyword or book title

### 2.7 Transaction Records\n- Maintain complete history of all borrow and return transactions
- Display transaction details including user, book, date, and action type
- Track current borrowed books per user

### 2.8 Role-Based Interface Views
- Student/Teacher View: Simplified interface focused on browsing, borrowing, reading books, and managing personal notes\n- Staff View: Comprehensive dashboard with inventory management, user transaction oversight, active user monitoring, and system administration tools
\n## 3. Book Information Structure

### 3.1 Book Attributes
- Book ID: Unique identifier
- Title: Book title
- Author: Book author name
- Stock/Availability: Current available quantity
- Content: Full book content with pages

## 4. User Roles and Permissions

### 4.1 Student
- Can borrow up to 3 books\n- Can view available books
- Can return borrowed books
- Can open and read borrowed books
- Can create, edit, and delete personal notes
- Can view personal transaction history
- Access to student-focused interface

### 4.2 Teacher
- Can borrow up to 5 books
- Can view available books
- Can return borrowed books
- Can open and read borrowed books
- Can create, edit, and delete personal notes
- Can view personal transaction history
- Access to student-focused interface

### 4.3 Staff
- Unlimited borrowing privileges
- Can manage book inventory (add, update, remove books)\n- Can view all user transactions\n- Can update book stock levels\n- Can open and read borrowed books
- Can create, edit, and delete personal notes
- Can view active user sessions and login statistics
- Full system access
- Access to staff administrative dashboard

## 5. Active Users Display

### 5.1 Login Statistics Panel
- Display total number of currently logged-in users
- Show real-time list of active usernames with their roles
- Update automatically when users log in or log out
- Color-coded role indicators: blue for students, green for teachers, orange for staff
\n### 5.2 User Information Display
- Username\n- User role (Student/Teacher/Staff)
- Login timestamp
- Current activity status
\n## 6. Design Style

### 6.1 Color Scheme
- Primary color: Deep blue (#2C3E50) representing knowledge and trust
- Secondary color: Warm orange (#E67E22) for action buttons and highlights
- Background: Light gray (#F5F6FA) for comfortable reading
- Text: Dark gray (#2C3E50) for primary content, medium gray (#7F8C8D) for secondary information
\n### 6.2 Layout Style
- Card-based layout for book displays with clear visual separation\n- Table format for transaction records with alternating row colors
- Sidebar navigation for role-based menu access
- Full-page reader view for book content with minimal distractions
- Split-screen layout for reading with note-taking panel
- Dashboard widget for active users display with live update indicator

### 6.3 Visual Details
- Rounded corners (8px) for cards and buttons creating a modern, friendly appearance
- Subtle shadows (0-2px 8px rgba(0,0,0,0.1)) for depth and hierarchy
- Icon-based navigation with text labels for intuitive interaction
- Responsive grid system adapting to different screen sizes
- Clean typography with comfortable line spacing for reading content
\n### 6.4 Interactive Elements
- Hover effects on buttons with color transition (0.3s ease)
- Status badges with distinct colors: green for available, red for out of stock, blue for borrowed
- Loading indicators for data operations
- Success/error notifications with slide-in animation
- Page navigation controls with smooth transitions
- Reading progress indicator
- Note editor with auto-save functionality
- Live update pulse animation for active user count changes