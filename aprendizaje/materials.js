(function () {
    const api = "/.netlify/functions/";
    const areaFilter = document.getElementById("materials-area-filter");
    const searchInput = document.getElementById("materials-search-input");
    const grid = document.getElementById("materials-grid");
    const status = document.getElementById("materials-status");
    if (!areaFilter || !searchInput || !grid || !status) return;

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>"']/g, function (character) {
            return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character];
        });
    }

    function formatSize(bytes) {
        const value = Number(bytes) || 0;
        return value < 1024 * 1024
            ? `${Math.max(1, Math.round(value / 1024))} KB`
            : `${(value / 1024 / 1024).toFixed(1)} MB`;
    }

    function renderMaterials(materials) {
        if (!materials.length) {
            grid.innerHTML = '<div class="materials-empty">Todavía no hay materiales publicados para este filtro.</div>';
            return;
        }
        grid.innerHTML = materials.map(function (material) {
            return `<article class="material-card">
                <p class="material-card-area">${escapeHtml(material.areaName)}</p>
                <h3>${escapeHtml(material.title)}</h3>
                <p class="material-card-description">${escapeHtml(material.description || "Material de aprendizaje")}</p>
                <p class="material-card-meta">${escapeHtml(material.grade || "Nivel secundaria")} · ${escapeHtml(material.extension.toUpperCase())} · ${formatSize(material.sizeBytes)}</p>
                <a class="material-card-link" href="${escapeHtml(material.downloadUrl)}" target="_blank" rel="noopener">Abrir material <span aria-hidden="true">&#10140;</span></a>
            </article>`;
        }).join("");
    }

    async function loadAreas() {
        const response = await fetch(`${api}areas`);
        if (!response.ok) throw new Error("No se pudieron cargar las áreas.");
        const data = await response.json();
        areaFilter.innerHTML = '<option value="">Todas las áreas</option>' + data.areas.map(function (area) {
            return `<option value="${escapeHtml(area.id)}">${escapeHtml(area.name)}</option>`;
        }).join("");
    }

    async function loadMaterials() {
        status.textContent = "Cargando materiales...";
        status.classList.remove("error");
        const params = new URLSearchParams();
        if (areaFilter.value) params.set("area", areaFilter.value);
        if (searchInput.value.trim()) params.set("q", searchInput.value.trim());
        try {
            const response = await fetch(`${api}materials?${params.toString()}`);
            if (!response.ok) throw new Error("No se pudieron cargar los materiales.");
            const data = await response.json();
            renderMaterials(data.materials || []);
            status.textContent = data.materials.length === 1 ? "1 material disponible." : `${data.materials.length} materiales disponibles.`;
        } catch (error) {
            grid.innerHTML = "";
            status.textContent = "La biblioteca estará disponible cuando se configure el servicio de materiales.";
            status.classList.add("error");
        }
    }

    let searchTimer;
    areaFilter.addEventListener("change", loadMaterials);
    searchInput.addEventListener("input", function () {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(loadMaterials, 250);
    });

    loadAreas().then(loadMaterials).catch(loadMaterials);
}());
