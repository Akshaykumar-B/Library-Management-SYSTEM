# Library Management System - User Guide

## 🎯 How to View the Website as Different Roles

### First Time Setup

#### 1. **Creating the Owner/Admin Account (Staff)**
The **first user** who registers will automatically become a **Staff** (Admin/Owner) with full permissions.

**Steps:**
1. Open the website
2. Click on "Sign Up" tab
3. Enter a username (e.g., "admin")
4. Enter a password
5. Click "Sign Up"
6. ✅ You are now logged in as **Staff** (Owner/Admin)

**Staff Badge:** You'll see a blue badge showing "staff" next to your username in the header.

**Staff Permissions:**
- ✅ View all books
- ✅ Borrow unlimited books
- ✅ Add, edit, and delete books
- ✅ Manage all users
- ✅ Change user roles
- ✅ View all transactions

---

#### 2. **Creating a Student Account**
Any user who registers **after the first user** will be a **Student** by default.

**Steps:**
1. Sign out from the staff account (click the logout button in header)
2. Click on "Sign Up" tab
3. Enter a different username (e.g., "student1")
4. Enter a password
5. Click "Sign Up"
6. ✅ You are now logged in as **Student**

**Student Badge:** You'll see a gray badge showing "student" next to your username in the header.

**Student Permissions:**
- ✅ View all books
- ✅ Borrow up to **3 books**
- ✅ Return borrowed books
- ✅ Read borrowed books
- ✅ View personal transaction history
- ❌ Cannot add/edit/delete books
- ❌ Cannot manage users

---

#### 3. **Creating a Teacher Account**
Teachers need to be promoted by a Staff member.

**Steps:**
1. Create a regular account (it will be a Student by default)
2. Ask a Staff member to promote you to Teacher
3. Staff goes to "Admin Users" page
4. Staff changes your role from "student" to "teacher"
5. ✅ You are now a **Teacher**

**Teacher Badge:** You'll see a secondary-colored badge showing "teacher" next to your username.

**Teacher Permissions:**
- ✅ View all books
- ✅ Borrow up to **5 books**
- ✅ Return borrowed books
- ✅ Read borrowed books
- ✅ View personal transaction history
- ❌ Cannot add/edit/delete books
- ❌ Cannot manage users

---

## 📚 How to Add Books (Staff Only)

**Steps:**
1. Log in as **Staff**
2. Click on "Admin Books" in the navigation menu
3. Click the **"Add Book"** button (top right)
4. Fill in the book details:
   - **Book ID**: Unique identifier (e.g., BK011)
   - **Title**: Book title
   - **Author**: Author name
   - **Stock**: Number of copies available
   - **Book Content**: The actual text content users can read (multiple paragraphs/chapters)
5. Click **"Add Book"**
6. ✅ Book is now available in the catalog

---

## 📖 How to Read Books

**Steps:**
1. Go to "Book Catalog"
2. Find a book with available stock
3. Click **"Borrow"** button
4. Go to "My Borrows" page
5. Click **"Read Book"** button on any borrowed book
6. A reading window will open with the book content
7. Scroll to read the entire book

---

## 🔄 How to Switch Between Roles (Testing)

To test the system with different roles:

### Method 1: Use Multiple Browser Windows
1. Open the website in a **normal browser window** → Sign in as Staff
2. Open the website in an **incognito/private window** → Sign in as Student
3. Now you can see both views side-by-side

### Method 2: Sign Out and Sign In
1. Click the **logout button** in the header
2. Sign in with a different account
3. The header badge will show your current role

---

## 🎨 Visual Role Indicators

The system shows your current role in the header:

- **Staff**: Blue badge with "staff" text
- **Teacher**: Secondary-colored badge with "teacher" text  
- **Student**: Gray outlined badge with "student" text

---

## 📊 Role Comparison Table

| Feature | Student | Teacher | Staff |
|---------|---------|---------|-------|
| View Books | ✅ | ✅ | ✅ |
| Borrow Books | ✅ (max 3) | ✅ (max 5) | ✅ (unlimited) |
| Return Books | ✅ | ✅ | ✅ |
| Read Books | ✅ | ✅ | ✅ |
| Add/Edit/Delete Books | ❌ | ❌ | ✅ |
| Manage Users | ❌ | ❌ | ✅ |
| View All Transactions | ❌ | ❌ | ✅ |

---

## 🔐 Login Format

**Username Format:** Just enter your username (e.g., "admin", "student1")
- The system automatically converts it to email format internally
- You don't need to type "@miaoda.com"

**Example:**
- Username: `admin`
- Password: `your_password`

---

## 💡 Tips

1. **First user is always Staff** - Make sure to create your admin account first
2. **Role badges are color-coded** - Easy to identify your current role
3. **Book content can be long** - Add realistic book content with chapters
4. **Borrow limits are enforced** - Students can't borrow more than 3 books
5. **Staff can change roles** - Use Admin Users page to promote users

---

## 🚀 Quick Start Guide

### For Staff (Admin/Owner):
1. Register as the first user
2. Add books via "Admin Books"
3. Manage users via "Admin Users"
4. View all transactions

### For Students:
1. Register an account
2. Browse "Book Catalog"
3. Borrow books (max 3)
4. Read books in "My Borrows"
5. Return books when done

### For Teachers:
1. Register an account
2. Ask staff to promote you
3. Borrow books (max 5)
4. Same features as students, just higher limit

---

## 📞 Need Help?

- Check the header badge to confirm your current role
- Staff members can change user roles in "Admin Users"
- All borrowed books can be read by clicking "Read Book" button
- Book content is displayed in a scrollable reading window
