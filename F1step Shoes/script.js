/* =========================================================
   F1RSTEP SHOES
   FIREBASE + CART + ADMIN + SEARCH
========================================================= */


/* =========================================================
   FIREBASE
========================================================= */

const firebaseConfig = {

    apiKey: "AIzaSyCT5DUFT-oYqP5HWLTh6SBGtcGCGujUXC0",

    authDomain: "f1stepshoes.firebaseapp.com",

    projectId: "f1stepshoes",

    storageBucket: "f1stepshoes.appspot.com",

    messagingSenderId: "827976719359",

    appId: "1:827976719359:web:5f86e7ec16e19ec083a5ca"
};


firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();


/* =========================================================
   SETTINGS
========================================================= */

const PASSCODE = "Firstep123";

const WHATSAPP_NUMBER = "918431575053";


/* =========================================================
   STATE
========================================================= */

let cart = JSON.parse(localStorage.getItem("cart")) || [];

let allProducts = [];

let currentImages = [];


/* =========================================================
   DOM
========================================================= */

const loader = document.getElementById("loader");

const loaderProgress =
    document.getElementById("loaderProgress");

const searchBar =
    document.getElementById("searchBar");

const clearSearch =
    document.getElementById("clearSearch");

const searchStatus =
    document.getElementById("searchStatus");

const searchStatusText =
    document.getElementById("searchStatusText");

const cartCount =
    document.getElementById("cart-count");

const cartPopup =
    document.getElementById("cartPopup");

const cartItems =
    document.getElementById("cartItems");

const cartTotal =
    document.getElementById("cartTotal");

const adminOverlay =
    document.getElementById("adminOverlay");

const imageModal =
    document.getElementById("imageModal");

const mainImage =
    document.getElementById("mainImage");

const thumbnailContainer =
    document.getElementById("thumbnailContainer");

const toast =
    document.getElementById("toast");

const toastText =
    document.getElementById("toastText");


/* =========================================================
   LOADER
========================================================= */

let progress = 0;

const loaderInterval = setInterval(() => {

    progress += Math.random() * 8;

    if (progress > 92) {
        progress = 92;
    }

    loaderProgress.style.width = `${progress}%`;

}, 80);


window.addEventListener("load", () => {

    setTimeout(() => {

        clearInterval(loaderInterval);

        loaderProgress.style.width = "100%";

        setTimeout(() => {

            loader.classList.add("hidden");

        }, 450);

    }, 650);

});


/* =========================================================
   HELPERS
========================================================= */

function escapeHTML(value) {

    if (value === undefined || value === null) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function saveCart() {

    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );

}


function showToast(message) {

    toastText.textContent = message;

    toast.classList.add("show");

    clearTimeout(window.toastTimer);

    window.toastTimer = setTimeout(() => {

        toast.classList.remove("show");

    }, 2200);

}


function getNumericPrice(price) {

    if (typeof price === "number") {
        return price;
    }

    return Number(
        String(price)
            .replace(/[^\d.]/g, "")
    ) || 0;

}


function calculatePrice(product) {

    const originalPrice =
        getNumericPrice(product.price);

    const discount =
        Number(product.discount) || 0;

    const finalPrice =
        originalPrice -
        (originalPrice * discount / 100);

    return {
        originalPrice,
        discount,
        finalPrice: Math.round(finalPrice)
    };

}


/* =========================================================
   LOAD PRODUCTS
========================================================= */

async function loadProducts() {

    const sections = document.querySelectorAll(".products");

    sections.forEach(section => {

        section.innerHTML = `
            <div class="no-products">
                Loading collection...
            </div>
        `;

    });


    try {

        const snapshot =
            await db.collection("products").get();

        allProducts = [];

        snapshot.forEach(doc => {

            const product = doc.data();

            allProducts.push({

                ...product,

                id: doc.id

            });

        });


        renderProducts(allProducts);

        populateDeleteSelect(allProducts);


    } catch (error) {

        console.error(
            "Firebase error:",
            error
        );

        sections.forEach(section => {

            section.innerHTML = `
                <div class="no-products">
                    Unable to load products.
                    Please check your Firebase configuration.
                </div>
            `;

        });

    }

}


/* =========================================================
   RENDER PRODUCTS
========================================================= */

