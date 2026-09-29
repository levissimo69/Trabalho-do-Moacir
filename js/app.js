/* =========================================================
   FORTE — Front-end demo
   Sem backend: os dados podem ser alterados e ficam no localStorage.
========================================================= */

const STORAGE_KEY = "forte_demo_state";

const defaultState = {
    currentCompany: {
        name: "Mercadinho Silva",
        initials: "MS"
    },

    revenue: 8450,
    expenses: 3180,
    salesCount: 126,
    customersCount: 184,

    products: [
        { id: 1, name: "Café especial", category: "Alimentos", icon: "☕", stock: 4, sales30: 48, price: 18.90, margin: 42, trend: 32 },
        { id: 2, name: "Bolo de chocolate", category: "Alimentos", icon: "🍰", stock: 7, sales30: 31, price: 32.00, margin: 38, trend: 18 },
        { id: 3, name: "Suco natural", category: "Bebidas", icon: "🥤", stock: 3, sales30: 25, price: 9.50, margin: 31, trend: 12 },
        { id: 4, name: "Sanduíche artesanal", category: "Alimentos", icon: "🥪", stock: 12, sales30: 21, price: 22.90, margin: 35, trend: 9 },
        { id: 5, name: "Água mineral", category: "Bebidas", icon: "💧", stock: 25, sales30: 17, price: 4.50, margin: 19, trend: -3 },
        { id: 6, name: "Combo almoço", category: "Alimentos", icon: "🍱", stock: 18, sales30: 15, price: 29.90, margin: 34, trend: 6 }
    ],

    customers: [
        { id: 1, name: "Mariana Souza", phone: "(85) 99999-1234", purchases: 12, value: 486.20, status: "Recorrente", lastBuy: "Hoje" },
        { id: 2, name: "Carlos Henrique", phone: "(85) 98888-4567", purchases: 8, value: 321.90, status: "Recorrente", lastBuy: "Hoje" },
        { id: 3, name: "Ana Beatriz", phone: "(85) 97777-8899", purchases: 5, value: 197.50, status: "Recorrente", lastBuy: "Ontem" },
        { id: 4, name: "João Victor", phone: "(85) 96666-7788", purchases: 4, value: 154.80, status: "Novo", lastBuy: "Ontem" },
        { id: 5, name: "Paulo Mendes", phone: "(85) 95555-1122", purchases: 3, value: 118.40, status: "Novo", lastBuy: "2 dias" },
        { id: 6, name: "Larissa Lima", phone: "(85) 94444-3311", purchases: 2, value: 74.90, status: "Novo", lastBuy: "3 dias" }
    ],

    sales: [
        { customer: "Mariana Souza", time: "17:42", items: "3 itens", payment: "Pix", value: 89.90 },
        { customer: "Carlos Henrique", time: "16:10", items: "5 itens", payment: "Cartão", value: 142.00 },
        { customer: "Ana Beatriz", time: "14:31", items: "2 itens", payment: "Pix", value: 54.90 },
        { customer: "João Victor", time: "13:18", items: "2 itens", payment: "Dinheiro", value: 72.00 },
        { customer: "Paulo Mendes", time: "11:04", items: "4 itens", payment: "Cartão", value: 118.40 },
        { customer: "Larissa Lima", time: "09:26", items: "2 itens", payment: "Pix", value: 64.90 }
    ],

    transactions: [
        { title: "Venda #126", detail: "Hoje · Pix", value: 89.90, type: "in", icon: "↗" },
        { title: "Fornecedor", detail: "Hoje · Estoque", value: -320, type: "out", icon: "R$" },
        { title: "Venda #125", detail: "Ontem · Cartão", value: 142, type: "in", icon: "↗" },
        { title: "Energia", detail: "Ontem · Operação", value: -180, type: "out", icon: "⚡" },
        { title: "Venda #124", detail: "Ontem · Pix", value: 72, type: "in", icon: "↗" }
    ]
};

const state = loadState();

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function loadState() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? { ...defaultState, ...JSON.parse(saved) } : structuredClone(defaultState);
    } catch {
        return structuredClone(defaultState);
    }
}

function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function currency(value) {
    return Number(value || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function initials(name) {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0])
        .join("")
        .toUpperCase();
}

function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2600);
}

