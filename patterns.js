// patterns.js
const modalAdd = document.getElementById("addPatternModal");

// Helper: нормализовать теги (разделитель запятая + пробел)
function parseTags(input) {
    if (!input) return [];
    return input
        .split(',')
        .map(t => t.trim().toLowerCase())
        .filter(t => t.length > 0)
        .slice(0, 10); // лимит ради безопасности (опционально)
}

function clearCards() {
    cardsWrap.innerHTML = '';
}

async function loadAllAndRender() {
    try {
        const patterns = await getAllPatterns();
        clearCards();
        patterns.forEach(renderPatternCard);
    } catch (err) {
        console.error("Ошибка загрузки выкроек:", err);
    }
}

// при загрузке страницы подгружаем всё
window.addEventListener("DOMContentLoaded", async () => {
    await loadAllAndRender();
});

// Обработка отправки формы (добавление)
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const image = document.getElementById("patternImage").value.trim();
    const name = document.getElementById("patternName").value.trim();
    const link = document.getElementById("patternLink").value.trim();
    const tagsRaw = document.getElementById("patternTags").value;

    if (!name || !link) {
        // простая валидация
        alert("Заполните название и ссылку на выкройку.");
        return;
    }

    const tags = parseTags(tagsRaw);

    const pattern = { image, name, link, tags };

    try {
        // Сохраняем в БД и получаем id
        const id = await addPattern(pattern);
        pattern.id = id;
        // Отрисовываем новую карточку
        renderPatternCard(pattern);
        // Закрываем модалку и сбрасываем форму
        modalAdd.classList.remove("active");
        form.reset();
    } catch (err) {
        console.error("Ошибка при добавлении выкройки:", err);
        alert("Не удалось добавить выкройку. Открой консоль для деталей.");
    }
});

// Создание карточки
function renderPatternCard(pattern) {
    const card = document.createElement("div");
    card.classList.add("card-pattern");

    if (pattern.image) {
        card.style.backgroundImage = `url('${pattern.image}')`;
    } else {
        card.style.background = "linear-gradient(135deg, #e0e0e0 0%, #cfcfcf 100%)";
    }

    // set data-id for later deletion
    if (pattern.id !== undefined && pattern.id !== null) {
        card.dataset.id = pattern.id;
    }

    // Title
    const title = document.createElement("h3");
    title.classList.add("card-pattern-title");
    title.textContent = pattern.name || "Без названия";

    // link
    const a = document.createElement("a");
    a.classList.add("card-pattern-link");
    a.href = pattern.link || "#";
    a.textContent = "Ссылка на выкройку";
    a.target = "_blank";
    a.rel = "noopener noreferrer";

    // tags
    const tagList = document.createElement("div");
    tagList.classList.add("tag-list");
    const tagsArr = Array.isArray(pattern.tags) ? pattern.tags : (pattern.tags ? String(pattern.tags).split(',').map(t => t.trim().toLowerCase()) : []);
    tagsArr.forEach(t => {
        const chip = document.createElement("span");
        chip.classList.add("tag");
        chip.textContent = t;
        tagList.appendChild(chip);
    });

    // delete button
    const del = document.createElement("button");
    del.classList.add("delete-btn");
    del.textContent = "×";

    del.addEventListener("click", async (e) => {
        e.stopPropagation();
        const id = pattern.id ?? card.dataset.id;
        if (id === undefined || id === null) {
            card.remove();
            return;
        }
        try {
            await deletePattern(Number(id));
            card.remove();
        } catch (err) {
            console.error("Ошибка при удалении:", err);
            alert("Не удалось удалить выкройку. Открой консоль.");
        }
    });

    // click on card opens pattern link (if exists)
    card.addEventListener("click", (e) => {
        // если клик по кнопке удаления — игнорируем (handled above)
        if (e.target === del) return;
        if (pattern.link) window.open(pattern.link, "_blank", "noopener");
    });

    // assemble
    card.appendChild(del);
    card.appendChild(title);
    card.appendChild(tagList);
    card.appendChild(a);
    cardsWrap.appendChild(card);
}

// Показывает/скрывает кнопку "Показать всё"
function setShowAllVisible(visible) {
    if (!btnShowAll) return;
    btnShowAll.style.display = visible ? "inline-block" : "none";
}

btnShowAll.addEventListener("click", async () => {
    await loadAllAndRender();
    setShowAllVisible(false);
});
