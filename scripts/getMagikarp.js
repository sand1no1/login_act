const main = document.getElementsByTagName("main")[0];

async function loadMagikarp() {
    try {
        const res = await fetch("https://pokeapi.co/api/v2/pokemon/magikarp");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const magikarpData = await res.json();

        const magikarpName = magikarpData.name;
        const magikarpImage = magikarpData.sprites.front_default;

        main.innerHTML = `
            <div class="container">
                <img src="${magikarpImage}" alt="Imagen de ${magikarpName}">
                <h2>${magikarpName}</h2>
            </div>
        `;
    } catch (err) {
        console.error("Error en GET:", err);
        main.innerHTML = `<p>No se pudo cargar Magikarp.</p>`;
    }
}

loadMagikarp();