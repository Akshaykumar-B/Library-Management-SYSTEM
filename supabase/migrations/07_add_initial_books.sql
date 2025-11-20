/*
# Add Initial Book Data

## Purpose
- Populate the library with initial book collection
- Provide diverse selection across genres
- Set appropriate stock levels for each book

## Books Added
- 15 books across various genres
- Fiction, Non-fiction, Science, Technology, Literature
- Stock levels: 3-5 copies per book
*/

INSERT INTO books (book_id, title, author, stock, content, cover_image) VALUES
('BK001', 'To Kill a Mockingbird', 'Harper Lee', 5, 'A gripping tale of racial injustice and childhood innocence in the American South.', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400'),
('BK002', '1984', 'George Orwell', 4, 'A dystopian social science fiction novel and cautionary tale about totalitarianism.', 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400'),
('BK003', 'Pride and Prejudice', 'Jane Austen', 3, 'A romantic novel of manners that critiques the British landed gentry at the end of the 18th century.', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400'),
('BK004', 'The Great Gatsby', 'F. Scott Fitzgerald', 5, 'A novel about the American Dream, wealth, and the Jazz Age in 1920s New York.', 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400'),
('BK005', 'Harry Potter and the Sorcerer''s Stone', 'J.K. Rowling', 5, 'The first novel in the Harry Potter series, following a young wizard''s journey.', 'https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=400'),
('BK006', 'The Hobbit', 'J.R.R. Tolkien', 4, 'A fantasy novel about the quest of home-loving Bilbo Baggins.', 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=400'),
('BK007', 'The Catcher in the Rye', 'J.D. Salinger', 3, 'A story about teenage rebellion and alienation narrated by Holden Caulfield.', 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400'),
('BK008', 'The Lord of the Rings', 'J.R.R. Tolkien', 4, 'An epic high-fantasy novel about the quest to destroy the One Ring.', 'https://images.unsplash.com/photo-1621944190310-e3cca1564bd7?w=400'),
('BK009', 'Animal Farm', 'George Orwell', 5, 'An allegorical novella reflecting events leading up to the Russian Revolution.', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400'),
('BK010', 'Brave New World', 'Aldous Huxley', 3, 'A dystopian novel set in a futuristic World State of genetically modified citizens.', 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=400'),
('BK011', 'The Chronicles of Narnia', 'C.S. Lewis', 4, 'A series of fantasy novels set in the magical land of Narnia.', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400'),
('BK012', 'Moby-Dick', 'Herman Melville', 3, 'The narrative of Captain Ahab''s obsessive quest to kill the white whale.', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400'),
('BK013', 'War and Peace', 'Leo Tolstoy', 3, 'A literary work that mixes historical, philosophical and fictional narrative.', 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400'),
('BK014', 'The Odyssey', 'Homer', 4, 'An ancient Greek epic poem about Odysseus''s journey home after the Trojan War.', 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=400'),
('BK015', 'Crime and Punishment', 'Fyodor Dostoevsky', 3, 'A psychological novel about the mental anguish and moral dilemmas of an impoverished student.', 'https://images.unsplash.com/photo-1550399105-c4db5fb85c18?w=400');
