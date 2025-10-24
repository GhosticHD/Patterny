// modal.js
const modal = document.getElementById("addPatternModal");
const openModalBtn = document.getElementById("btnAdd");
const cancelBtn = modal ? modal.querySelector(".btn-cancel") : null;
const form = document.getElementById("addPatternForm");

if (openModalBtn) {
    openModalBtn.addEventListener("click", () => {
        modal.classList.add("active");
    });
}

if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
        modal.classList.remove("active");
    });
}

if (modal) {
    modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.classList.remove("active");
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") modal.classList.remove("active");
    });
}
