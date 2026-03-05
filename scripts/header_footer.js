const title = document.title;
const header = document.getElementsByTagName("header")[0];

header.className = "header";

header.innerHTML = 
`
    <div class="logo">Mi Sitio</div>
    <nav class="menu">
        <a href="inicio.html"${title === "Inicio" ? ` class="activo"` : ""}>Inicio</a>
        <a href="perfil.html"${title === "Perfil" ? ` class="activo"` : ""}>Perfil</a>
        <a href="servicios.html"${title === "Servicios" ? ` class="activo"` : ""}>Servicios</a>
        <a href="pokemon.html"${title === "Pokemon" ? ` class="activo"` : ""}>Pokemon</a>
        <a href="pokedex.html"${title === "Pokedex" ? ` class="activo"` : ""}>Pokedex</a>
    </nav>
`;

const footer = document.getElementsByTagName("footer")[0];
footer.className = "footer";
footer.innerHTML = `<p>Copyright 2026 Sitio</p>`;
