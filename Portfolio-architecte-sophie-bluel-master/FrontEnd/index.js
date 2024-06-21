let gallery = document.querySelector(".gallery");
const buttonSort = document.querySelector(".group-button-filter");
let works;
const token = localStorage.getItem("Mytoken");

/* Fonction qui retourne le tableau des works */
async function getWorks() {
  const response = await fetch("http://localhost:5678/api/works");
  return await response.json();
}
// getWorks();

/* Affichage des works dans le DOM */
async function displayWorks() {
  works = await getWorks();
  console.log(works);
  works = filter(works, "Tous");
  works.forEach((element) => {
    const figure = document.createElement("figure");
    const img = document.createElement("img");
    const figcaption = document.createElement("figcaption");
    img.src = element.imageUrl;
    figcaption.textContent = element.title;
    figure.appendChild(img);
    figure.appendChild(figcaption);
    gallery.appendChild(figure);
  });
}

displayWorks();

/* Affichage des bouttons filtres  */

async function getCategories() {
  const response = await fetch("http://localhost:5678/api/categories");
  return await response.json();
}

async function displayCategoriesBoutons() {
  if (token) {
    return;
  }
  const categories = await getCategories();
  categories.unshift({ id: "button-all", name: "Tous" }); // Ajoute une catégorie "Tous" avec l'ID "button-all"
  categories.forEach((categorie) => {
    const btn = document.createElement("button");
    btn.textContent = categorie.name;
    btn.setAttribute("data-category-name", categorie.name); // Ajoute un attribut de données pour stocker le name de la catégorie
    console.log(categorie.name);
    // Associer les classes css des boutons aux catégories
    switch (categorie.name) {
      case "Tous":
        btn.classList.add("button-all", "btnFilter");
        break;
      case "Objets":
        btn.classList.add("Objets", "btnFilter");
        break;
      case "Appartements":
        btn.classList.add("button-apartment", "btnFilter");
        break;
      case "Hotels & restaurants":
        btn.classList.add("button-hotel-restaurant", "btnFilter");
        break;
      default:
        break;
    }
    buttonSort.appendChild(btn);
  });
}
displayCategoriesBoutons();

// Fonction pour afficher les œuvres filtrées dans le DOM

function filter(array, category) {
  if (category === "Tous") return array;
  return array.filter((item) => item.category.name === category);
}

/* Fonction de la mise à jour de l'affichage par catégorie sélectionnée */
async function updateWorks(category) {
  const filteredWorks = filter(
    works,
    category
  ); /* Filtrer les elements en fonction de la catégorie sélectionnée */
  gallery.innerHTML = ""; /* remet a zéro pour éviter l'empilement */
  filteredWorks.forEach((element) => {
    /* Affiche les elements filtrées dans le DOM */
    const figure = document.createElement("figure");
    const img = document.createElement("img");
    const figcaption = document.createElement("figcaption");
    img.src = element.imageUrl;
    figcaption.textContent = element.title;
    figure.appendChild(img);
    figure.appendChild(figcaption);
    gallery.appendChild(figure);
  });
}

/* Filtrage au clic */
buttonSort.addEventListener("click", function (event) {
  if (event.target.tagName === "BUTTON") {
    /* Vérifie si c'est un bouton */
    const category =
      event.target.getAttribute(
        "data-category-name"
      ); /* Obtient la catégorie à partir de "data-category-name" */
    updateWorks(
      category
    ); /* Met à jour l'affichage avec la catégorie sélectionnée */
  }
});

/* Si l'utilisateur est connecté */
const logout = document.querySelector("li a");
const projetModif = document.querySelector("#projet-connected");
const editionMod = document.querySelector(".edtionMod");
const containerModal = document.querySelector(".containerModal");
const modal = document.querySelector(".modal");
const xmark = document.querySelector(".containerModal .fa-xmark");
const imageDynamique = document.querySelector(".imageDynamique");
if (token) {
  logout.textContent = "Logout";

  logout.addEventListener("click", () => {
    window.location.href = "index.html";
    localStorage.clear();
  });
}
/* Ajout de la barre noire dans le header */
function displayEditionMod() {
  if (token) {
    const headerEdtion = document.createElement("div");
    headerEdtion.classList.add("headerEdtion");
    headerEdtion.textContent = "Mode édition";
    editionMod.appendChild(headerEdtion);
    const iconHeaderEdition = document.createElement("i");
    iconHeaderEdition.classList.add("fa", "fa-regular", "fa-pen-to-square");
    headerEdtion.appendChild(iconHeaderEdition);
  } else {
    return;
  }
}
displayEditionMod();
/* Ajout des bouton modifier dans mes projets */
function displayProjetButton() {
  if (token) {
    const div = document.createElement("div");
    div.classList.add("divModif");
    projetModif.appendChild(div);
    const icon = document.createElement("i");
    icon.classList.add("fa", "fa-regular", "fa-pen-to-square");
    div.appendChild(icon);
    const button = document.createElement("button");
    button.textContent = "modifier";
    button.id = "button-modif";
    div.appendChild(button);
  } else {
    return;
  }
}
displayProjetButton();

/* Ajout du modal */
const buttonModif = document.querySelector(".projet-connected button")

