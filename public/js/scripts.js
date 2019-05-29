'use strict';

Object.prototype.insertAfter = function (newNode) {
    this.parentNode.insertBefore(newNode, this.nextSibling);
}

let loginForm = {
    passwordElement: null,
    pwShow: false
}

let registerForm = {
    submitButton: null,
    buttonColor: null,
    passwordElement: null,
    confirmedPasswordElement: null,
    pwShow: false,
    confPwShow: false
}
window.addEventListener("load", setForm);
window.onclick = function (e) {
    if (!e.target.matches('#dropbtn')) {
        const myDropdown = document.getElementById("dropDownMenu");
        if (myDropdown && myDropdown.classList.contains('show')) {
            myDropdown.classList.remove('show');
        }
    }
}

function setForm() {
    const metaTagsArray = document.getElementsByTagName('meta');
    for (let item of metaTagsArray) {

        // Login Page
        if (item.content === "Login") {
            loginForm.passwordElement = document.getElementById("input_pw");

            let imageEyePw = document.createElement("IMG");
            imageEyePw.style = "position: relative; top: -22px; right:-504px; text-align: right; height: 18px; width: 18px";
            imageEyePw.src = "./images/eye_cl.png";
            document.getElementById("span_pw").insertAfter(imageEyePw);

            imageEyePw.onclick = function () {
                if (loginForm.pwShow) {
                    loginForm.pwShow = false;
                    imageEyePw.src = "./images/eye_cl.png";
                    loginForm.passwordElement.type = "password";
                } else {
                    loginForm.pwShow = true;
                    imageEyePw.src = "./images/eye_op.png";
                    loginForm.passwordElement.type = "text";
                }
            }
        }

        // Register Page
        if (item.content === "Register") {
            registerForm.submitButton = document.getElementById("submit").getElementsByTagName("BUTTON")[0];
            registerForm.buttonColor = registerForm.submitButton.style.backgroundColor;
            registerForm.passwordElement = document.getElementById("input_pw");

            let imageEyePw1 = document.createElement("IMG");
            imageEyePw1.style = "position: relative; top: -22px; right:-504px; text-align: right; height: 18px; width: 18px";
            imageEyePw1.src = "./images/eye_cl.png";
            let imageEyePw2 = imageEyePw1.cloneNode(true);
            document.getElementById("span_pw").insertAfter(imageEyePw1);
            document.getElementById("span_conf_pw").insertAfter(imageEyePw2);

            imageEyePw1.onclick = function () {
                if (registerForm.pwShow) {
                    registerForm.pwShow = false;
                    imageEyePw1.src = "./images/eye_cl.png";
                    registerForm.passwordElement.type = "password";
                } else {
                    registerForm.pwShow = true;
                    imageEyePw1.src = "./images/eye_op.png";
                    registerForm.passwordElement.type = "text";
                }
            }
            imageEyePw2.onclick = function () {
                if (registerForm.confPwShow) {
                    registerForm.confPwShow = false;
                    imageEyePw2.src = "./images/eye_cl.png";
                    registerForm.confirmedPasswordElement.type = "password";
                } else {
                    registerForm.confPwShow = true;
                    imageEyePw2.src = "./images/eye_op.png";
                    registerForm.confirmedPasswordElement.type = "text";
                }
            }
            registerForm.confirmedPasswordElement = document.getElementById("input_conf_pw");
            registerForm.confirmedPasswordElement.onblur = pwComparison;
            registerForm.passwordElement.onblur = pwComparison;
        }
    }
}

// Checks if password and password confirmation are identical
const pwComparison = function () {
    if (registerForm.passwordElement.value !== "" && registerForm.confirmedPasswordElement.value !== "") {
        if (registerForm.passwordElement !== null && registerForm.confirmedPasswordElement !== null
            && (registerForm.passwordElement.value !== registerForm.confirmedPasswordElement.value)) {
            registerForm.passwordElement.style = "color: red";
            registerForm.confirmedPasswordElement.style = "color: red"
            registerForm.submitButton.disabled = true;
            registerForm.submitButton.style = "background-color: #AAA"
        } else {
            registerForm.passwordElement.style = "color: black";
            registerForm.confirmedPasswordElement.style = "color: black";
            registerForm.submitButton.disabled = false;
            registerForm.submitButton.style = "background-color: " + registerForm.buttonColor;
        }
    }
}

function subMenuOperations() {
    document.getElementById("dropDownMenu").classList.toggle("show");
}


function confirmWorkerDelete(id) {
    let response = confirm("Deseja apagar este funcionário?");
    if (response) {
        let xhr = new XMLHttpRequest();
        xhr.open("DELETE", "/workers/" + id, true);
        xhr.send();
    }
}

