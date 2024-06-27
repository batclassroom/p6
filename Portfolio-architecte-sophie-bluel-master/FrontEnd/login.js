/* Vraiables Globales */ 
const email = document.querySelector("form #email");
const password = document.querySelector("form #password");
const form = document.querySelector("form");
const messageErreur = document.querySelector("#emailError");
let loginLink = document.querySelector("li #longinLink");
let result;

/* Fonction connexion */
async function login(user) {
  try {
    let response = await fetch("http://localhost:5678/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });
    if (response.ok) {
      result = await response.json();
      localStorage.setItem("Mytoken", result.token);
      window.location.href="index.html";
    } else {
      messageErreur.innerHTML = "Erreur sur l'email ou le mots de passe";
      messageErreur.style.color = "red";
    }
  } catch (error) {
    console.error(error);
  }
}
form.addEventListener("submit", function (e) {
  e.preventDefault();
  let user = {
    email: email.value,
    password: password.value,
  };
  login(user);
});


