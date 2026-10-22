const filterButtons = document.querySelectorAll(".filter-button");
const productCards = document.querySelectorAll(".product-card");
const cartButton = document.querySelector(".cart-button");
const cartCount = document.querySelector(".cart-count");
const toast = document.querySelector(".toast");
const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
const newsletterForm = document.querySelector(".newsletter-form");
const formMessage = document.querySelector(".form-message");
const dialogBackdrop = document.querySelector(".dialog-backdrop");
const closeDialogButton = document.querySelector(".dialog-close");
const cartItemsContainer = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total strong");
const checkoutForm = document.querySelector(".checkout-form");
const checkoutMessage = document.querySelector(".checkout-message");

const cart = new Map();
const priceFormatter = new Intl.NumberFormat("ru-MD", {
    style: "currency",
    currency: "MDL",
    maximumFractionDigits: 0
});
let toastTimeout;

filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const filter = button.dataset.filter;
        filterButtons.forEach((item) => item.classList.toggle("is-active", item === button));

        productCards.forEach((card) => {
            card.hidden = filter !== "all" && card.dataset.category !== filter;
        });
    });
});

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimeout);
    toastTimeout = window.setTimeout(() => toast.classList.remove("is-visible"), 2500);
}

document.querySelectorAll(".add-button").forEach((button) => {
    button.addEventListener("click", () => {
        const card = button.closest(".product-card");
        const name = card.querySelector("h3").textContent;
        const price = Number(card.querySelector("[data-price]").dataset.price);
        const item = cart.get(name) ?? { name, price, quantity: 0 };
        item.quantity += 1;
        cart.set(name, item);
        updateCart();
        showToast(`«${name}» добавлен в корзину`);
    });
});

function updateCart() {
    const count = [...cart.values()].reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = String(count);
    cartButton.setAttribute("aria-label", `Корзина, ${count} товаров`);
    cartItemsContainer.replaceChildren();

    if (cart.size === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "cart-empty";
        emptyMessage.textContent = "Пока здесь пусто — выберите букет из каталога.";
        cartItemsContainer.append(emptyMessage);
    }

    let total = 0;
    cart.forEach((item, name) => {
        total += item.price * item.quantity;
        const row = document.createElement("div");
        row.className = "cart-item";

        const details = document.createElement("div");
        const itemName = document.createElement("div");
        itemName.className = "cart-item-name";
        itemName.textContent = item.name;
        const itemPrice = document.createElement("div");
        itemPrice.className = "cart-item-price";
        itemPrice.textContent = `${priceFormatter.format(item.price)} за букет`;
        details.append(itemName, itemPrice);

        const controls = document.createElement("div");
        controls.className = "cart-item-controls";
        const decrease = document.createElement("button");
        decrease.type = "button";
        decrease.textContent = "−";
        decrease.setAttribute("aria-label", `Убрать один букет «${name}»`);
        decrease.addEventListener("click", () => changeQuantity(name, -1));
        const quantity = document.createElement("span");
        quantity.textContent = String(item.quantity);
        const increase = document.createElement("button");
        increase.type = "button";
        increase.textContent = "+";
        increase.setAttribute("aria-label", `Добавить букет «${name}»`);
        increase.addEventListener("click", () => changeQuantity(name, 1));
        controls.append(decrease, quantity, increase);
        row.append(details, controls);
        cartItemsContainer.append(row);
    });

    cartTotal.textContent = priceFormatter.format(total);
}

function changeQuantity(name, change) {
    const item = cart.get(name);
    if (!item) return;
    item.quantity += change;
    if (item.quantity <= 0) cart.delete(name);
    updateCart();
}

function openCart() {
    updateCart();
    checkoutMessage.textContent = "";
    dialogBackdrop.hidden = false;
    document.body.style.overflow = "hidden";
    closeDialogButton.focus();
}

function closeCart() {
    dialogBackdrop.hidden = true;
    document.body.style.overflow = "";
    cartButton.focus();
}

cartButton.addEventListener("click", openCart);
closeDialogButton.addEventListener("click", closeCart);
dialogBackdrop.addEventListener("click", (event) => {
    if (event.target === dialogBackdrop) closeCart();
});
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !dialogBackdrop.hidden) closeCart();
});

checkoutForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (cart.size === 0) {
        checkoutMessage.textContent = "Сначала добавьте букет в корзину.";
        return;
    }
    if (!checkoutForm.reportValidity()) return;
    checkoutMessage.textContent = "Оплата maib ещё не подключена. Данные формы не отправлены, заказ не оформлен.";
});

menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    menuToggle.setAttribute("aria-label", isExpanded ? "Открыть меню" : "Закрыть меню");
    mainNav.classList.toggle("is-open", !isExpanded);
});

mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Открыть меню");
        mainNav.classList.remove("is-open");
    });
});

newsletterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const emailInput = newsletterForm.querySelector("input");
    if (!emailInput.reportValidity()) return;

    formMessage.textContent = "Спасибо! Вы подписались на наши письма.";
    newsletterForm.reset();
});