function renderProducts(products) {

    const sectionMap = {

        shoes: "shoes-products",

        jackets: "jackets-products",

        sandals: "sandals-products",

        bags: "bags-products",

        belts: "belts-products",

        wallets: "wallets-products"

    };


    Object.values(sectionMap).forEach(id => {

        const container =
            document.getElementById(id);

        if (container) {
            container.innerHTML = "";
        }

    });


    const grouped = {

        shoes: [],

        jackets: [],

        sandals: [],

        bags: [],

        belts: [],

        wallets: []

    };


    products.forEach(product => {

        const category =
            String(product.category || "")
                .toLowerCase()
                .trim();

        if (grouped[category]) {

            grouped[category].push(product);

        }

    });


    Object.entries(grouped).forEach(
        ([category, categoryProducts]) => {

            const container =
                document.getElementById(
                    sectionMap[category]
                );

            if (!container) {
                return;
            }


            if (categoryProducts.length === 0) {

                container.innerHTML = `
                    <div class="no-products">
                        No products available yet.
                    </div>
                `;

                return;

            }


            categoryProducts.forEach(product => {

                const card =
                    createProductCard(product);

                container.appendChild(card);

            });

        }
    );

}


/* =========================================================
   PRODUCT CARD
========================================================= */

function createProductCard(product) {

    const card =
        document.createElement("article");

    card.className = "product-card";

    const prices =
        calculatePrice(product);


    let images = [];

    if (Array.isArray(product.images)) {

        images = product.images
            .filter(Boolean)
            .map(image => String(image).trim());

    } else if (product.images) {

        images =
            String(product.images)
                .split(",")
                .map(image => image.trim())
                .filter(Boolean);

    }


    const firstImage =
        images[0] ||
        "https://via.placeholder.com/700x700?text=F1rstep";


    let sizes = [];

    if (Array.isArray(product.sizes)) {

        sizes = product.sizes
            .filter(Boolean)
            .map(size => String(size).trim());

    } else if (product.sizes) {

        sizes =
            String(product.sizes)
                .split(",")
                .map(size => size.trim())
                .filter(Boolean);

    }


    if (sizes.length === 0) {

        sizes = [
            "7",
            "8",
            "9",
            "10"
        ];

    }


    const outOfStock =
        String(product.stock || "")
            .toLowerCase()
            .replace(/\s/g, "") ===
        "outofstock";


    const tag =
        product.tag ||
        "F1rstep";


    card.innerHTML = `

        <div class="product-image-wrap">

            <img
                class="product-image"
                src="${escapeHTML(firstImage)}"
                alt="${escapeHTML(product.name || "Product")}"
                loading="lazy"
            >

            <span class="product-badge">
                ${escapeHTML(tag)}
            </span>

        </div>


        <div class="product-info">

            <h3>
                ${escapeHTML(product.name || "Product")}
            </h3>


            <div class="price-box">

                ${
                    prices.discount > 0
                    ?
                    `
                    <span class="old-price">
                        ₹${prices.originalPrice}
                    </span>

                    <span class="new-price">
                        ₹${prices.finalPrice}
                    </span>

                    <span class="discount">
                        ${prices.discount}% OFF
                    </span>
                    `
                    :
                    `
                    <span class="new-price">
                        ₹${prices.originalPrice}
                    </span>
                    `
                }

            </div>


            <select class="size-select">

                ${sizes.map(size => `
                    <option value="${escapeHTML(size)}">
                        UK ${escapeHTML(size)}
                    </option>
                `).join("")}

            </select>


            <div class="stock">

                ${escapeHTML(
                    product.stock || "In Stock"
                )}

            </div>


            <button
                class="product-add"
                type="button"
                ${outOfStock ? "disabled" : ""}
            >

                ${
                    outOfStock
                    ? "Out Of Stock"
                    : "Add To Cart"
                }

            </button>

        </div>
    `;


    const image =
        card.querySelector(".product-image");

    image.addEventListener("click", () => {

        openModal(images);

    });


    const addButton =
        card.querySelector(".product-add");

    const sizeSelect =
        card.querySelector(".size-select");


    if (!outOfStock) {

        addButton.addEventListener(
            "click",
            () => {

                addToCart({

                    name: product.name,

                    price: prices.finalPrice,

                    image: firstImage,

                    size: sizeSelect.value

                });

            }
        );

    }


    return card;

}


/* =========================================================
   ADD TO CART
========================================================= */

function addToCart(product) {

    const existing =
        cart.find(item =>
            item.name === product.name &&
            item.size === product.size
        );


    if (existing) {

        existing.qty += 1;

    } else {

        cart.push({

            name: product.name,

            price: Number(product.price),

            image: product.image,

            size: product.size,

            qty: 1

        });

    }


    saveCart();

    updateCart();

    showToast(
        `${product.name} added to your bag`
    );

}