buttonModif.addEventListener("click", function () {
  containerModal.style.display = "flex";
  modal.style.display = "flex";
  displayModalWorks();
});
xmark.addEventListener("click", function () {
  containerModal.style.display = "none";
});

containerModal.addEventListener("click", (e) => {
  console.log(e.target.className);
  if (e.target.className == "containerModal") {
    containerModal.style.display = "none";
    modalADDphoto.style.display = "none";
  }
});

async function displayModalWorks() {
  let modalWorks = await getWorks();
  const contenuPhoto = document.getElementById("imageDynamique");
  contenuPhoto.innerHTML = modalWorks
    .map(
      (item) => ` 
    <figure class="tailleImage" data-id="${item.id}">
        <img class="imageTall" src="${item.imageUrl}" alt ="${item.title}">
        <div class="poubelle">
            <i class="fa-solid fa-trash-can"></i>
        </div>
    </figure>`
    )
    .join("");

  // Ajout des événements de suppression
  const deleteIcons = document.querySelectorAll(".poubelle .fa-trash-can");
  deleteIcons.forEach((icon) => {
    icon.addEventListener("click", async (event) => {
      const figure = event.target.closest("figure");
      const id = figure.getAttribute("data-id");
      await deletePhoto(id);
      figure.remove();
    });
  });
}

// Fonction de suppression de photo
async function deletePhoto(id) {
  try {
    const response = await fetch(`http://localhost:5678/api/works/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Erreur lors de la suppression de la photo");
    }
    console.log("Photo supprimée avec succès");
    gallery.innerHTML = "";
    displayWorks();
  } catch (error) {
    console.error(error);
  }
}

/* 2eme modal (ajouter une photo) */

const btnAddModal = document.querySelector(".modal button");
const modalADDphoto = document.querySelector(".modalAjout");
const xmarkAdd = document.querySelector(".modalAjout #XmarkADD");
const arrowReturn = document.querySelector(".modalAjout .fa-arrow-left");


function displayModalAdd() {
  btnAddModal.addEventListener("click", () => {
    modal.style.display = "none";
    modalADDphoto.style.display = "flex";
    console.log("test");
  });
  xmarkAdd.addEventListener("click", () => {
    modalADDphoto.style.display = "none";
    containerModal.style.display ="none";
  });

  arrowReturn.addEventListener("click", () => {
    modalADDphoto.style.display = "none";
    modal.style.display = "flex";
  });
}
displayModalAdd();

/* Previsualisation de l'image */
const previewImg = document.querySelector(".containerPhoto img");
const inputFile = document.querySelector(".containerPhoto input");
const labelFile = document.querySelector(".containerPhoto label");
const iconFile = document.querySelector(".containerPhoto .fa-image");
const pFile = document.querySelector(".containerPhoto p");

/* Ecoute des changement sur l'inputFile */
inputFile.addEventListener("change",()=>{
    const file = inputFile.files[0];
    console.log(file);
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e){
            previewImg.src = e.target.result;
            previewImg.style.display = "flex";
            labelFile.style.display = "none";
            iconFile.style.display = "none";
            pFile.style.display = "none";
        }
        reader.readAsDataURL(file);
    }
})
/* creer une liste de categories dans le select*/
async function displayCategoryModal (){
    const select = document.querySelector(".containerModal select");
    const categorys = await getCategories();
    categorys.forEach(category => {
        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = category.name;
        select.appendChild(option);
    })
}
displayCategoryModal();
/* POST - ajouter une photo */
const form = document.querySelector(".containerModal form");
const titleInput = document.querySelector(".containerModal #title");
const categorySelect = document.querySelector(".containerModal #categories");
const buttonValidForm = document.querySelector(".modalAjout button");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData();
  formData.append("title", titleInput.value);
  formData.append("category", categorySelect.value);
  formData.append("image", inputFile.files[0]);

  try {
    const response = await fetch("http://localhost:5678/api/works", {
      method: "POST",
      body: formData,
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Erreur lors de l'ajout de la photo");
    }
    const data = await response.json();
    console.log("Photo ajoutée avec succès", data);
    displayModalWorks();
    form.reset();
    previewImg.style.display = "none";
    labelFile.style.display = "block";
    iconFile.style.display = "block";
    pFile.style.display = "block";
    gallery.innerHTML = "";
    displayWorks();
    resetButton();
    closeModal();
  } catch (error) {
    console.error(error);
  }
});
/* Fonction pour fermer la modal */
function closeModal() {
  containerModal.style.display = "none";
  modal.style.display = "none";
  modalADDphoto.style.display = "none";
}
/* Fonction pour réinitialiser le bouton */
function resetButton() {
  buttonValidForm.classList.remove("buttonGreen");
  buttonValidForm.classList.add("buttonNoValid");
  buttonValidForm.disabled = true;
}

/* Verifie que les champs sont bien remplis pour ajouter une photo */
function verifFormCompleted() {
  form.addEventListener("input", () => {
    if (titleInput.value !== "" && categorySelect.value !== "" && inputFile.value !== ""){
      buttonValidForm.classList.remove("buttonNoValid")
      buttonValidForm.classList.add("buttonGreen");
      buttonValidForm.disabled = false;
      return;
    } else {
      buttonValidForm.classList.remove("buttonGreen");
      buttonValidForm.classList.add("buttonNoValid");
      buttonValidForm.disabled = true;
    }
  })
  
}
verifFormCompleted();