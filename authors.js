//////////////////////////////////////////////////
/// Authors                                    ///
///                                            ///
/// There are sent the following API requests: ///
///   GET authors/                             ///
///   GET authors/:id                          ///
///   POST authors/                            ///
///   DELETE authors/:id                       ///
///   PUT authors/:id                          ///
///   GET authors/:id/books                    ///
///                                            ///
//////////////////////////////////////////////////

const apiUrl = 'http://localhost:3301/api/authors';  // Backend API URL
const list = document.getElementById('author-list');
const form = document.getElementById('author-form');
const firstNameInput = document.getElementById('first_name');
const lastNameInput = document.getElementById('last_name');
const birthDateInput = document.getElementById('birth_date');
const biographyInput = document.getElementById('biography');

// Fetch and display authors from the API
async function fetchAuthors() {
  try {
    const res = await fetch(apiUrl);
    const data = await res.json();
    
    // Log the response to inspect its structure
    console.log('API response:', data);
    
    // Check if authors is a property of the response
    const authors = Array.isArray(data) ? data : data.authors || [];
    
    list.innerHTML = '';  // Clear existing list
    
    if (authors.length === 0) {
      list.innerHTML = '<li>Nie znaleziono autorów</li>';
      return;
    }
    
    authors.forEach(author => {
    // Format the date from ISO to DD MM YYYY
    let formattedDate = '';
    if (author.birth_date) {
      const date = new Date(author.birth_date);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-based
      const year = date.getFullYear();
      formattedDate = `${day}.${month}.${year}`;
    } else {
      formattedDate = 'Unknown';
    }

    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${author.first_name} ${author.last_name}</strong> urodzony/a ${formattedDate}, liczba książek: ${author.book_count} <br>
	  <button onclick="deleteAuthor(${author.author_id})">Usuń</button>
      <button onclick="editAuthor(${author.author_id})">Edytuj</button>
      <button onclick="getAuthorBooks(${author.author_id})">Książki autora</button>
	  <button onclick="getAuthorDetails(${author.author_id})">O autorze</button>
    `;
    list.appendChild(li);
  });
  } catch (error) {
    console.error('Błąd przy ładowaniu autorów:', error);
    list.innerHTML = '<li>Błąd przy ładowaniu autorów</li>';
  }
}

// Delete an author
async function deleteAuthor(id) {
  await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });
  fetchAuthors();  // Reload authors
}

// Edit an author
async function editAuthor(id) {
  try {
    // Fetch current author data
    const res = await fetch(`${apiUrl}/${id}`);
    const author = await res.json();
    
    // Format current birth date for display if it exists
    let formattedBirthDate = '';
    if (author.birth_date) {
      const date = new Date(author.birth_date);
      formattedBirthDate = date.toISOString().split('T')[0]; // YYYY-MM-DD format
    }
    
    // Prompt for updated information with current values clearly shown
    const newFirstName = prompt(`Imię (obecne: ${author.first_name}):`, author.first_name);
    const newLastName = prompt(`Nazwisko (obecne: ${author.last_name}):`, author.last_name);
    const newBirthDate = prompt(`Data urodzenia w formacie YYYY-MM-DD (obecnie: ${formattedBirthDate}):`, formattedBirthDate);
	const newBiography = prompt(`Biografia (obecne: ${author.biography}):`, author.biography);
    
    // Check if user cancelled any prompt
    if (newFirstName === null || newLastName === null || 
        newBirthDate === null || newBiography === null) {
      return; // User cancelled, exit function
    }
    
    // Proceed with update if data is valid
    if (newFirstName && newLastName) {
      await fetch(`${apiUrl}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          first_name: newFirstName, 
          last_name: newLastName, 
          birth_date: newBirthDate,
		  biography: newBiography
        })
      });
      
      fetchAuthors();  // Reload authors list
      alert('Author pomyślnie zaktualizowany');
    } else {
      alert('Imię i nazwisko są wymagane');
    }
  } catch (error) {
    console.error('Error przy edycji autora:', error);
    alert('Nie udało się zaktualizować autora');
  }
}

async function getAuthorBooks(authorId) {
  try {
    const response = await fetch(`${apiUrl}/${authorId}/books`);
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
	const data = await response.json();
	const books = data.books;
    
    if (books.length === 0) {
      alert("Ten autor nie ma książek.");
    } else {
      // Format the books into a readable string
      let booksList = "Książki tego autora:\n\n";
      books.forEach((book, index) => {
        booksList += `${index + 1}. ${book.title}`;
        if (book.publication_year) {
          booksList += ` (${book.publication_year})`;
        }
        booksList += "\n";
      });
      
      alert(booksList);
    }
    
    return books;
  } catch (error) {
    console.error('Błąd przy ładowaniu:', error);
    alert('Błąd przy ładowaniu. Spróbuj później.');
    return [];
  }
}

async function getAuthorDetails(authorId) {
  try {
    const response = await fetch(`${apiUrl}/${authorId}`);

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const author = await response.json();

    // Format birth date
    const birthDate = new Date(author.birth_date).toLocaleDateString();

    // Format books
    let booksList = "";
    if (Array.isArray(author.books) && author.books.length > 0) {
      booksList = "\nKsiążki:\n";
      author.books.forEach((book, index) => {
        booksList += `${index + 1}. ${book.title} (${book.publication_year})\n`;
      });
    } else {
      booksList = "\nBrak książek.\n";
    }

    // Format coauthors
    let coauthorsList = "";
    if (Array.isArray(author.coauthors) && author.coauthors.length > 0) {
      coauthorsList = "\nWspółautorzy:\n";
      author.coauthors.forEach((coauthor, index) => {
        coauthorsList += `${index + 1}. ${coauthor.first_name} ${coauthor.last_name} (wspólne książki: ${coauthor.shared_books})\n`;
      });
    } else {
      coauthorsList = "\nBrak współautorów.\n";
    }

    // Combine everything into a single message
    let message = `Szczegóły autora:\n\n`;
    message += `Imię i nazwisko: ${author.first_name} ${author.last_name}\n`;
    message += `Data urodzenia: ${birthDate}\n`;
    message += `Biografia: ${author.biography || "Brak biografii"}\n`;
    message += booksList;
    message += coauthorsList;

    alert(message);

    return author;
  } catch (error) {
    console.error('Błąd podczas pobierania danych autora:', error);
    alert('Błąd podczas pobierania danych autora. Spróbuj ponownie później.');
    return null;
  }
}

// Add new author to the API
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const newAuthor = {
    first_name: firstNameInput.value,
    last_name: lastNameInput.value,
	birth_date: birthDateInput.value,
	biography: biographyInput
  };
  await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newAuthor)
  });
  form.reset();  // Reset form fields
  fetchAuthors();  // Reload authors
});

fetchAuthors();