/* =========================================================
   NAVIGATION
========================================================= */

const pageTitles = {
    overview: "Visão geral",
    analytics: "Estatísticas",
    finance: "Financeiro",
    stock: "Estoque",
    sales: "Vendas",
    customers: "Clientes",
    growth: "Oportunidades",
    store: "Vitrine digital"
};

function navigate(viewName) {
    const target = $(`#view-${viewName}`);
    if (!target) return;

    $$(".view").forEach(view => view.classList.remove("active"));
    target.classList.add("active");

    $$(".nav-item").forEach(item => {
        item.classList.toggle("active", item.dataset.view === viewName);
    });

    $("#page-title").textContent = pageTitles[viewName];

    closeQuickMenu();
    closePeriodMenu();

    if (window.innerWidth < 640) {
        closeCompanyMenu();
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
}

$$(".nav-item").forEach(item => {
    item.addEventListener("click", () => navigate(item.dataset.view));
});

document.addEventListener("click", (event) => {
    const target = event.target.closest("[data-view-jump]");
    if (target) {
        navigate(target.dataset.viewJump);
    }
});

/* =========================================================
   COMPANY SWITCHER
========================================================= */

const companySelector = $("#company-selector");
const companyMenu = $("#company-menu");

function closeCompanyMenu() {
    companyMenu.classList.remove("open");
}

companySelector.addEventListener("click", (event) => {
    if (event.target.closest(".company-menu button")) return;
    companyMenu.classList.toggle("open");
});

$$(".company-menu button[data-company]").forEach(button => {
    button.addEventListener("click", () => {
        state.currentCompany = {
            name: button.dataset.company,
            initials: button.dataset.initials
        };

        updateCompanyUI();
        saveState();
        closeCompanyMenu();

        showToast(`Negócio "${state.currentCompany.name}" selecionado.`);
    });
});

$("#add-company").addEventListener("click", (event) => {
    event.stopPropagation();

    const name = prompt("Nome do novo negócio:");
    if (!name?.trim()) return;

    state.currentCompany = {
        name: name.trim(),
        initials: initials(name.trim())
    };

    updateCompanyUI();
    saveState();
    closeCompanyMenu();
    showToast("Novo negócio adicionado ao ambiente de demonstração.");
});

function updateCompanyUI() {
    $(".company-avatar").textContent = state.currentCompany.initials;
    $("#company-name-sidebar").textContent = state.currentCompany.name;
    $("#store-name-input").value = state.currentCompany.name;

    const storeName = $(".store-cover h2");
    if (storeName) storeName.textContent = state.currentCompany.name;

    const title = $(".store-title strong");
    if (title) title.textContent = state.currentCompany.name;

    const storeAvatar = $(".store-avatar");
    if (storeAvatar) storeAvatar.textContent = state.currentCompany.initials;
}

/* =========================================================
   TOPBAR — QUICK MENU
========================================================= */

const quickMenu = $("#quick-menu");
const quickButton = $("#quick-action-btn");

function closeQuickMenu() {
    quickMenu.classList.remove("open");
}

quickButton.addEventListener("click", (event) => {
    event.stopPropagation();
    closePeriodMenu();
    quickMenu.classList.toggle("open");
});

$$(".quick-menu button").forEach(button => {
    button.addEventListener("click", () => {
        openModal(button.dataset.modal);
        closeQuickMenu();
    });
});

/* =========================================================
   PERIOD
========================================================= */

const periodButton = $("#period-selector");
const periodMenu = $("#period-menu");

function closePeriodMenu() {
    periodMenu.classList.remove("open");
}

periodButton.addEventListener("click", (event) => {
    event.stopPropagation();
    closeQuickMenu();
    periodMenu.classList.toggle("open");
});

$$(".period-menu button").forEach(button => {
    button.addEventListener("click", () => {
        $("#period-label").textContent = button.dataset.period;
        closePeriodMenu();
        showToast(`Período alterado para ${button.dataset.period}.`);
    });
});

document.addEventListener("click", (event) => {
    if (!event.target.closest("#quick-menu") && !event.target.closest("#quick-action-btn")) {
        closeQuickMenu();
    }

    if (!event.target.closest("#period-menu") && !event.target.closest("#period-selector")) {
        closePeriodMenu();
    }

    if (!event.target.closest("#company-selector")) {
        closeCompanyMenu();
    }
});

/* =========================================================
   NOTIFICATIONS
========================================================= */

const drawer = $("#notification-drawer");
const drawerBackdrop = $("#drawer-backdrop");

function openDrawer() {
    drawer.classList.add("open");
    drawerBackdrop.classList.add("open");
}

function closeDrawer() {
    drawer.classList.remove("open");
    drawerBackdrop.classList.remove("open");
}

$("#notification-btn").addEventListener("click", openDrawer);
$("#close-drawer").addEventListener("click", closeDrawer);
drawerBackdrop.addEventListener("click", closeDrawer);

/* =========================================================
   MOBILE SIDEBAR
========================================================= */

$("#menu-btn").addEventListener("click", () => {
    // Mantemos a sidebar original como modal lateral no mobile.
    const sidebar = $("#sidebar");

    if (sidebar.classList.contains("mobile-open")) {
        sidebar.classList.remove("mobile-open");
        return;
    }

    sidebar.classList.add("mobile-open");
});

/* =========================================================
   OVERVIEW RENDER
========================================================= */

function renderMetrics() {
    $("#metric-revenue").textContent = currency(state.revenue);
    $("#metric-profit").textContent = currency(state.revenue - state.expenses);
    $("#metric-sales").textContent = state.salesCount;
    $("#metric-customers").textContent = state.customersCount;

    $("#hero-result").textContent = currency(state.revenue - state.expenses);
}

function renderTopProducts() {
    const container = $("#top-products");

    const sorted = [...state.products]
        .sort((a, b) => b.sales30 - a.sales30)
        .slice(0, 4);

    container.innerHTML = sorted.map((product, index) => `
        <div class="rank-item">
            <span class="rank-number">0${index + 1}</span>
            <div>
                <strong>${product.icon} ${product.name}</strong>
                <small>${product.sales30} vendas nos últimos 30 dias</small>
            </div>
            <b>${currency(product.price)}</b>
        </div>
    `).join("");
}

function renderInsights() {
    const lowCount = state.products.filter(product => product.stock <= 5).length;
    const list = $("#insight-list");
    const count = $("#insight-count");

    count.textContent = Math.max(4, lowCount + 3);

    const items = [
        {
            type: "warning",
            symbol: "!",
            title: `${lowCount} ${lowCount === 1 ? "produto está" : "produtos estão"} com estoque baixo`,
            text: "Você pode perder vendas caso não reponha em breve.",
            action: "stock",
            label: "Ver"
        },
        {
            type: "positive",
            symbol: "↗",
            title: "As vendas cresceram 12,4%",
            text: "O ritmo atual está acima do mês anterior.",
            action: "analytics",
            label: "Analisar"
        },
        {
            type: "info",
            symbol: "R$",
            title: "Produto com maior margem: Café especial",
            text: "Representa 17% do resultado das vendas.",
            action: "analytics",
            label: "Ver"
        },
        {
            type: "purple",
            symbol: "♙",
            title: "18 novos clientes neste mês",
            text: "4 deles já voltaram a comprar.",
            action: "customers",
            label: "Ver"
        }
    ];

    list.innerHTML = items.map(item => `
        <div class="insight-item ${item.type}">
            <div class="insight-symbol">${item.symbol}</div>
            <div>
                <strong>${item.title}</strong>
                <p>${item.text}</p>
            </div>
            <button class="link-button" data-view-jump="${item.action}">${item.label}</button>
        </div>
    `).join("");
}

/* =========================================================
   ANALYTICS
========================================================= */

function renderAnalyticsTable() {
    $("#analytics-table").innerHTML = [...state.products]
        .sort((a, b) => b.sales30 - a.sales30)
        .map(product => {
            const trend = product.trend >= 0
                ? `<span class="table-trend">↑ ${product.trend}%</span>`
                : `<span style="color:#b77b42">↓ ${Math.abs(product.trend)}%</span>`;

            return `
                <tr>
                    <td><strong>${product.icon} ${product.name}</strong></td>
                    <td>${product.sales30}</td>
                    <td>${currency(product.sales30 * product.price)}</td>
                    <td>${product.margin}%</td>
                    <td>${trend}</td>
                </tr>
            `;
        }).join("");
}

/* =========================================================
   FINANCE
========================================================= */

function renderTransactions() {
    const container = $("#transaction-list");

    container.innerHTML = state.transactions.map(transaction => `
        <div class="transaction-item">
            <div class="transaction-icon">${transaction.icon}</div>
            <div>
                <strong>${transaction.title}</strong>
                <small>${transaction.detail}</small>
            </div>
            <b class="${transaction.type === "in" ? "positive" : "negative"}">
                ${transaction.type === "in" ? "+" : "−"} ${currency(Math.abs(transaction.value))}
            </b>
        </div>
    `).join("");
}

/* =========================================================
   STOCK
========================================================= */

function renderStockTable() {
    const query = ($("#stock-search").value || "").toLowerCase().trim();
    const filter = $("#stock-filter").value;

    const products = state.products.filter(product => {
        const matchesSearch =
            product.name.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query);

        const matchesFilter =
            filter === "all" ||
            (filter === "low" && product.stock <= 5) ||
            (filter === "available" && product.stock > 5);

        return matchesSearch && matchesFilter;
    });

    $("#stock-table").innerHTML = products.map(product => {
        let status = "Disponível";
        let statusClass = "";

        if (product.stock <= 5) {
            status = "Estoque baixo";
            statusClass = "low";
        }

        if (product.stock === 0) {
            status = "Sem estoque";
            statusClass = "stopped";
        }

        return `
            <tr>
                <td>
                    <div class="stock-name">
                        <span class="product-icon">${product.icon}</span>
                        <strong>${product.name}</strong>
                    </div>
                </td>
                <td>${product.category}</td>
                <td>${product.stock}</td>
                <td>${product.sales30}</td>
                <td>${currency(product.price)}</td>
                <td><span class="stock-status ${statusClass}">${status}</span></td>
            </tr>
        `;
    }).join("");

    $("#stock-total-items").textContent = state.products.reduce((sum, product) => sum + product.stock, 0);
    $("#stock-low-count").textContent = state.products.filter(product => product.stock <= 5).length;
}

