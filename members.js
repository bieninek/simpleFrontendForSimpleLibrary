//////////////////////////////////////////////////
/// Members                                    ///
///                                            ///
/// There are sent the following API requests: ///
///  GET members/                              ///
///  GET members/:id                           ///
///  DELETE members/:id                        ///
///  POST members/                             ///
///  PUT members/:id                           /// 
///  GET members/:id/borrowings                ///
///  PUT members/:id/status                    ///
///                                            ///
//////////////////////////////////////////////////

const apiUrl = 'http://localhost:3301/api/members';  // Backend API URL
const list = document.getElementById('member-list');
const form = document.getElementById('member-form');
const firstNameInput = document.getElementById('first_name');
const lastNameInput = document.getElementById('last_name');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const addressInput = document.getElementById('address');

// Fetch and display members from the API
async function fetchMembers() {
  try {
    const res = await fetch(apiUrl);
    const data = await res.json();
    
    // Log the response to inspect its structure
    console.log('API response:', data);
    
    // Check if members is a property of the response
    const members = Array.isArray(data) ? data : data.members || [];
    
    list.innerHTML = '';  // Clear existing list
    
    if (members.length === 0) {
      list.innerHTML = '<li>Nie znaleziono członków</li>';
      return;
    }
    
    members.forEach(member => {
    // Format the date from ISO to DD MM YYYY
    let formattedDate = '';
    if (member.registration_date ) {
      const date = new Date(member.registration_date );
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-based
      const year = date.getFullYear();
      formattedDate = `${day}.${month}.${year}`;
    } else {
      formattedDate = 'Unknown';
    }

    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${member.first_name} ${member.last_name}</strong> zarejestrowany/a ${formattedDate} <br>
	  liczba wypożyczonych książek: ${member.active_loans} <br>
	  liczba przetrzymanych książek ${member.overdue_books}<br>
	  <button onclick="deleteMember(${member.member_id})">Usuń</button>
      <button onclick="editMember(${member.member_id})">Edytuj</button>
	  <button onclick="getMemberBorrowings(${member.member_id})">Historia wypożyczeń</button>
	  <button onclick="getMemberDetails(${member.member_id})">Szczegóły członka</button>
    `;
    list.appendChild(li);
  });
  } catch (error) {
    console.error('Błąd przy ładowaniu członków:', error);
    list.innerHTML = '<li>Błąd przy ładowaniu członków</li>';
  }
}

// Delete a member
async function deleteMember(id) {
  await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });
  fetchMembers();  // Reload members
}

// Edit a mmeber
async function editMember(id) {
  try {
    // Fetch current member data
    const res = await fetch(`${apiUrl}/${id}`);
    const member = await res.json();
    
    // Format current registration date for display if it exists
    let formattedRegistrationDate = '';
    if (member.registration_date) {
      const date = new Date(member.registration_date);
      formattedRegistrationDate = date.toISOString().split('T')[0]; // YYYY-MM-DD format
    }
    
    // Prompt for updated information with current values clearly shown
    const newFirstName = prompt(`Imię (obecnie: ${member.first_name}):`, member.first_name);
    const newLastName = prompt(`Nazwisko (obecnie: ${member.last_name}):`, member.last_name);
    const newRegistrationDate = prompt(`Data rejestracji w formacie YYYY-MM-DD (obecnie: ${formattedRegistrationDate}):`, formattedRegistrationDate);
    
    // Check if user cancelled any prompt
    if (newFirstName === null || newLastName === null || 
        formattedRegistrationDate === null) {
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
          registration_date: formattedRegistrationDate,
		  email: member.email,
		  phone: member.phone
        })
      });
      
      fetchMembers();  // Reload authors list
      alert('Czlonek pomyślnie zaktualizowany');
    } else {
      alert('Imię i nazwisko są wymagane');
    }
  } catch (error) {
    console.error('Error przy edycji członka:', error);
    alert('Nie udało się zaktualizować członka');
  }
}

async function getMemberBorrowings(memberId) {
  try {
    const response = await fetch(`${apiUrl}/${memberId}/borrowings`);

    if (!response.ok) {
      throw new Error(`Błąd: ${response.status}`);
    }

    const data = await response.json();
    const borrowings = data.borrowings;

    if (borrowings.length === 0) {
      alert("Ten członek nie ma żadnych wypożyczeń.");
      return;
    }

    let message = `Historia wypożyczeń (strona ${data.pagination.page} z ${data.pagination.pages}):\n\n`;

    borrowings.forEach((b, index) => {
      message += `${index + 1}. "${b.title}" (ISBN: ${b.isbn})\n`;
      message += ` Data wypożyczenia: ${new Date(b.borrow_date).toLocaleDateString()}\n`;
      message += ` Termin zwrotu: ${new Date(b.due_date).toLocaleDateString()}\n`;
      message += ` Data zwrotu: ${b.return_date ? new Date(b.return_date).toLocaleDateString() : 'Brak'}\n`;
      message += ` Grzywna: ${b.fine_amount} zł\n`;
      message += ` Status: ${b.status}\n\n`;
    });

    alert(message);
    return borrowings;
  } catch (error) {
    console.error('Błąd podczas pobierania wypożyczeń:', error);
    alert('Nie udało się pobrać wypożyczeń członka.');
    return [];
  }
}


async function getMemberDetails(memberId) {
  try {
    const response = await fetch(`${apiUrl}/${memberId}`);

    if (!response.ok) {
      throw new Error(`Błąd: ${response.status}`);
    }

    const member = await response.json();

    let message = `Szczegóły członka:\n\n`;
    message += `ID: ${member.member_id}\n`;
    message += `Imię i nazwisko: ${member.first_name} ${member.last_name}\n`;
    message += `Email: ${member.email || 'Brak'}\n`;
    message += `Telefon: ${member.phone || 'Brak'}\n`;
    message += `Adres: ${member.address || 'Brak'}\n`;
    message += `Rejestracja: ${new Date(member.registration_date).toLocaleDateString()}\n`;
    message += `Status: ${member.membership_status}\n`;
    message += `Łączne opłaty za przetrzymanie: ${member.total_fines} zł\n`;

    if (member.current_borrowings && member.current_borrowings.length > 0) {
      message += `\nAktualne wypożyczenia:\n`;
      member.current_borrowings.forEach((b, index) => {
        message += `  ${index + 1}. "${b.title}" (ISBN: ${b.isbn})\n`;
        message += `     Termin zwrotu: ${new Date(b.due_date).toLocaleDateString()} (${b.days_remaining} dni pozostało)\n`;
        message += `     Status: ${b.status}\n`;
      });
    } else {
      message += `\nBrak aktualnych wypożyczeń.\n`;
    }

    alert(message);
    return member;
  } catch (error) {
    console.error('Błąd podczas pobierania danych członka:', error);
    alert('Nie udało się pobrać danych członka.');
    return null;
  }
}


// Add new author to the API
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const newMember = {
    first_name: firstNameInput.value,
    last_name: lastNameInput.value,
	phone: phoneInput.value,
	email: emailInput.value,
	address: addressInput.value
  };
  
  await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newMember)
  });
  form.reset();  // Reset form fields
  fetchMembers();  // Reload authors
});

// Load members into the dropdown
async function loadMembers() {
  try {
    const res = await fetch(`${apiUrl}`);
    if (!res.ok) throw new Error('Błąd pobierania członków');
    const data = await res.json();

    const members = data.members || data; // use `data.members` if it exists, otherwise use `data`
    if (!Array.isArray(members)) throw new Error('Niepoprawny format danych');

    const select = document.getElementById('memberSelect');
    members.forEach(member => {
      const option = document.createElement('option');
      option.value = member.member_id;
      option.textContent = `${member.first_name} ${member.last_name}`;
      select.appendChild(option);
    });
  } catch (err) {
    alert('Nie udało się załadować listy członków.');
    console.error(err);
  }
}


// Send PUT request to update member status
// Function to fetch the current member data before updating
async function getMemberDetailsStatus(memberId) {
  try {
    const response = await fetch(`${apiUrl}/${memberId}`);
    if (!response.ok) {
      throw new Error(`Błąd pobierania szczegółów członka: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    alert('Nie udało się pobrać szczegółów członka.');
    console.error(error);
  }
}

// Function to send PUT request to update member status
async function updateMemberStatus(memberId, newStatus) {
  const validStatuses = ['active', 'expired', 'suspended'];
  if (!validStatuses.includes(newStatus)) {
    alert('Nieprawidłowy status.');
    return;
  }

  try {
    // First, fetch the member details
    const member = await getMemberDetailsStatus(memberId);
    if (!member) return;

    // Prepare the updated data (only membership_status is changing)
    const updatedMemberData = {
      first_name: member.first_name,  // Keeping the original first name
      last_name: member.last_name,    // Keeping the original last name
      email: member.email,            // Keeping the original email
      phone: member.phone,            // Keeping the original phone number
      address: member.address,        // Keeping the original address
      registration_date: member.registration_date, // Keeping the original registration date
      membership_status: newStatus   // Updating only the status
    };

    const response = await fetch(`${apiUrl}/${memberId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedMemberData)  // Send the updated data with new status
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Błąd: ${response.status}, ${errorData.message || errorData.error}`);
    }

    const result = await response.json();
    alert(`Status członka został zmieniony na "${newStatus}".`);
    return result;
  } catch (error) {
    console.error('Błąd aktualizacji:', error);
    alert('Nie udało się zaktualizować statusu członka.');
  }
}


// Form handler
document.getElementById('statusForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const memberId = document.getElementById('memberSelect').value;
  const status = document.getElementById('status').value;
  if (memberId) updateMemberStatus(memberId, status);
});

// Init
window.onload = loadMembers;

fetchMembers();

