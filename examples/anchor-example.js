import { animateElement, animateStack } from "../src/index.js";

Array.from(document.getElementById("button-list").children).forEach((elt) =>
  elt.addEventListener("click", (e) => openModal(elt))
);

document.getElementById("modal-backdrop").addEventListener("click", () => {
  closeModal();
});

let currentEl = null;

async function openModal(fromElt) {

  currentEl = fromElt;

  const elt = document.getElementById("modal-backdrop");

  elt.querySelector("img").src = fromElt.querySelector("img").src;
  elt.querySelector(".title").textContent =
    fromElt.querySelector(".title").textContent;
  elt.querySelector(".artist-name").textContent =
    fromElt.querySelector(".artist-name").textContent;

  elt.classList.remove("hidden");
  fromElt.classList.add("hidden");
  await animateElement(elt, "enter", { anchor: fromElt });
}

async function closeModal() {
  let elt = document.getElementById("modal-backdrop");
  
  if(currentEl){
    currentEl.classList.remove("hidden");
    animateElement(currentEl, "show");
  }

  await animateElement(elt, "leave");
  elt.classList.add("hidden");
}
