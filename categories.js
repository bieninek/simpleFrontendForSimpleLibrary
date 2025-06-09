/////////////////////////////////////////////////////////////////////////
/// Categories                                                             ///
///                                                                   ///
/// There are sent the following API requests:                        ///
///  GET categories/                   OK                                ///        
///  POST categories/                                  ///
///  DELETE ...                OK //
///  PUT .... OK ///
/////////////////////////////////////////////////////////////////////////

const apiUrl = 'http://localhost:3301/api/categories';  // Backend API URL
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
	  <button onclick="deleteCategory(${category.category_id})">Usuń</button>
	  <button onclick="editCategory(${category.category_id})">Edytuj</button>
    `;
    list.appendChild(li);
	});
  
  } catch (error) {
    console.error('Błąd przy ładowaniu kategorii:', error);
    list.innerHTML = '<li>Błąd przy ładowaniu kategorii</li>';
  }
}

// Edit a category
async function editCategory(id) {
  try {
    // Fetch current category data
    const res = await fetch(`${apiUrl}/${id}`);
    const category = await res.json();
    
    // Prompt for updated information with current values clearly shown
    const newName = prompt(`Nazwa (obecnie: ${category.name}):`, category.name);
    const newDescription = prompt(`Opis (obecnie: ${category.description}):`, category.description);
    
    // Check if user cancelled any prompt
    if (newName === null || newDescription === null ) {
      return; // User cancelled, exit function
    }
    
    // Proceed with update if data is valid
    if (newName) {
      await fetch(`${apiUrl}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newName, 
          description: newDescription
        })
      });
      
      fetchCategories();  // Reload categories list
      alert('Kategoria pomyślnie zaktualizowana');
    } else {
      alert('Nazwa kategorii jest wymagana');
    }
  } catch (error) {
    console.error('Error przy edycji kategorii:', error);
    alert('Nie udało się zaktualizować kategorii');
  }
}

// Delete a category
async function deleteCategory(id) {
  await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });
  fetchCategories();  // Reload categories
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