$("#stock-search").addEventListener("input", renderStockTable);
$("#stock-filter").addEventListener("change", renderStockTable);

/* =========================================================
   SALES
========================================================= */

function renderSalesTable() {
    $("#sales-table").innerHTML = state.sales.map(sale => `
        <tr>
            <td><strong>${sale.customer}</strong></td>
            <td>${sale.time}</td>
            <td>${sale.items}</td>
            <td>${sale.payment}</td>
            <td><strong>${currency(sale.value)}</strong></td>
            <td><span class="stock-status">Concluída</span></td>
        </tr>
    `).join("");
}

/* =========================================================
   CUSTOMERS
========================================================= */

function renderCustomers() {
    const query = ($("#customer-search").value || "").toLowerCase().trim();

    const filtered = state.customers.filter(customer =>
        `${customer.name} ${customer.phone}`.toLowerCase().includes(query)
    );

    $("#customer-grid").innerHTML = filtered.map(customer => `
        <article class="customer-card">
            <div class="customer-card-head">
                <div class="customer-card-avatar">${initials(customer.name)}</div>
                <div>
                    <strong>${customer.name}</strong>
                    <span>${customer.status} · ${customer.lastBuy}</span>
                </div>
            </div>

            <div class="customer-card-meta">
                <div>
                    <span>Compras</span>
                    <strong>${customer.purchases}</strong>
                </div>
                <div>
                    <span>Valor total</span>
                    <strong>${currency(customer.value)}</strong>
                </div>
            </div>
        </article>
    `).join("");

    $("#customer-total").textContent = state.customersCount + state.customers.length - defaultState.customers.length;
}

