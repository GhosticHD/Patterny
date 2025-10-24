// search.js
const btnSearch = document.getElementById("btnSearch");
const searchModal = document.getElementById("searchModal");
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const searchCancel = document.getElementById("searchCancel");
const btnShowAll = document.getElementById("btnShowAll");
const cardsWrap = document.querySelector(".cards-container-wrap");

// open by button
if (btnSearch) {
    btnSearch.addEventListener("click", () => {
        if (searchModal) {
            searchModal.classList.add("active");
            setTimeout(() => searchInput && searchInput.focus(), 50);
        }
    });
}

// open by Ctrl+F (override native only while focused on page)
document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        if (searchModal) {
            searchModal.classList.add("active");
            setTimeout(() => searchInput && searchInput.focus(), 50);
        }
    }
});

// cancel search modal
if (searchCancel) {
    searchCancel.addEventListener("click", () => {
        if (searchModal) searchModal.classList.remove("active");
    });
}

if (searchModal) {
    searchModal.addEventListener("click", (e) => {
        if (e.target === searchModal) searchModal.classList.remove("active");
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") searchModal.classList.remove("active");
    });
}

// on submit -> search in IndexedDB and render matches
if (searchForm) {
    searchForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const q = searchInput.value.trim();
        if (!q) return;

        try {
            const results = await searchPatternsByTag(q);
            // очистить карточки и отрисовать результаты
            cardsWrap.innerHTML = '';
            if (results.length === 0) {
                const info = document.createElement("div");
                info.style.padding = "12px";
                info.style.color = "#333";
                info.style.background = "#fff";
                info.style.borderRadius = "8px";
                info.textContent = `Ничего не найдено по запросу "${q}"`;
                info.style.marginTop = "15px"
                cardsWrap.appendChild(info);
            } else {
                results.forEach(r => {
                    // используем renderPatternCard из patterns.js
                    // renderPatternCard ожидается в глобальной области
                    if (typeof renderPatternCard === "function") {
                        renderPatternCard(r);
                    }
                });
            }
            // показать кнопку "Показать всё"
            if (btnShowAll) btnShowAll.style.display = "inline-block";
            // закрыть модалку поиска
            if (searchModal) searchModal.classList.remove("active");
        } catch (err) {
            console.error("Ошибка поиска:", err);
            alert("Ошибка при поиске. Проверь консоль.");
        }
    });
}