/* =========================================================
   CART
========================================================= */

function updateCart() {

    cartItems.innerHTML = "";

    let total = 0;

    let totalQuantity = 0;


    if (cart.length === 0) {

        cartItems.innerHTML = `
            <div class="cart-empty">
                Your bag is currently empty.
            </div>
        `;

        cartTotal.textContent = "₹0";

    } else {

        cart.forEach((item, index) => {

            const price =
                getNumericPrice(item.price);

            const subtotal =
                price * item.qty;

            total += subtotal;

            totalQuantity += item.qty;


            const div =
                document.createElement("div");

            div.className = "cart-item";


            div.innerHTML = `

                <img
                    src="${escapeHTML(item.image)}"
                    alt="${escapeHTML(item.name)}"
                >


                <div class="cart-item-info">

                    <h3>
                        ${escapeHTML(item.name)}
                    </h3>

                    <p>
                        ₹${price}
                    </p>

                    <div class="cart-item-size">
                        Size: UK ${escapeHTML(item.size)}
                    </div>


                    <div class="qty-controls">

                        <button
                            type="button"
                            data-action="decrease"
                            data-index="${index}"
                        >
                            −
                        </button>

                        <span>
                            ${item.qty}
                        </span>

                        <button
                            type="button"
                            data-action="increase"
                            data-index="${index}"
                        >
                            +
                        </button>

                    </div>

                </div>


                <button
                    class="remove-item-btn"
                    type="button"
                    data-action="remove"
                    data-index="${index}"
                >
                    ×
                </button>

            `;


            cartItems.appendChild(div);

        });


        cartTotal.textContent =
            `₹${total.toLocaleString("en-IN")}`;

    }


    cartCount.textContent =
        totalQuantity;

}


/* =========================================================
   CART ACTIONS
========================================================= */

function increaseQty(index) {

    if (!cart[index]) {
        return;
    }

    cart[index].qty += 1;

    saveCart();

    updateCart();

}


function decreaseQty(index) {

    if (!cart[index]) {
        return;
    }


    if (cart[index].qty > 1) {

        cart[index].qty -= 1;

    } else {

        cart.splice(index, 1);

    }


    saveCart();

    updateCart();

}


function removeFromCart(index) {

    if (!cart[index]) {
        return;
    }

    cart.splice(index, 1);

    saveCart();

    updateCart();

    showToast("Item removed");

}


function emptyCart() {

    if (cart.length === 0) {
        return;
    }


    const confirmed =
        confirm(
            "Are you sure you want to empty your bag?"
        );


    if (!confirmed) {
        return;
    }


    cart = [];

    saveCart();

    updateCart();

    showToast("Bag emptied");

}


/* =========================================================
   CART EVENT DELEGATION
========================================================= */

cartItems.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest("button[data-action]");

        if (!button) {
            return;
        }


        const index =
            Number(button.dataset.index);

        const action =
            button.dataset.action;


        if (action === "increase") {

            increaseQty(index);

        }

        if (action === "decrease") {

            decreaseQty(index);

        }

        if (action === "remove") {

            removeFromCart(index);

        }

    }
);


/* =========================================================
   OPEN / CLOSE CART
========================================================= */

function openCart() {

    cartPopup.classList.add("open");

    document.body.classList.add("no-scroll");

    updateCart();

}


function closeCart() {

    cartPopup.classList.remove("open");

    document.body.classList.remove("no-scroll");

}


document
    .getElementById("cartButton")
    .addEventListener(
        "click",
        openCart
    );


document
    .getElementById("closeCart")
    .addEventListener(
        "click",
        closeCart
);


document
    .getElementById("emptyCart")
    .addEventListener(
        "click",
        emptyCart
);


/* =========================================================
   WHATSAPP CHECKOUT
========================================================= */