$("#customer-search").addEventListener("input", renderCustomers);

/* =========================================================
   STORE
========================================================= */

function renderStoreProducts() {
    $("#store-products").innerHTML = state.products.slice(0, 4).map(product => `
        <article class="store-product">
            <div class="store-product-photo">${product.icon}</div>
            <div class="store-product-info">
                <strong>${product.name}</strong>
                <span>${currency(product.price)}</span>
            </div>
        </article>
    `).join("");
}

$("#store-name-input").addEventListener("input", event => {
    const name = event.target.value.trim() || state.currentCompany.name;
    $(".store-cover h2").textContent = name;
    $(".store-title strong").textContent = name;
});

$("#store-description-input").addEventListener("input", event => {
    $(".store-cover p").textContent = event.target.value;
});

$("#save-store-btn").addEventListener("click", () => {
    const name = $("#store-name-input").value.trim();

    if (name) {
        state.currentCompany.name = name;
        state.currentCompany.initials = initials(name);
        updateCompanyUI();
        saveState();
    }

    showToast("Vitrine atualizada com sucesso.");
});

$$("[data-toggle]").forEach(toggle => {
    toggle.addEventListener("click", () => {
        toggle.classList.toggle("on");
    });
});

$("#share-store-btn").addEventListener("click", async () => {
    const fakeLink = `${location.href.split("#")[0]}?vitrine=${encodeURIComponent(state.currentCompany.name)}`;

    try {
        await navigator.clipboard.writeText(fakeLink);
        showToast("Link da vitrine copiado.");
    } catch {
        showToast("A vitrine está pronta para ser compartilhada.");
    }
});

