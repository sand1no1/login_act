const header = document.getElementsByTagName("header")[0];
header.className = "header";
header.innerHTML = 
`
    <div class="logo">Mi Sitio</div>
    <nav class="menu">
        <a href="inicio.html" class="activo">Inicio</a>
        <a href="perfil.html">Perfil</a>
        <a href="servicios.html">Servicios</a>
    </nav>
`;

const footer = document.getElementsByTagName("footer")[0];
footer.className = "footer";
footer.innerHTML = `<p>Copyright 2026 Sitio</p>`;
