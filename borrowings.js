/////////////////////////////////////////////////////////////////////////
/// Borrowings                                                             ///
///                                                                   ///
/// There are sent the following API requests:                        ///
///  GET borrowings/                   OK                              ///
///  GET borrowings/:id                OK                                  ///        
///  POST borrowings/                                  ///
///  POST borrowings/calculate-fines   OK
///  POST borrowings/update-overdue    OK
///  PUT borrowings/:id/return       OK
///  PUT borrowings/:id/extend          OK                                        /// 
///                                                                   ///
/////////////////////////////////////////////////////////////////////////

const apiUrl = 'http://localhost:3306/api/borrowings';  // Backend API URL
const generalApiUrl = 'http://localhost:3306/api'; 
const list = document.getElementById('borrowing-list');

// Fetch and display borrowings from the API
async function fetchBorrowings() {
  try {  
    const res = await fetch(apiUrl);
    const data = await res.json();
    
    // Log the response to inspect its structure
    console.log('API response:', data);
    
    // Check if borrowings is a property of the response
    const borrowings = Array.isArray(data) ? data : data.borrowings || [];
    
    list.innerHTML = '';  // Clear existing list
    
    if (borrowings.length === 0) {
      list.innerHTML = '<li>Nie znaleziono wypożyczeń</li>';
      return;
    }
    
	
    borrowings.forEach(borrowing => {
		
	let formattedBorrowDate = '';
    if (borrowing.borrow_date) {
      const date = new Date(borrowing.borrow_date);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-based
      const year = date.getFullYear();
      formattedBorrowDate = `${day}.${month}.${year}`;
    } else {
      formattedBorrowDate = 'Unknown';
    }
	
	let formattedDueDate = '';
    if (borrowing.due_date) {
      const date = new Date(borrowing.due_date);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-based
      const year = date.getFullYear();
      formattedDueDate = `${day}.${month}.${year}`;
    } else {
      formattedDueDate = 'Unknown';
    }
	
	let formattedReturnDate = '';
    if (borrowing.return_date) {
      const date = new Date(borrowing.return_date);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-based
      const year = date.getFullYear();
      formattedReturnDate = `${day}.${month}.${year}`;
    } else {
      formattedReturnDate = 'Nie zwrócona jeszcze';
    }

    const li = document.createElement('li');
    li.innerHTML = `
      <strong> ${borrowing.member_name} </strong> wypożyczył: <strong> ${borrowing.title} </strong> (ISBN: ${borrowing.isbn}) <br>
	  Data wypożyczenia: ${formattedBorrowDate} <br> 
	  Do kiedy zwrócić: ${formattedDueDate} <br>
	  Kiedy zwrócono: ${formattedReturnDate} <br>
	  Kara: ${borrowing.fine_amount}, Status: ${borrowing.status} <br>
	  <button onclick="getBorrowingDetails(${borrowing.borrowing_id})">Szczegóły wypożyczenia</button>
	  <button onclick="extendBorrowing(${borrowing.borrowing_id})">Przedłuż</button>
	  <button onclick="returnBorrowing(${borrowing.borrowing_id})">Zwróć</button>
    `;
    list.appendChild(li);
  });
  
  } catch (error) {
    console.error('Błąd przy ładowaniu wypożyczeń:', error);
    list.innerHTML = '<li>Błąd przy ładowaniu wypożyczeń</li>';
  }
}

async function getBorrowingDetails(borrowingId) {
  try {
    const response = await fetch(`${apiUrl}/${borrowingId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    const message = `
ID wypożyczenia: ${data.borrowing_id}
Książka: ${data.book_title} (ISBN: ${data.isbn})
Wypożyczona przez: ${data.member_name} (${data.member_email})
Status: ${data.status}
Data wypożyczenia: ${new Date(data.borrow_date).toLocaleDateString()}
Do kiedy zwrócić: ${new Date(data.due_date).toLocaleDateString()}
Data zwrotu: ${data.return_date ? new Date(data.return_date).toLocaleDateString() : "Nie zwrócona jeszcze"}
Kara: ${data.fine_amount} zł
    `;

    alert(message);
  } catch (error) {
    console.error("Błąd przy ładowaniu szczegółów wypożyczenia:", error);
    alert("Błąd przy ładowaniu szczegółów wypożyczenia.");
  }
}

async function extendBorrowing(borrowingId) {
  try {
	// Fetch current due date
    const res = await fetch(`${apiUrl}/${borrowingId}`);
    const borrowing = await res.json();  
	
	let formattedDueDate = '';
    if (borrowing.due_date) {
      const date = new Date(borrowing.due_date);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-based
      const year = date.getFullYear();
      formattedDueDate = `${year}-${month}-${day}`;
    } else {
      formattedDueDate = 'Unknown';
    }
	const newDueDate = prompt(`Data zwrotu (obecnie: ${formattedDueDate}):`, formattedDueDate);
	
    const response = await fetch(`${apiUrl}/${borrowingId}/extend`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ new_due_date: newDueDate })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    alert(`Wypożyczenie zostało przedłużone. Nowa data zwrotu: ${newDueDate}`);
	fetchBorrowings();
  } catch (error) {
    console.error('Błąd podczas przedłużania wypożyczenia:', error);
    alert('Nie udało się przedłużyć wypożyczenia.');
  }
}

async function returnBorrowing(borrowingId) {
  try {  
    const response = await fetch(`${apiUrl}/${borrowingId}/return`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    alert(`${result.message}`);
	fetchBorrowings();
  } catch (error) {
    console.error('Błąd podczas zwrotu książki:', error);
    alert('Nie udało się zwrócić książki.');
  }
}

async function calculateFines() {
  try {
    const response = await fetch(`${apiUrl}/calculate-fines`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${response.status}`);
    }

    const result = await response.json();
    alert(`${result.message}. Przeliczono ${result.updated_count} kar`);
    return result;            
  } catch (error) {
    console.error('Błąd przy wywołaniu /calculate-fines:', error);
    alert('Nie udało się przeliczyć kar.');
  
  }
}

