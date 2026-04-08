let works = [];

async function init() {
    try {
        const reponse = await fetch('http://localhost:5678/api/works');
        works = await reponse.json();
        displayWorks(works);
    } catch (error) {
        console.error(error);
    }
}

init();

// les projets

function displayWorks(worksToDisplay) {
    const sectionGallery = document.querySelector('.gallery');
    if (!sectionGallery) return;

    sectionGallery.innerHTML = '';

    for (let i = 0; i < worksToDisplay.length; i++) {
        const project = worksToDisplay[i];
        const workElement = document.createElement('figure');
        
        const imageElement = document.createElement('img');
        imageElement.src = project.imageUrl;
        imageElement.alt = project.title;

        const titleElement = document.createElement('figcaption');
        titleElement.innerText = project.title;
        
        workElement.appendChild(imageElement);
        workElement.appendChild(titleElement);
        sectionGallery.appendChild(workElement);
    }
}

// filtres

async function displayFilters() {
    const response = await fetch("http://localhost:5678/api/categories");
    const categories = await response.json();

    const filtersContainer = document.querySelector('.filters');
    filtersContainer.innerHTML = "";

    const btnAll = document.createElement("button");
    btnAll.textContent = "Tous";
    btnAll.classList.add("filter-btn", "btn-active");
    filtersContainer.appendChild(btnAll);

    btnAll.addEventListener("click", () => {
        displayWorks(works);
        updateActiveBtn(btnAll);
    });

    categories.forEach(category => {
        const btn = document.createElement("button");
        btn.textContent = category.name;
        btn.classList.add("filter-btn");
        filtersContainer.appendChild(btn);

        btn.addEventListener("click", () => {
            const filteredWorks = works.filter(work => work.categoryId === category.id);
            displayWorks(filteredWorks);
            updateActiveBtn(btn);
        });
    });
}

function updateActiveBtn(clickedBtn) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('btn-active');
    });
    clickedBtn.classList.add('btn-active');
}

displayFilters();

// connexion    

const form = document.querySelector('#formLogIn');

if (form){   
    form.addEventListener('submit', async function (event){
        event.preventDefault();
        
        const emailUser = document.querySelector('#email').value;
        const passwordUser = document.querySelector('#password').value;
        
        const user = {
            email: emailUser,
            password: passwordUser
        };

        const response = await fetch('http://localhost:5678/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });

        if (response.status === 200) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            window.location.href = "index.html";
        }
        else {
            alert("Erreur dans l’identifiant ou le mot de passe");
        }
    });
}


// système de compte + mode edit

const token = localStorage.getItem('token');

function checkLogin(){
    const editBar = document.querySelector('#edit-bar');
    const loginLink = document.querySelector('nav ul li a[href="./login.html"]');

    if (token !== null) {
        if (editBar) {
            editBar.classList.add('active');
            editBar.innerHTML = '<i class="fa-regular fa-pen-to-square"></i>Mode édition';
            editBar.addEventListener('click', openModal);
        }
    
        if (loginLink) {
            loginLink.innerText = "logout";
            loginLink.addEventListener('click', (event) => {
                event.preventDefault();
                localStorage.removeItem('token');
                window.location.reload();
            });
        }

        const filters = document.querySelector('.filters');
        if (filters) filters.style.display = "none";

        const portfolioTitleDiv = document.querySelector('.portfolio-title');
        if (portfolioTitleDiv) {
            const modifyBtn = document.createElement('span');
            modifyBtn.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> modifier';
            modifyBtn.classList.add('modify-link');
            portfolioTitleDiv.appendChild(modifyBtn);
            modifyBtn.addEventListener('click', openModal);
        }
    }
}

checkLogin();

// gestion modal

function openModal() {
    const modal = document.querySelector('#modal');
    if (!modal) return;
    
    const viewGallery = document.getElementById('modal-view-gallery');
    const viewAdd = document.getElementById('modal-view-add');
    const btnBack = document.querySelector('.modal-back');

    if (viewGallery) viewGallery.style.display = '';
    if (viewAdd) viewAdd.style.display = 'none';
    if (btnBack) btnBack.style.visibility = 'hidden';

    modal.style.display = 'flex';
    modal.removeAttribute('aria-hidden');

    displayModalGallery();
}

function closeModal() {
    const modal = document.querySelector('#modal');
    if (!modal) return;
    
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    
    resetAddForm();
}

const modalElement = document.querySelector('#modal');
if (modalElement) {
    const closeBtns = modalElement.querySelectorAll('.close-modal');
    closeBtns.forEach(btn => btn.addEventListener('click', closeModal));
    
    modalElement.addEventListener('click', (event) => {
        if (event.target === modalElement) closeModal();
    });
}

