const main = document.getElementsByTagName("main")[0];

// Modal
const overlay = document.getElementById("overlay");
const closeModalBtn = document.getElementById("closeModal");
const mName = document.getElementById("mName");
const mImg = document.getElementById("mImg");
const mId = document.getElementById("mId");
const mTypes = document.getElementById("mTypes");
const mDesc = document.getElementById("mDesc");

const pagination = document.getElementById("pagination");

// Filtrado
const searchName = document.getElementById("searchName");
const searchId = document.getElementById("searchId");
const typeSelect = document.getElementById("typeSelect");
const clearBtn = document.getElementById("clearFilters");

const PAGE_SIZE = 32;
const MAX_BUTTONS = 10;

let allPokemon = []; // lista base: [{name,url}]
let filteredPokemon = []; // lista filtrada
let currentPage = 1;

let typeIdSet = null; // Set de Ids permitidos por tipo (o null si no hay filtro)

function openModal() {
	overlay.classList.add("is-open");
	document.body.classList.add("no-scroll");
}

function closeModal() {
	overlay.classList.remove("is-open");
	document.body.classList.remove("no-scroll");
}

async function loadPokemonModal(id) {
    // despligue mientras carga
    mName.textContent = "Cargando...";
    mImg.src = "";
    mImg.alt = "";
    mId.textContent = "-";
    mTypes.textContent = "-";
    mDesc.textContent = "-";

    // detalle pokemon: id, nombre, tipos, sprite
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const pokemon = await res.json();

    // species: descripción
    const res2 = await fetch(pokemon.species.url);
    if (!res2.ok) throw new Error(`HTTP ${res2.status}`);
    const species = await res2.json();

    // Descripción en español
    const entry = species.flavor_text_entries.find(e => e.language.name === "es")

    // despliegue en modal
    mName.textContent = pokemon.name;
    mId.textContent = pokemon.id;

    mImg.src = pokemon.sprites?.front_default 
    || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;
    mImg.alt = pokemon.name;

    mTypes.textContent = pokemon.types
        .map(t => t.type.name)
        .join(", ");

    mDesc.textContent = entry ? entry.flavor_text : "Sin descripción.";
}


function idFromUrl(url) {
    return Number(url.split("/").filter(Boolean).pop());
}

function spriteUrlById(id) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}


function renderPage(page) {
    currentPage = page;

    const totalPages = Math.max(1, Math.ceil(filteredPokemon.length / PAGE_SIZE));
    if (currentPage > totalPages) currentPage = totalPages;

    const start = (currentPage - 1) * PAGE_SIZE;
    const slice = filteredPokemon.slice(start, start + PAGE_SIZE);

    main.innerHTML = slice.map(p => {
        const id = idFromUrl(p.url);
        return `
            <div class="pokemon-card" data-id="${id}">
                <img src="${spriteUrlById(id)}" alt="Imagen de ${p.name}">
                <h2>${p.name}</h2>
                <p class="texto-gris">#${id}</p>
            </div>
        `;
    }).join("");

    // Click en cualquier card
	main.addEventListener("click", async (e) => {
        const card = e.target.closest(".pokemon-card");
        if (!card) return;

        try {
            openModal();
            await loadPokemonModal(card.dataset.id);
        } catch (err) {
            console.error(err);
            mName.textContent = "Error";
            mDesc.textContent = "No se pudo cargar el detalle.";
        }
	});

    renderPaginationButtons();
    window.scrollTo({ top: 0, behavior: "smooth" }); // al final para posible click en card durante la carga
}

function renderPaginationButtons() {
    const totalPages = Math.max(1, Math.ceil(filteredPokemon.length / PAGE_SIZE));

    const half = Math.floor(MAX_BUTTONS / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + MAX_BUTTONS - 1);
    start = Math.max(1, end - MAX_BUTTONS + 1);

    let html = "";
    html += `<button ${currentPage === 1 ? "disabled" : ""} data-page="${currentPage - 1}">Anterior</button>`;

    if (start > 1) {
        html += `<button data-page="1">1</button>`;
        if (start > 2) html += `<span class="texto-gris">...</span>`;
    }

    for (let p = start; p <= end; p++) {
        html += `<button class="${p === currentPage ? "activo" : ""}" data-page="${p}">${p}</button>`;
    }

    if (end < totalPages) {
        if (end < totalPages - 1) html += `<span class="texto-gris">...</span>`;
        html += `<button data-page="${totalPages}">${totalPages}</button>`;
    }

    html += `<button ${currentPage === totalPages ? "disabled" : ""} data-page="${currentPage + 1}">Siguiente</button>`;

    pagination.innerHTML = html;

    pagination.querySelectorAll("button[data-page]").forEach(btn => {
        btn.addEventListener("click", () => {
            const page = Number(btn.dataset.page);
            if (page >= 1 && page <= totalPages) renderPage(page);
        });
    });
}

function applyFilters() {
    const nameQuery = searchName.value.trim().toLowerCase();
    const idQuery = searchId.value.trim(); // string
    const idNum = idQuery ? Number(idQuery) : null;

    filteredPokemon = allPokemon.filter(p => {
        const id = idFromUrl(p.url);

        // filtro tipo (si existe)
        if (typeIdSet && !typeIdSet.has(id)) return false;

        // filtro nombre
        if (nameQuery && !p.name.includes(nameQuery)) return false;

        // filtro id
        if (idNum !== null && id !== idNum) return false;

        return true;
    });

    renderPage(1);
}

async function loadTypesList() {
    const res = await fetch("https://pokeapi.co/api/v2/type?limit=100&offset=0");
    const data = await res.json();

    // llena el select (filtro por tipo)
    data.results.forEach(t => {
        const opt = document.createElement("option");
        opt.value = t.name;
        opt.textContent = t.name;
        typeSelect.appendChild(opt);
    });
}

async function loadTypeFilter(typeName) {
    if (!typeName) {
        typeIdSet = null; // sin filtro
        applyFilters();
        return;
    }

    // trae todos los pokémon de ese tipo
    const res = await fetch(`https://pokeapi.co/api/v2/type/${typeName}`);
    const data = await res.json();

    // crea un Set de Ids
    typeIdSet = new Set(
        data.pokemon.map(x => idFromUrl(x.pokemon.url))
    );

    applyFilters();
}


async function loadAllPokemon() {
    const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1350&offset=0");
    const data = await res.json();
    allPokemon = data.results;
    filteredPokemon = allPokemon.slice(); // para crear una copia sin referenciar allPokemon
    renderPage(1);
}

function setupEvents() {
    // filtrar cuando cambie (o al escribir)
    searchName.addEventListener("input", applyFilters);
    searchId.addEventListener("input", applyFilters);

    typeSelect.addEventListener("change", () => {
        loadTypeFilter(typeSelect.value);
    });

    clearBtn.addEventListener("click", () => {
        searchName.value = "";
        searchId.value = "";
        typeSelect.value = "";
        typeIdSet = null;
        applyFilters();
    });

    closeModalBtn.addEventListener("click", closeModal);
}

async function init() {
    try {
        setupEvents();
        await Promise.all([loadAllPokemon(), loadTypesList()]);
    } catch (e) {
        console.error(e);
        main.innerHTML = "<p>No se pudo cargar la Pokedex</p>";
    }
};

init();