/* =========================================================
   MODAL SYSTEM
========================================================= */

const modalBackdrop = $("#modal-backdrop");
const modalFields = $("#modal-fields");

const modalConfigs = {
    sale: {
        kicker: "NOVA VENDA",
        title: "Registrar venda",
        submit: "Salvar venda",
        fields: `
            <div class="modal-field">
                <label for="field-customer">Cliente</label>
                <input id="field-customer" name="customer" required placeholder="Nome do cliente">
            </div>
            <div class="modal-field">
                <label for="field-value">Valor da venda</label>
                <input id="field-value" name="value" type="number" min="0" step="0.01" required placeholder="0,00">
            </div>
            <div class="modal-field">
                <label for="field-payment">Forma de pagamento</label>
                <select id="field-payment" name="payment">
                    <option>Pix</option>
                    <option>Cartão</option>
                    <option>Dinheiro</option>
                </select>
            </div>
        `
    },

    expense: {
        kicker: "NOVA DESPESA",
        title: "Registrar despesa",
        submit: "Salvar despesa",
        fields: `
            <div class="modal-field">
                <label for="field-expense-name">Descrição</label>
                <input id="field-expense-name" name="description" required placeholder="Ex.: Compra de mercadorias">
            </div>
            <div class="modal-field">
                <label for="field-expense-value">Valor</label>
                <input id="field-expense-value" name="value" type="number" min="0" step="0.01" required placeholder="0,00">
            </div>
            <div class="modal-field">
                <label for="field-category">Categoria</label>
                <select id="field-category" name="category">
                    <option>Fornecedores</option>
                    <option>Operação</option>
                    <option>Marketing</option>
                    <option>Impostos</option>
                    <option>Outros</option>
                </select>
            </div>
        `
    },

    product: {
        kicker: "ESTOQUE",
        title: "Adicionar produto",
        submit: "Cadastrar produto",
        fields: `
            <div class="modal-field">
                <label for="field-product-name">Produto</label>
                <input id="field-product-name" name="name" required placeholder="Nome do produto">
            </div>
            <div class="modal-field">
                <label for="field-product-category">Categoria</label>
                <input id="field-product-category" name="category" required placeholder="Ex.: Alimentos">
            </div>
            <div class="modal-field">
                <label for="field-product-stock">Quantidade em estoque</label>
                <input id="field-product-stock" name="stock" type="number" min="0" required placeholder="0">
            </div>
            <div class="modal-field">
                <label for="field-product-price">Preço de venda</label>
                <input id="field-product-price" name="price" type="number" min="0" step="0.01" required placeholder="0,00">
            </div>
        `
    },

    customer: {
        kicker: "RELACIONAMENTO",
        title: "Novo cliente",
        submit: "Cadastrar cliente",
        fields: `
            <div class="modal-field">
                <label for="field-client-name">Nome</label>
                <input id="field-client-name" name="name" required placeholder="Nome do cliente">
            </div>
            <div class="modal-field">
                <label for="field-client-phone">Telefone</label>
                <input id="field-client-phone" name="phone" placeholder="(00) 00000-0000">
            </div>
        `
    }
};