// gallery dans le modal

function displayModalGallery() {
    const modalGallery = document.querySelector('.modal-gallery');
    if (!modalGallery) return;

    modalGallery.innerHTML = "";
    works.forEach(project => {
        const figure = document.createElement('figure');
        const img = document.createElement('img');
        img.src = project.imageUrl;
        img.alt = project.title;

        const trashBtn = document.createElement('span');
        trashBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
        trashBtn.classList.add('trash-icon');

        trashBtn.addEventListener('click', (event) => {
            event.preventDefault();
            deleteWork(project.id)
        });
        
        figure.appendChild(img);
        figure.appendChild(trashBtn);
        modalGallery.appendChild(figure);
    });
}

// enlever work

async function deleteWork(id) {
    const response = await fetch(`http://localhost:5678/api/works/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
        works = works.filter(w => w.id !== id);
        displayWorks(works);
        displayModalGallery();
    } else {
        alert("Erreur lors de la suppression");
    }
}

// ajout works

const btnAddPhoto = document.querySelector('.btn-add-photo');
const btnBack = document.querySelector('.modal-back');
const viewGallery = document.getElementById('modal-view-gallery');
const viewAdd = document.getElementById('modal-view-add');

if (btnAddPhoto) {
    btnAddPhoto.addEventListener('click', () => {
        if (viewGallery) viewGallery.style.display = 'none';
        if (viewAdd) viewAdd.style.display = 'flex';
        if (btnBack) btnBack.style.visibility = 'visible';
        loadCategoriesForModal();
    });
}

if (btnBack) {
    btnBack.addEventListener('click', () => {
        if (viewGallery) viewGallery.style.display = '';
        if (viewAdd) viewAdd.style.display = 'none'; 
        btnBack.style.visibility = 'hidden'; 
    });
}

// preview

const fileInput = document.querySelector('#file-upload');
const previewImage = document.querySelector('#preview-image');
const uploadContainerItems = document.querySelectorAll('.upload-container i, .upload-container .btn-upload-label, .upload-container p');

if (fileInput && previewImage) {
    fileInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImage.src = e.target.result;
                previewImage.style.display = 'block';
                uploadContainerItems.forEach(item => item.style.display = 'none');
            }
            reader.readAsDataURL(file);
        }
    });
}

// requete api categories

async function loadCategoriesForModal() {
    const selectCategory = document.getElementById('work-category');
    if (!selectCategory) return; 

    try {
        const response = await fetch("http://localhost:5678/api/categories");
        const categories = await response.json();
        selectCategory.innerHTML = '<option value=""></option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            selectCategory.appendChild(option);
        });
    } catch (error) {
        console.error(error);
    }
}


// ajout d'un projet et veriffication du form 

const formAdd = document.getElementById('form-add-photo');
const btnValider = document.getElementById('btn-valider');
const titleInput = document.getElementById('work-title');
const categorySelect = document.getElementById('work-category');

function checkForm() {
    if (fileInput && fileInput.files[0] && titleInput.value.trim() !== "" && categorySelect.value !== "") {
        if (btnValider) {
            btnValider.classList.add('active');
            btnValider.disabled = false;
        }
    } else if (btnValider) {
        btnValider.classList.remove('active');
        btnValider.disabled = true;
    }
}

if (titleInput) titleInput.addEventListener('input', checkForm);
if (categorySelect) categorySelect.addEventListener('change', checkForm);
if (fileInput) fileInput.addEventListener('change', checkForm);

if (formAdd) {
    formAdd.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("image", fileInput.files[0]);
        formData.append("title", titleInput.value);
        formData.append("category", parseInt(categorySelect.value));

        try {
            const response = await fetch("http://localhost:5678/api/works", {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData
            });

            if (response.ok) {
                const newProject = await response.json();
                works.push(newProject);
                displayWorks(works);
                displayModalGallery();
                resetAddForm();
                if (viewGallery) viewGallery.style.display = '';
                if (viewAdd) viewAdd.style.display = 'none'; 
                if (btnBack) btnBack.style.visibility = 'hidden'; 
            } else {
                alert("Erreur lors de l'ajout");
            }
        } catch (error) {
            console.error(error);
        }
    });
}
 // reset le form 
function resetAddForm() {
    if (!formAdd) return;
    formAdd.reset();
    if (previewImage) {
        previewImage.src = '#';
        previewImage.style.display = 'none';
    }
    uploadContainerItems.forEach(item => item.style.display = 'block');
    if (btnValider) {
        btnValider.classList.remove('active');
        btnValider.disabled = true;
    }
}