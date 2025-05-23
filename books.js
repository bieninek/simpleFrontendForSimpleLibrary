/////////////////////////////////////////////////////////////////////////
/// Books                                                             ///
///                                                                   ///
/// There are sent the following API requests:                        ///
///  GET books/                 OK                                    ///
///  GET books/:id              OK                                    ///
///  DELETE books/:id           OK                                    ///
///  POST books/                OK, dorobic kategorie i publishera    ///
///  PUT books/:id              OK                                    /// 
///                                                                   ///
/////////////////////////////////////////////////////////////////////////

const apiUrl = 'http://localhost:3306/api/books';  // Backend API URL
const apiBaseUrl = 'http://localhost:3306/api';  // Backend API URL
const list = document.getElementById('book-list');
const form = document.getElementById('book-form');
const firstNameInput = document.getElementById('first_name');
const lastNameInput = document.getElementById('last_name');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const addressInput = document.getElementById('address');

// Fetch and display books from the API
async function fetchBooks() {
  try {
    const res = await fetch(apiUrl);
    const data = await res.json();
    
    // Log the response to inspect its structure
    console.log('API response:', data);
    
    // Check if books is a property of the response
    const books = Array.isArray(data) ? data : data.books || [];
    
    list.innerHTML = '';  // Clear existing list
    
    if (books.length === 0) {
      list.innerHTML = '<li>Nie znaleziono książek</li>';
      return;
    }
    
	
    books.forEach(book => {
	  
	let formattedAuthors = '';
	book.authors.forEach(author => {
		  formattedAuthors += author.first_name + ' ' + author.last_name + ' ';
	  });

    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${book.title} </strong> (${book.publication_year}), ISBN: ${book.isbn} <br> autorzy: ${formattedAuthors} <br>
	  <button onclick="deleteBook(${book.book_id})">Usuń</button>
	  <button onclick="editBook(${book.book_id})">Edytuj</button>
	  <button onclick="getBookDetails(${book.book_id})">Szczegóły książki</button>
    `;
    list.appendChild(li);
  });
  
  } catch (error) {
    console.error('Błąd przy ładowaniu książek:', error);
    list.innerHTML = '<li>Błąd przy ładowaniu książek</li>';
  }
}

// Delete a book
async function deleteBook(id) {
  await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });
  fetchBooks();  // Reload books
}

// Edit a book
async function editBook(id) {
  try {
    // Fetch current book data
    const res = await fetch(`${apiUrl}/${id}`);
    const book = await res.json();
    
    // Prompt for updated information with current values clearly shown
    const newTitle = prompt(`Tytuł (obecnie: ${book.title}):`, book.title);
    const newISBN = prompt(`ISBN (obecnie: ${book.isbn}):`, book.isbn);
    const newPublisherId = prompt(`ID wydawcy (obecnie: ${book.publisher_id}):`, book.publisher_id);
    const newPublicationYear = prompt(`Rok publikacji (obecnie: ${book.publication_year}):`, book.publication_year);
    const newLanguage = prompt(`Język (obecnie: ${book.language}):`, book.language);
	const newPageCount = prompt(`Liczba stron (obecnie: ${book.page_count}):`, book.page_count);
    const newDescription = prompt(`Opis (obecnie: ${book.description}):`, book.description);
    const newTotalCopies = prompt(`Dostępnych kopii (obecnie: ${book.total_copies}):`, book.total_copies);
    const newAvailableCopies = book.available_copies; // don't modify to avoid inconsistencies
    
    // Check if user cancelled any prompt
    if (newTitle === null || newISBN === null || 
		newPublisherId === null || newPublicationYear === null ||
		newLanguage === null || newPageCount === null ||
		newDescription === null || newTotalCopies === null ||
        newPublisherId === null) {
      return; // User cancelled, exit function
    }
    
    // Proceed with update if data is valid
    if (newTitle && newISBN) {
      await fetch(`${apiUrl}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: newTitle, 
          isbn: newISBN, 
          publisher_id: newPublisherId,
		  publication_year: newPublicationYear,
		  language: newLanguage,
		  page_count: newPageCount,
		  description: newDescription,
		  total_copies: newTotalCopies,
		  available_copies: newAvailableCopies
        })
      });
      
      fetchBooks();  // Reload books list
      alert('Książka pomyślnie zaktualizowana');
    } else {
      alert('Tytuł i ISBN są wymagane');
    }
  } catch (error) {
    console.error('Error przy edycji książki:', error);
    alert('Nie udało się zaktualizować książki');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadAuthors();
//  loadCategories();
  const publisherSelect = document.getElementById('publisherSelect');
  const categorySelect = document.getElementById('categorySelect');
  
    fetch(`${apiBaseUrl}/publishers`)
    .then(res => res.json())
    .then(data => {
      data.publishers.forEach(publisher => {
        const option = document.createElement('option');
        option.value = publisher.publisher_id;
        option.textContent = `${publisher.name}`;
        publisherSelect.appendChild(option);
      });
    })
    .catch(err => console.error('Błąd przy pobieraniu wydawców:', err));
	
	fetch(`${apiBaseUrl}/categories`)
    .then(res => res.json())
    .then(data => {
      data.categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.category_id;
        option.textContent = `${category.name}`;
        categorySelect.appendChild(option);
      });
    })
    .catch(err => console.error('Błąd przy pobieraniu ktegorii:', err));

  document.getElementById('bookForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;

    const getSelectedValues = (selectElement) =>
      Array.from(selectElement.selectedOptions).map(opt => parseInt(opt.value));

    const bookData = {
      title: form.title.value,
      isbn: form.isbn.value || null,
      publisher_id: parseInt(publisherSelect.value),
	  category_id: parseInt(categorySelect.value),
      publication_year: parseInt(form.publication_year.value),
      language: form.language.value,
      page_count: parseInt(form.page_count.value),
      description: form.description.value,
      total_copies: parseInt(form.total_copies.value),
      author_ids: getSelectedValues(form.author_ids)
    };

    createBook(bookData);
  });  
});

