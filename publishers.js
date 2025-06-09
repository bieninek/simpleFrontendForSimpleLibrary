/////////////////////////////////////////////////////////////////////////
/// Publishers                                                             ///
///                                                                   ///
/// There are sent the following API requests:                        ///
///  GET publishers/                   OK                                ///        
///  POST publishers/                                  ///
///  DELETE ..... OK    ///
/////////////////////////////////////////////////////////////////////////

const apiUrl = 'http://localhost:3301/api/publishers';  // Backend API URL
const list = document.getElementById('publisher-list');
const form = document.getElementById('publisher-form');
const nameInput = document.getElementById('name');
const phoneInput = document.getElementById('phone');
const addressInput = document.getElementById('address');
const emailInput = document.getElementById('email');

// Fetch and display publishers from the API
async function fetchPublishers() {
  try {  
    const res = await fetch(apiUrl);
    const data = await res.json();
    
    // Log the response to inspect its structure
    console.log('API response:', data);
    
    // Check if publishers is a property of the response
    const publishers = Array.isArray(data) ? data : data.publishers || [];
    
    list.innerHTML = '';  // Clear existing list
    
    if (publishers.length === 0) {
      list.innerHTML = '<li>Nie znaleziono wydawców</li>';
      return;
    }
	
	publishers.forEach(publisher => {

    const li = document.createElement('li');
    li.innerHTML = `
      Nazwa wydawcy: <strong> ${publisher.name} </strong><br>
	  Numer telefonu: ${publisher.phone} <br>
	  Email: ${publisher.email} <br>
	  Adres: ${publisher.address} <br>
	  Liczba książek wydana przez nich: ${publisher.book_count}<br>
	  <button onclick="deletePublisher(${publisher.publisher_id})">Usuń</button>
	  <button onclick="editPublisher(${publisher.publisher_id})">Edytuj</button>
    `;
    list.appendChild(li);
	});
  
  } catch (error) {
    console.error('Błąd przy ładowaniu wydawców:', error);
    list.innerHTML = '<li>Błąd przy ładowaniu wyadawców</li>';
  }
}

// Delete a publisher
async function deletePublisher(id) {
  await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });
  fetchPublishers();  // Reload publishers
}

// Edit a publisher
async function editPublisher(id) {
  try {
    // Fetch current publisher data
    const res = await fetch(`${apiUrl}/${id}`);
    const publisher = await res.json();
    
    // Prompt for updated information with current values clearly shown
    const newName = prompt(`Nazwa (obecnie: ${publisher.name}):`, publisher.name);
    const newAddress = prompt(`Adres (obecnie: ${publisher.address}):`, publisher.address);
	const newPhone = prompt(`Telefon (obecnie: ${publisher.phone}):`, publisher.phone);
	const newEmail = prompt(`Email (obecnie: ${publisher.email}):`, publisher.email);
    
    // Check if user cancelled any prompt
    if (newName === null || newAddress === null ||
		newPhone === null || newEmail === null	) {
      return; // User cancelled, exit function
    }
    
    // Proceed with update if data is valid
    if (newName) {
      await fetch(`${apiUrl}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newName, 
          address: newAddress,
		  phone: newPhone,
		  email: newEmail
        })
      });
      
      fetchPublishers();  // Reload publisher list
      alert('Wydawca pomyślnie zaktualizowany');
    } else {
      alert('Nazwa wydawcy jest wymagana');
    }
  } catch (error) {
    console.error('Error przy edycji wydawcy:', error);
    alert('Nie udało się zaktualizować wydawcy');
  }
}

// Add new publisher to the API
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const newCategory = {
    name: nameInput.value,
	address: addressInput.value,
	phone: phoneInput.value,
	email: emailInput.value
  };
  await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newCategory)
  });
  form.reset();  // Reset form fields
  fetchPublishers();  // Reload authors
});

fetchPublishers();

