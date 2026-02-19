const USERS = [
    { user: "johndoe", email: "johndoe@ejemplo.com", pass: "123456789" },
    { user: "janedoe", email: "janedoe@ejemplo.com", pass: "abcdefg" }
];

document.getElementById("loginForm").addEventListener("submit", (e) => {
    e.preventDefault();

    const u = document.getElementById("loginUser").value.trim();
    const p = document.getElementById("loginPass").value;

    const users = USERS
    const ok = users.some(x => x.user === u && x.pass === p);

    const msg = document.getElementById("loginMsg");

    if (!ok) {
        msg.textContent = "Usuario o contraseña incorrectos";
        return;
    }

    msg.textContent = "";
    location.href = "inicio.html";
});