function openModal(type) {
    const config = modalConfigs[type];
    if (!config) return;

    $("#modal-kicker").textContent = config.kicker;
    $("#modal-title").textContent = config.title;
    $("#modal-submit").textContent = config.submit;
    modalFields.innerHTML = config.fields;

    $("#modal-form").dataset.type = type;
    modalBackdrop.classList.add("open");

    setTimeout(() => {
        modalFields.querySelector("input")?.focus();
    }, 50);
}

function closeModal() {
    modalBackdrop.classList.remove("open");
    $("#modal-form").reset();
    $("#modal-form").removeAttribute("data-type");
}

$("#modal-close").addEventListener("click", closeModal);
$("#modal-cancel").addEventListener("click", closeModal);

modalBackdrop.addEventListener("click", (event) => {
    if (event.target === modalBackdrop) closeModal();
});

$$("[data-modal]").forEach(button => {
    button.addEventListener("click", () => openModal(button.dataset.modal));
});

$("#modal-form").addEventListener("submit", (event) => {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const type = event.currentTarget.dataset.type;

    if (type === "sale") {
        const saleValue = Number(form.get("value")) || 0;
        const customer = form.get("customer").trim();
        const payment = form.get("payment");

        state.sales.unshift({
            customer,
            time: "Agora",
            items: "1 item",
            payment,
            value: saleValue
        });

        state.revenue += saleValue;
        state.salesCount += 1;

        state.transactions.unshift({
            title: `Venda #${state.salesCount}`,
            detail: `Agora · ${payment}`,
            value: saleValue,
            type: "in",
            icon: "↗"
        });

        showToast("Venda registrada e adicionada às movimentações.");
    }

    if (type === "expense") {
        const expenseValue = Number(form.get("value")) || 0;
        const description = form.get("description").trim();
        const category = form.get("category");

        state.expenses += expenseValue;

        state.transactions.unshift({
            title: description,
            detail: `Agora · ${category}`,
            value: -expenseValue,
            type: "out",
            icon: "R$"
        });

        showToast("Despesa registrada no financeiro.");
    }

    if (type === "product") {
        const name = form.get("name").trim();
        const category = form.get("category").trim();
        const stock = Number(form.get("stock")) || 0;
        const price = Number(form.get("price")) || 0;

        state.products.push({
            id: Date.now(),
            name,
            category,
            icon: "📦",
            stock,
            sales30: 0,
            price,
            margin: 0,
            trend: 0
        });

        showToast("Produto adicionado ao estoque.");
    }

    if (type === "customer") {
        const name = form.get("name").trim();
        const phone = form.get("phone").trim();

        state.customers.unshift({
            id: Date.now(),
            name,
            phone: phone || "Telefone não informado",
            purchases: 0,
            value: 0,
            status: "Novo",
            lastBuy: "Ainda não comprou"
        });

        state.customersCount += 1;

        showToast("Cliente adicionado à sua base.");
    }

    saveState();
    renderAll();
    closeModal();
});

/* =========================================================
   OTHER ACTIONS
========================================================= */

$("#support-btn").addEventListener("click", () => {
    showToast("Central de ajuda: este protótipo está funcionando localmente.");
});

$("#performance-select").addEventListener("change", event => {
    const labels = {
        "30": "últimos 30 dias",
        "90": "últimos 3 meses",
        "365": "último ano"
    };

    showToast(`Análise alterada para ${labels[event.target.value]}.`);
});

$("#export-report-btn").addEventListener("click", () => {
    const report = [
        "FORTE — RELATÓRIO DO NEGÓCIO",
        `Empresa: ${state.currentCompany.name}`,
        `Faturamento: ${currency(state.revenue)}`,
        `Despesas: ${currency(state.expenses)}`,
        `Resultado: ${currency(state.revenue - state.expenses)}`,
        `Vendas: ${state.salesCount}`,
        `Clientes ativos: ${state.customersCount}`,
        "",
        "Gerado pelo protótipo front-end."
    ].join("\n");

    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "relatorio-forte.txt";
    link.click();
    URL.revokeObjectURL(link.href);

    showToast("Relatório exportado.");
});

/* =========================================================
   RENDER ALL
========================================================= */

function renderAll() {
    updateCompanyUI();
    renderMetrics();
    renderTopProducts();
    renderInsights();
    renderAnalyticsTable();
    renderTransactions();
    renderStockTable();
    renderSalesTable();
    renderCustomers();
    renderStoreProducts();
}

renderAll();
