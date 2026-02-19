const USERS = [
    { user: "johndoe", email: "johndoe@ejemplo.com", pass: "123456789" },
    { user: "janedoe", email: "janedoe@ejemplo.com", pass: "abcdefg" }
];

document.getElementById("signupForm").addEventListener("submit", (e) => {
	e.preventDefault();

	const u = document.getElementById("signupUser").value.trim();
	const em = document.getElementById("signupEmail").value.trim();
	const p = document.getElementById("signupPass").value;
	const c = document.getElementById("signupConfirm").value;

	const msg = document.getElementById("signupMsg");

	if (p !== c) {
		msg.textContent = "No coincide la contraseña";
		return;
	}

	const users = USERS;

	if (users.some(x => x.user === u)) {
		msg.textContent = "Ese usuario ya existe";
		return;
	}

	if (users.some(x => x.email === em)) {
		msg.textContent = "Ese correo ya está registrado";
		return;
	}

	users.push({ user: u, email: em, pass: p });

	msg.textContent = "Registrado. Ahora inicia sesión.";
	console.log("Registrado.");

});