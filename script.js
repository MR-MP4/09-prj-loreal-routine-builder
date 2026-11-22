/* Get references to DOM elements */
const categoryFilter = document.getElementById("categoryFilter");
const productsContainer = document.getElementById("productsContainer");
const chatForm = document.getElementById("chatForm");
const chatWindow = document.getElementById("chatWindow");
const selectedProductsList = document.getElementById("selectedProductsList");
let allProducts = [];
let selectedProducts = [];

/* Show initial placeholder until user selects a category */
productsContainer.innerHTML = `
  <div class="placeholder-message">
    Select a category to view products
  </div>
`;

/* Load product data from JSON file */
async function loadProducts() {
  const response = await fetch("products.json");
  const data = await response.json();
  return data.products;
}

/* Create HTML for displaying product cards */
function displayProducts(products) {
  const availableProducts = products.filter(
    (product) =>
      !selectedProducts.some(
        (selectedProduct) => selectedProduct.id === product.id,
      ),
  );

  productsContainer.innerHTML = availableProducts
    .map(
      (product) => `
    <div class="product-card" data-product-id="${product.id}">
      <img src="${product.image}" alt="${product.name}">
      <div class="product-info">
        <h3>${product.name}</h3>
        <p>${product.brand}</p>
      </div>
      <span>${product.description}</span>
    </div>
  `,
    )
    .join("");
}

/* Show selected products in their own list */
function displaySelectedProducts() {
  selectedProductsList.innerHTML = selectedProducts
    .map(
      (product) => `
    <div class="product-card selected" data-product-id="${product.id}">
      <img src="${product.image}" alt="${product.name}">
      <div class="product-info">
        <h3>${product.name}</h3>
        <p>${product.brand}</p>
      </div>
      <span>${product.description}</span>
    </div>
  `,
    )
    .join("");
}

/* Filter and display products when category changes */
categoryFilter.addEventListener("change", async (e) => {
  if (allProducts.length === 0) {
    allProducts = await loadProducts();
  }
  const selectedCategory = e.target.value;

  /* filter() creates a new array containing only products 
     where the category matches what the user selected */
  const filteredProducts = allProducts.filter(
    (product) => product.category === selectedCategory,
  );

  displayProducts(filteredProducts);
});

/* Chat form submission handler - placeholder for OpenAI integration */
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  chatWindow.innerHTML = "Connect to the OpenAI API for a response!";
});

productsContainer.addEventListener("click", (e) => {
  const productCard = e.target.closest(".product-card");
  if (productCard) {
    const productId = Number(productCard.dataset.productId);
    const product = allProducts.find((item) => item.id === productId);
    if (product) {
      selectedProducts.push(product);
      displayProducts(
        allProducts.filter((item) => item.category === categoryFilter.value),
      );
      displaySelectedProducts();
    }
  }
});

selectedProductsList.addEventListener("click", (e) => {
  const selectedCard = e.target.closest(".product-card");
  if (selectedCard) {
    const productId = Number(selectedCard.dataset.productId);
    selectedProducts = selectedProducts.filter(
      (product) => product.id !== productId,
    );
    displayProducts(
      allProducts.filter(
        (product) => product.category === categoryFilter.value,
      ),
    );
    displaySelectedProducts();
  }
});
