/* Get references to DOM elements */
const categoryFilter = document.getElementById("categoryFilter");
const productsContainer = document.getElementById("productsContainer");
const chatForm = document.getElementById("chatForm");
const chatWindow = document.getElementById("chatWindow");
const selectedProductsList = document.getElementById("selectedProductsList");
const generateRoutine = document.getElementById("generateRoutine");
const userInput = document.getElementById("userInput");
let allProducts = [];
let selectedProducts = [];

let messages = [
  { role: 'system', content: `You are a friendly L'Oréal worker,
   specializing in giving users advice and answering any questions they have. You help users by navigating L'Oréals extensive product catalog and giving tailored recommendations.

  If a user's query is unrelated to L'Oréal or any any of their products, respond by stating that you do not know.`}
];

const workerUrl = 'https://beauty-worker.miguelrodriguez20067.workers.dev/';

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
chatForm.addEventListener("submit", async(e) => {
  e.preventDefault();
  chatWindow.textContent = "";

  messages.push({ role: 'user', content: userInput.value });

   try {
    const response = await fetch(workerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: messages,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const replyText = result.choices[0].message.content;

    messages.push({ role: 'assistant', content: replyText });
    
    const userMessage = document.createElement("div");
    userMessage.classList.add("msg", "user");
    userMessage.textContent = userInput.value;
    chatWindow.appendChild(userMessage);

    const assistantMessage = document.createElement("div");
    assistantMessage.classList.add("msg", "ai");
    assistantMessage.textContent = replyText;
    chatWindow.appendChild(assistantMessage);
  } catch (error) {
    console.error('Error:', error);
    chatWindow.textContent = 'Sorry, something went wrong. Please try again later.';
  }

  userInput.value = "";
});

generateRoutine.addEventListener("click", () => {
  if (selectedProducts.length === 0) {
   chatWindow.textContent = "Please select at least one product to generate a routine.";
    return;
  }

  const routine = selectedProducts.map((product, index) => {
    return `${index + 1}. ${product.name} (${product.brand})`;
  }).join("\n");

  chatWindow.textContent = `Your personalized routine:\n\n${routine}`;
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