async function loadAuthors() {
  try {
    const res = await fetch(`${apiBaseUrl}/authors`);
    const data = await res.json();
    const authors = data.authors; // Extract the array properly

    const select = document.getElementById('authorsSelect');
    authors.forEach(author => {
      const option = document.createElement('option');
      option.value = author.author_id;
      option.textContent = `${author.first_name} ${author.last_name}`;
      select.appendChild(option);
    });
  } catch (err) {
    console.error('Nie udało się pobrać autorów:', err);
  }
}


/*
async function loadCategories() {
  try {
    const res = await fetch(`${apiBaseUrl}/categories`);
    const categories = await res.json();
    const select = document.getElementById('categoriesSelect');
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category.category_id;
      option.textContent = category.name;
      select.appendChild(option);
    });
  } catch (err) {
    console.error('Nie udało się pobrać kategorii:', err);
  }
}
*/

async function createBook(bookData) {
  try {
    const response = await fetch(`${apiBaseUrl}/books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Nie udało się stworzyć książki');
    }

    const result = await response.json();
	fetchBooks();
    alert(`Książka stworzona z ID: ${result.book_id}`);
  } catch (err) {
    console.error('Nie udało się stworzyć książki:', err);
    alert('Error: ' + err.message);
  }
}

async function getBookDetails(bookId) {
  try {
    const response = await fetch(`${apiUrl}/${bookId}`);
    if (!response.ok) {
      throw new Error(`Nie udało się pobrać szczegółów książki (status ${response.status})`);
    }

    const book = await response.json();

    // Format authors and borrowings
    const authors = book.authors.map(a => `${a.first_name} ${a.last_name}`).join(', ') || 'None';
    const categories = book.categories.map(c => c.name).join(', ') || 'None';
    const borrowings = book.current_borrowings.length
      ? book.current_borrowings.map(b => `• ${b.member_name} (Do: ${new Date(b.due_date).toLocaleDateString()})`).join('\n')
      : 'None';

    const message = `
Tytuł: ${book.title}
ID książki: ${book.book_id}
ISBN: ${book.isbn || 'N/A'}
Wydawca: ${book.publisher_name}
Rok wydania: ${book.publication_year}
Opis: ${book.description}
Liczba stron: ${book.page_count}
Język: ${book.language}
Ilość egzemplarzy: ${book.available_copies}/${book.total_copies}
Autorzy: ${authors}
Kategorie: ${categories}
Wypożyczona przez:
${borrowings}
    `;

    alert(message);
  } catch (error) {
    console.error('Nie udało się pobrać szczegółów książki', error);
    alert('Nie udało się pobrać szczegółów książki');
  }
}


fetchBooks();

