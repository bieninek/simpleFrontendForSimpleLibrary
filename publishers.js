/////////////////////////////////////////////////////////////////////////
/// Publishers                                                             ///
///                                                                   ///
/// There are sent the following API requests:                        ///
///  GET publishers/                   OK                                ///        
///  POST publishers/                                  ///
/////////////////////////////////////////////////////////////////////////

const apiUrl = 'http://localhost:3306/api/publishers';  // Backend API URL
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
    `;
    list.appendChild(li);
	});
  
  } catch (error) {
    console.error('Błąd przy ładowaniu wydawców:', error);
    list.innerHTML = '<li>Błąd przy ładowaniu wyadawców</li>';
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

