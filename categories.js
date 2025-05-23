/////////////////////////////////////////////////////////////////////////
/// Categories                                                             ///
///                                                                   ///
/// There are sent the following API requests:                        ///
///  GET categories/                   OK                                ///        
///  POST categories/                                  ///
/////////////////////////////////////////////////////////////////////////

const apiUrl = 'http://localhost:3306/api/categories';  // Backend API URL
const list = document.getElementById('category-list');
const form = document.getElementById('category-form');
const nameInput = document.getElementById('name');

// Fetch and display categories from the API
async function fetchCategories() {
  try {  
    const res = await fetch(apiUrl);
    const data = await res.json();
    
    // Log the response to inspect its structure
    console.log('API response:', data);
    
    // Check if categories is a property of the response
    const categories = Array.isArray(data) ? data : data.categories || [];
    
    list.innerHTML = '';  // Clear existing list
    
    if (categories.length === 0) {
      list.innerHTML = '<li>Nie znaleziono kategorii</li>';
      return;
    }
	
	categories.forEach(category => {

    const li = document.createElement('li');
    li.innerHTML = `
      Nazwa: <strong> ${category.name} </strong><br>
	  Opis: ${category.description} <br>
	  Liczba książek tej kategorii: ${category.book_count}<br>
    `;
    list.appendChild(li);
	});
  
  } catch (error) {
    console.error('Błąd przy ładowaniu kategorii:', error);
    list.innerHTML = '<li>Błąd przy ładowaniu kategorii</li>';
  }
}

// Add new category to the API
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const newCategory = {
    name: nameInput.value
  };
  await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newCategory)
  });
  form.reset();  // Reset form fields
  fetchCategories();  // Reload authors
});

fetchCategories();