async function calculateOverdue() {
  try {
    const response = await fetch(`${apiUrl}/update-overdue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${response.status}`);
    }

    const result = await response.json();
    alert(`${result.message}. Zaktualizowano ${result.updated_count} wystąpień`);
    return result;            
  } catch (error) {
    console.error('Błąd przy wywołaniu /update-overdue:', error);
    alert('Nie udało się zaktualizować przetrzymań.');
  
  }
}
/*
function fetchFilteredBorrowings(filters = {}) {
  const {
    status,
    member_id,
    book_id,
    from_date,
    to_date,
    page = 1,
    limit = 10
  } = filters;

  const params = new URLSearchParams();

  if (status) params.append('status', status);
  if (member_id) params.append('member_id', member_id);
  if (book_id) params.append('book_id', book_id);
  if (from_date) params.append('from_date', from_date);
  if (to_date) params.append('to_date', to_date);

  params.append('page', page);
  params.append('limit', limit);

  fetch(`${apiUrl}?${params.toString()}`)
    .then(res => {
      if (!res.ok) throw new Error('Failed to fetch borrowings');
      return res.json();
    })
    .then(data => {
      console.log('Filtered borrowings:', data.borrowings);
      alert(`Znaleziono ${data.borrowings.length} wypożyczeń (strona ${data.pagination.page} z ${data.pagination.pages})`);
    })
    .catch(err => {
      console.error('Error fetching borrowings:', err);
      alert('Wystąpił błąd przy pobieraniu wypożyczeń.');
    });
}

document.getElementById('filterForm').addEventListener('submit', function(e) {
  e.preventDefault();
  fetchFilteredBorrowings({
    status: document.getElementById('status').value,
    member_id: document.getElementById('memberId').value,
    book_id: document.getElementById('bookId').value,
    from_date: document.getElementById('fromDate').value,
    to_date: document.getElementById('toDate').value,
    page: 1,
    limit: 10
  });
});
*/

document.addEventListener('DOMContentLoaded', () => {
  const buttonFines = document.getElementById('fines-button');
  const buttonOverdue = document.getElementById('overdue-button');

  buttonFines.addEventListener('click', calculateFines);
  buttonOverdue.addEventListener('click', calculateOverdue);
  
  const memberSelect = document.getElementById('memberSelect');
  const bookSelect = document.getElementById('bookSelect');
  const borrowDateInput = document.getElementById('borrowDate');
  const borrowForm = document.getElementById('borrowForm');
  
  borrowDateInput.value = new Date().toISOString().split('T')[0];
  
  fetch(`${generalApiUrl}/members`)
    .then(res => res.json())
    .then(data => {
      data.members.forEach(member => {
        const option = document.createElement('option');
        option.value = member.member_id;
        option.textContent = `${member.first_name} ${member.last_name}`;
        memberSelect.appendChild(option);
      });
    })
    .catch(err => console.error('Błąd przy pobieraniu członków:', err));
	
  fetch(`${generalApiUrl}/books`)
    .then(res => res.json())
    .then(data => {
      data.books.forEach(book => {
        const option = document.createElement('option');
        option.value = book.book_id;
        option.textContent = `${book.title} (ISBN: ${book.isbn})`;
        bookSelect.appendChild(option);
      });
    })
    .catch(err => console.error('Błąd przy pobieraniu książek:', err));
	
	borrowForm.addEventListener('submit', e => {
    e.preventDefault();

    const payload = {
      member_id: parseInt(memberSelect.value),
      book_id: parseInt(bookSelect.value),
      borrow_date: borrowDateInput.value
    };

    fetch(`${generalApiUrl}/borrowings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        alert('Wypożyczenie zostało utworzone.');
        borrowForm.reset();
        borrowDateInput.value = new Date().toISOString().split('T')[0];
      })
      .catch(err => {
        console.error('Błąd przy tworzeniu wypożyczenia:', err);
        alert('Wystąpił błąd podczas tworzenia wypożyczenia.');
      });
	fetchBorrowings();
  });
});

fetchBorrowings();