function buyNow() {

    if (cart.length === 0) {

        showToast(
            "Your bag is empty"
        );

        return;

    }


    let total = 0;


    const orderId =
        "FS" +
        Math.floor(
            100000 +
            Math.random() * 900000
        );


    let message =
        `F1rstep Shoes Order\n\n`;


    message +=
        `Order ID: ${orderId}\n`;


    cart.forEach((item, index) => {

        const price =
            getNumericPrice(item.price);

        const subtotal =
            price * item.qty;

        total += subtotal;


        message +=
            `\n--------------------\n`;

        message +=
            `Product ${index + 1}\n`;

        message +=
            `Name: ${item.name}\n`;

        message +=
            `Size: UK ${item.size}\n`;

        message +=
            `Price: ₹${price}\n`;

        message +=
            `Quantity: ${item.qty}\n`;

        message +=
            `Subtotal: ₹${subtotal}\n`;

        message +=
            `Image: ${item.image}\n`;

    });


    message +=
        `\n--------------------\n`;

    message +=
        `Total Amount: ₹${total}\n\n`;

    message +=
        `Thank you for shopping with F1rstep Shoes.`;


    const encoded =
        encodeURIComponent(message);


    window.open(
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`,
        "_blank"
    );

}


/* =========================================================
   CHECKOUT BUTTON
========================================================= */

document
    .getElementById("buyNow")
    .addEventListener(
        "click",
        buyNow
    );


/* =========================================================
   IMAGE MODAL
========================================================= */

function openModal(images) {

    if (!images || images.length === 0) {
        return;
    }


    currentImages = images;


    mainImage.src =
        images[0];


    thumbnailContainer.innerHTML = "";


    images.forEach((image, index) => {

        const thumbnail =
            document.createElement("img");


        thumbnail.src = image;

        thumbnail.alt =
            `Product image ${index + 1}`;


        thumbnail.addEventListener(
            "click",
            () => {

                mainImage.src =
                    image;

            }
        );


        thumbnailContainer.appendChild(
            thumbnail
        );

    });


    imageModal.classList.add("open");

    document.body.classList.add("no-scroll");

}


function closeModal() {

    imageModal.classList.remove("open");

    document.body.classList.remove("no-scroll");

}


document
    .getElementById("closeImage")
    .addEventListener(
        "click",
        closeModal
);


/* =========================================================
   SEARCH
========================================================= */

function searchProducts() {

    const value =
        searchBar.value
            .trim()
            .toLowerCase();


    clearSearch.classList.toggle(
        "visible",
        value.length > 0
    );


    if (!value) {

        searchStatus.classList.remove(
            "visible"
        );

        renderProducts(allProducts);

        return;

    }


    const results =
        allProducts.filter(product => {

            const searchable = [

                product.name,

                product.category,

                product.tag,

                product.stock

            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();


            return searchable.includes(value);

        });


    searchStatus.classList.add(
        "visible"
    );


    searchStatusText.textContent =
        `${results.length} ${
            results.length === 1
                ? "product"
                : "products"
        } found for "${searchBar.value.trim()}"`;


    renderProducts(results);

}


searchBar.addEventListener(
    "input",
    searchProducts
);


clearSearch.addEventListener(
    "click",
    () => {

        searchBar.value = "";

        clearSearch.classList.remove(
            "visible"
        );

        searchStatus.classList.remove(
            "visible"
        );

        renderProducts(allProducts);

        searchBar.focus();

    }
);


/* =========================================================
   ADMIN ACCESS
   ONLY THROUGH 3-LINE BUTTON
========================================================= */

document
    .getElementById("menuButton")
    .addEventListener(
        "click",
        openAdmin
    );


function openAdmin() {

    const password =
        prompt(
            "Enter Host Password"
        );


    if (password === null) {
        return;
    }


    if (password !== PASSCODE) {

        alert("Wrong Password");

        return;

    }


    adminOverlay.classList.add("open");

    document.body.classList.add("no-scroll");

    populateDeleteSelect(
        allProducts
    );

}


function closeAdmin() {

    adminOverlay.classList.remove(
        "open"
    );

    document.body.classList.remove(
        "no-scroll"
    );

}


document
    .getElementById("closeAdmin")
    .addEventListener(
        "click",
        closeAdmin
);


/* =========================================================
   UPLOAD PRODUCT
========================================================= */

async function uploadProduct() {

    const name =
        document
            .getElementById("product-name")
            .value
            .trim();


    const price =
        document
            .getElementById("product-price")
            .value
            .trim();


    const discount =
        document
            .getElementById("product-discount")
            .value
            .trim();


    const category =
        document
            .getElementById("product-category")
            .value;


    const tag =
        document
            .getElementById("product-tag")
            .value
            .trim();


    const stock =
        document
            .getElementById("product-stock")
            .value;


    const images =
        document
            .getElementById("product-images")
            .value
            .split(",")
            .map(image => image.trim())
            .filter(Boolean);


    const sizes =
        document
            .getElementById("product-sizes")
            .value
            .split(",")
            .map(size => size.trim())
            .filter(Boolean);


    if (!name || !price || images.length === 0) {

        alert(
            "Please enter product name, price and at least one image."
        );

        return;

    }


    const button =
        document.getElementById(
            "uploadProduct"
        );


    button.disabled = true;

    button.textContent =
        "Uploading...";


    try {

        await db.collection("products").add({

            name,

            price,

            discount:
                discount || 0,

            category,

            tag:
                tag || "F1rstep",

            stock,

            images,

            sizes:
                sizes.length
                    ? sizes
                    : ["7", "8", "9", "10"]

        });


        showToast(
            "Product uploaded successfully"
        );


        clearAdminForm();


        await loadProducts();


    } catch (error) {

        console.error(error);

        alert(
            "Unable to upload product. Check Firebase."
        );

    } finally {

        button.disabled = false;

        button.textContent =
            "Upload Product";

    }

}


/* =========================================================
   CLEAR ADMIN FORM
========================================================= */

function clearAdminForm() {

    document.getElementById(
        "product-name"
    ).value = "";


    document.getElementById(
        "product-price"
    ).value = "";


    document.getElementById(
        "product-discount"
    ).value = "";


    document.getElementById(
        "product-tag"
    ).value = "";


    document.getElementById(
        "product-images"
    ).value = "";


    document.getElementById(
        "product-sizes"
    ).value = "";

}


/* =========================================================
   UPLOAD BUTTON
========================================================= */

document
    .getElementById("uploadProduct")
    .addEventListener(
        "click",
        uploadProduct
);


/* =========================================================
   DELETE SELECT
========================================================= */

function populateDeleteSelect(products) {

    const select =
        document.getElementById(
            "delete-product-select"
        );


    if (!select) {
        return;
    }


    select.innerHTML = `

        <option value="">
            Select product
        </option>

    `;


    products.forEach(product => {

        const option =
            document.createElement("option");


        option.value =
            product.id;


        option.textContent =
            product.name ||
            "Unnamed Product";


        select.appendChild(option);

    });

}


/* =========================================================
   DELETE PRODUCT
========================================================= */

async function deleteSelectedProduct() {

    const select =
        document.getElementById(
            "delete-product-select"
        );


    const productId =
        select.value;


    if (!productId) {

        alert(
            "Please select a product."
        );

        return;

    }


    const confirmed =
        confirm(
            "Delete this product permanently?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await db
            .collection("products")
            .doc(productId)
            .delete();


        showToast(
            "Product deleted"
        );


        await loadProducts();


    } catch (error) {

        console.error(error);

        alert(
            "Unable to delete product."
        );

    }

}


document
    .getElementById("deleteProduct")
    .addEventListener(
        "click",
        deleteSelectedProduct
);


/* =========================================================
   ESC KEY
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (event.key !== "Escape") {
            return;
        }


        closeAdmin();

        closeCart();

        closeModal();

    }
);


/* =========================================================
   CLOSE OVERLAYS WHEN CLICKING BACKDROP
========================================================= */

adminOverlay.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            adminOverlay
        ) {

            closeAdmin();

        }

    }
);


imageModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            imageModal
        ) {

            closeModal();

        }

    }
);


cartPopup.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            cartPopup
        ) {

            closeCart();

        }

    }
);


/* =========================================================
   SCROLL REVEALS
========================================================= */

const observer =
    new IntersectionObserver(
        entries => {

            entries.forEach(entry => {

                if (
                    entry.isIntersecting
                ) {

                    entry.target.classList.add(
                        "visible"
                    );

                    observer.unobserve(
                        entry.target
                    );

                }

            });

        },
        {
            threshold: 0.08
        }
    );


document
    .querySelectorAll(".reveal")
    .forEach(element => {

        observer.observe(element);

    });


/* =========================================================
   CATEGORY LINKS
========================================================= */

document
    .querySelectorAll(
        ".category-links a, .nav-links a"
    )
    .forEach(link => {

        link.addEventListener(
            "click",
            () => {

                const target =
                    link.getAttribute(
                        "href"
                    );


                if (
                    target &&
                    target.startsWith("#")
                ) {

                    const element =
                        document.querySelector(
                            target
                        );


                    if (element) {

                        setTimeout(() => {

                            element.scrollIntoView({
                                behavior: "smooth",
                                block: "start"
                            });

                        }, 10);

                    }

                }

            }
        );

    });


/* =========================================================
   INITIALIZE
========================================================= */

loadProducts();

updateCart();