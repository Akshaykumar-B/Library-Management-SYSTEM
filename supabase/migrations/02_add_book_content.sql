/*
# Add Book Content Field

## Changes
- Add `content` field to books table to store book text/description
- Add `cover_image` field for book cover (optional)
- Update existing books with sample content

## Notes
- Content field stores the book's text content for reading
- This allows users to read books after borrowing them
*/

-- Add content and cover_image columns to books table
ALTER TABLE books ADD COLUMN IF NOT EXISTS content text;
ALTER TABLE books ADD COLUMN IF NOT EXISTS cover_image text;

-- Update existing books with sample content
UPDATE books SET content = 'This comprehensive guide covers fundamental algorithms and data structures used in computer science. Topics include sorting algorithms, graph algorithms, dynamic programming, and complexity analysis. Perfect for students and professionals looking to strengthen their algorithmic thinking.' WHERE book_id = 'BK001';

UPDATE books SET content = 'A handbook of agile software craftsmanship. Learn how to write code that is clean, maintainable, and elegant. This book covers naming conventions, functions, comments, formatting, error handling, and much more. Essential reading for any serious programmer.' WHERE book_id = 'BK002';

UPDATE books SET content = 'Elements of Reusable Object-Oriented Software. This classic book describes 23 design patterns that experienced object-oriented software developers use. Each pattern describes a problem, a solution, when to apply the solution, and its consequences.' WHERE book_id = 'BK003';

UPDATE books SET content = 'From journeyman to master. This book covers topics ranging from personal responsibility and career development to architectural techniques for keeping your code flexible and easy to adapt and reuse. Filled with practical advice for programmers.' WHERE book_id = 'BK004';

UPDATE books SET content = 'A practical handbook of software construction. This book synthesizes the most effective techniques and must-know principles into clear, pragmatic guidance. Topics include design, coding, debugging, and testing.' WHERE book_id = 'BK005';

UPDATE books SET content = 'Improving the design of existing code. Learn how to improve the design of existing code through refactoring. This book explains the principles and best practices of refactoring, and shows you when and how to apply them.' WHERE book_id = 'BK006';

UPDATE books SET content = 'A brain-friendly guide to design patterns. This book uses a visually rich format designed for the way your brain works. You will learn the important patterns used by developers to create functional, elegant, reusable, and flexible software.' WHERE book_id = 'BK007';

UPDATE books SET content = 'Unearthing the good parts of JavaScript. This book provides a thorough look at the good parts of JavaScript, including syntax, objects, functions, inheritance, arrays, and more. Learn to write better JavaScript code.' WHERE book_id = 'BK008';

UPDATE books SET content = 'A deep dive into JavaScript. This book series dives deep into the core mechanisms of the JavaScript language. Learn about scope, closures, this keyword, object prototypes, async patterns, and much more.' WHERE book_id = 'BK009';

UPDATE books SET content = 'A modern introduction to programming. This book teaches JavaScript by having you write real programs. It covers the basics of programming, as well as more advanced topics like object-oriented programming and regular expressions.' WHERE book_id = 'BK010';