function confirmUserDelete(id) {
    let response = confirm("Deseja apagar este utilizador?");
    if (response) {
        let xhr = new XMLHttpRequest();
        xhr.open("DELETE", "/users/" + id, true);
        xhr.send();
    }
}

function confirmAnimalDelete(id) {
    let response = confirm("Deseja apagar esta ficha?");
    if (response) {
        let xhr = new XMLHttpRequest();
        xhr.open("DELETE", "/animals/" + id, true);
        xhr.send();
    }
}

function confirmVolunteerDelete(id) {
    let response = confirm("Deseja apagar este voluntário?");
    if (response) {       
        let xhr = new XMLHttpRequest();
        xhr.open("DELETE", "/volunteers/" + id, true);
        xhr.send();
    }
}

function confirmAdoptionDelete(id) {
    let response = confirm("Deseja apagar esta adopção?");
    if (response) {
        let xhr = new XMLHttpRequest();
        xhr.open("DELETE", "/adoptions/" + id, true);
        xhr.send();
    }
}

function updateWorker(id) {
    const data = {
        username: document.getElementById("username").value,
        email: document.getElementById("email").value,
        phone:  document.getElementById("phone").value,
        birthDate: document.getElementById("birthDate").value,
        profile: document.getElementById("updateProfile").value
    }
    let xhr = new XMLHttpRequest();
    xhr.open("PUT", "/workers/" + id, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        if ((this.readyState === 4) && (this.status === 400)) {
            if(this.responseText === "true"){
                window.location.replace("/workers");
            } else {
                alert("Não foi possível guardar as alterações.")
            }
        }
    }
    xhr.send(JSON.stringify(data));
}

function updateVolunteer(id) {
    const data = {
        username: document.getElementById("username").value,
        email: document.getElementById("email").value,
        phone:  document.getElementById("phone").value,
        birthDate: document.getElementById("birthDate").value,
        profile: document.getElementById("updateProfile").value
    }
    let xhr = new XMLHttpRequest();
    xhr.open("PUT", "/volunteers/" + id, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        if ((this.readyState === 4) && (this.status === 400)) {
            if(this.responseText === "true"){
                window.location.replace("/volunteers");
            } else {
                alert("Não foi possível guardar as alterações.")
            }
        }
    }
    xhr.send(JSON.stringify(data));
}

function updateUser(id) {
    const data = {
        username: document.getElementById("username").value,
        email: document.getElementById("email").value,
        phone:  document.getElementById("phone").value,
        birthDate: document.getElementById("birthDate").value,
        profile: document.getElementById("updateProfile").value
    }
    let xhr = new XMLHttpRequest();
    xhr.open("PUT", "/users/" + id, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        if ((this.readyState === 4) && (this.status === 400)) {
            if(this.responseText === "true"){
                window.location.replace("/users");
            } else {
                alert("Não foi possível guardar as alterações.")
            }
        }
    }
    xhr.send(JSON.stringify(data));
}


function updateAdoption(id) {
    const data = {
        adopter: document.getElementById("adopterSelect").value,
        animal: document.getElementById("animalSelect").value,
        adoptionDate: document.getElementById("adoptionDate").value
    }
    let xhr = new XMLHttpRequest();
    xhr.open("PUT", "/adoptions/" + id, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        if ((this.readyState === 4) && (this.status === 400)) {
            if(this.responseText === "true"){
                window.location.replace("/adoptions");
            } else {
                alert("Não foi possível guardar as alterações.")
            }
        }
    }
    xhr.send(JSON.stringify(data));
}

function createAdoption() {
    const data = {
        adopter: document.getElementById("adopterSelect").value,
        animal: document.getElementById("animalSelect").value,
        adoptionDate: document.getElementById("adoptionDate").value
    }
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/adoptions/add", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        if ((this.readyState === 4) && (this.status === 400)) {
            if(this.responseText === "true"){
                window.location.replace("/adoptions");
            } else {
                alert("Não foi possível registar a adopção.")
            }
        }
    }
    xhr.send(JSON.stringify(data));
}

function createMovement() {
    const data = {
        user: document.getElementById("userSelect").value,
        animal: document.getElementById("animalSelect").value,
        date: new Date((new Date()).toString().substring(0,15))
    }
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/movements/add", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        if ((this.readyState === 4) && (this.status === 400)) {
            if(this.responseText === "true"){
                window.location.replace("/movements");
            } else {
                alert("Não foi possível registar o movimento.")
            }
        }
    }
    xhr.send(JSON.stringify(data));
}