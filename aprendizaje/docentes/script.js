(function () {
    const api = "/.netlify/functions/";
    const authView = document.getElementById("auth-view");
    const appView = document.getElementById("app-view");
    const loginButton = document.getElementById("login-button");
    const logoutButton = document.getElementById("logout-button");
    const authStatus = document.getElementById("auth-status");
    const appNotice = document.getElementById("teacher-notice");
    const teacherName = document.getElementById("teacher-name");
    const teacherEmail = document.getElementById("teacher-email");
    const areaCount = document.getElementById("teacher-area-count");
    const areaSelect = document.getElementById("material-area");
    const materialForm = document.getElementById("material-form");
    const materialId = document.getElementById("material-id");
    const materialTitle = document.getElementById("material-title");
    const materialGrade = document.getElementById("material-grade");
    const materialDescription = document.getElementById("material-description");
    const materialFile = document.getElementById("material-file");
    const formStatus = document.getElementById("form-status");
    const submitButton = document.getElementById("submit-material-button");
    const cancelEditButton = document.getElementById("cancel-edit-button");
    const materialsList = document.getElementById("teacher-materials-list");
    const materialsCount = document.getElementById("materials-count");
    const adminPanel = document.getElementById("admin-panel");
    const assignmentForm = document.getElementById("assignment-form");
    const assignmentEmail = document.getElementById("assignment-email");
    const assignmentAreas = document.getElementById("assignment-areas");
    const assignmentStatus = document.getElementById("assignment-status");
    const assignmentList = document.getElementById("assignment-list");

    let currentProfile = null;
    let allAreas = [];

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>"']/g, function (character) {
            return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character];
        });
    }

    function setStatus(element, message, type) {
        if (!element) return;
        element.textContent = message || "";
        element.className = element.className.replace(/\b(error|success)\b/g, "").trim();
        if (type) element.classList.add(type);
    }

    function formatSize(bytes) {
        const value = Number(bytes) || 0;
        return value < 1024 * 1024 ? `${Math.max(1, Math.round(value / 1024))} KB` : `${(value / 1024 / 1024).toFixed(1)} MB`;
    }

    function formatDate(value) {
        try {
            return new Intl.DateTimeFormat("es-PE", { dateStyle: "medium" }).format(new Date(value));
        } catch {
            return "Sin fecha";
        }
    }

    async function request(path, options) {
        const response = await fetch(`${api}${path}`, options);
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "No se pudo completar la operación.");
        return data;
    }

    function showAuth() {
        authView.classList.remove("hidden");
        appView.classList.add("hidden");
        logoutButton.classList.add("hidden");
    }

    function renderAreaSelect(areas) {
        areaSelect.innerHTML = areas.length
            ? areas.map((area) => `<option value="${escapeHtml(area.id)}">${escapeHtml(area.name)}</option>`).join("")
            : '<option value="">No tienes áreas asignadas</option>';
        areaSelect.disabled = !areas.length;
        submitButton.disabled = !areas.length;
        areaCount.textContent = areas.length;
    }

    function renderMaterials(materials) {
        materialsCount.textContent = `${materials.length} ${materials.length === 1 ? "material" : "materiales"}`;
        if (!materials.length) {
            materialsList.innerHTML = '<div class="teacher-empty">Todavía no has publicado materiales.</div>';
            return;
        }
        materialsList.innerHTML = materials.map(function (material) {
            return `<article class="teacher-material">
                <div class="teacher-material-top">
                    <div>
                        <p class="teacher-material-area">${escapeHtml(material.areaName)}</p>
                        <h3>${escapeHtml(material.title)}</h3>
                    </div>
                    <span class="teacher-pill">Vence ${formatDate(material.expiresAt)}</span>
                </div>
                <p class="teacher-material-description">${escapeHtml(material.description || "Sin descripción")}</p>
                <p class="teacher-material-meta">${escapeHtml(material.originalName)} · ${escapeHtml(material.extension.toUpperCase())} · ${formatSize(material.sizeBytes)}</p>
                <div class="teacher-material-actions">
                    <a class="teacher-small-button" href="${escapeHtml(material.downloadUrl)}" target="_blank" rel="noopener">Ver archivo</a>
                    <button class="teacher-small-button" type="button" data-edit-id="${escapeHtml(material.id)}">Editar datos</button>
                    <button class="teacher-small-button danger" type="button" data-delete-id="${escapeHtml(material.id)}">Retirar</button>
                </div>
            </article>`;
        }).join("");
    }

    function resetForm() {
        materialForm.reset();
        materialId.value = "";
        materialFile.required = true;
        document.getElementById("file-required-mark").classList.remove("hidden");
        submitButton.textContent = "Publicar material";
        cancelEditButton.classList.add("hidden");
        renderAreaSelect(currentProfile ? currentProfile.areas : []);
    }

    function startEdit(id) {
        const material = (currentProfile.materials || []).find((item) => item.id === id);
        if (!material) return;
        materialId.value = material.id;
        areaSelect.value = material.areaId;
        materialTitle.value = material.title;
        materialGrade.value = material.grade || "";
        materialDescription.value = material.description || "";
        materialFile.value = "";
        materialFile.required = false;
        document.getElementById("file-required-mark").classList.add("hidden");
        submitButton.textContent = "Guardar cambios";
        cancelEditButton.classList.remove("hidden");
        materialTitle.focus();
        window.scrollTo({ top: materialForm.getBoundingClientRect().top + window.scrollY - 20, behavior: "smooth" });
    }

    async function removeMaterial(id) {
        const material = (currentProfile.materials || []).find((item) => item.id === id);
        if (!material || !window.confirm(`¿Retirar "${material.title}"?`)) return;
        try {
            await request(`materials?id=${encodeURIComponent(id)}`, { method: "DELETE" });
            await loadProfile();
            setStatus(formStatus, "Material retirado.", "success");
        } catch (error) {
            setStatus(formStatus, error.message, "error");
        }
    }

    function fileToBase64(file) {
        return new Promise(function (resolve, reject) {
            const reader = new FileReader();
            reader.onload = function () { resolve(String(reader.result).split(",")[1] || ""); };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    async function submitMaterial(event) {
        event.preventDefault();
        setStatus(formStatus, "Guardando material...", null);
        submitButton.disabled = true;
        try {
            const editing = Boolean(materialId.value);
            const base = {
                id: materialId.value,
                areaId: areaSelect.value,
                title: materialTitle.value,
                grade: materialGrade.value,
                description: materialDescription.value
            };
            let options;
            if (editing) {
                options = { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(base) };
            } else {
                const file = materialFile.files[0];
                if (!file) throw new Error("Selecciona un archivo.");
                if (file.size > 4 * 1024 * 1024) throw new Error("El archivo supera el límite de 4 MB.");
                options = {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({ ...base, fileName: file.name, mimeType: file.type, data: await fileToBase64(file) })
                };
            }
            await request("materials", options);
            resetForm();
            await loadProfile();
            setStatus(formStatus, editing ? "Datos actualizados." : "Material publicado correctamente.", "success");
        } catch (error) {
            setStatus(formStatus, error.message, "error");
        } finally {
            submitButton.disabled = !currentProfile || !currentProfile.areas.length;
        }
    }

    function renderAssignmentAreas(selected) {
        const values = new Set(selected || []);
        assignmentAreas.innerHTML = allAreas.map(function (area) {
            return `<label class="area-check"><input type="checkbox" value="${escapeHtml(area.id)}" ${values.has(area.id) ? "checked" : ""}> <span>${escapeHtml(area.name)}</span></label>`;
        }).join("");
    }

    function renderAssignments(assignments) {
        const records = Object.entries(assignments || {}).sort((first, second) => first[0].localeCompare(second[0], "es"));
        assignmentList.innerHTML = records.length
            ? records.map(function ([email, record]) {
                const ids = Array.isArray(record) ? record : record.areaIds || [];
                const names = ids.map((id) => (allAreas.find((area) => area.id === id) || {}).name).filter(Boolean).join(", ");
                return `<div class="assignment-record"><strong>${escapeHtml(email)}</strong><span>${escapeHtml(names || "Sin áreas")}</span></div>`;
            }).join("")
            : '<div class="teacher-empty">Todavía no hay asignaciones registradas.</div>';
    }

    async function loadAssignments() {
        const data = await request("teacher-assignments");
        allAreas = data.areas || allAreas;
        renderAssignmentAreas([]);
        renderAssignments(data.assignments || {});
    }

    async function saveAssignment(event) {
        event.preventDefault();
        const areaIds = [...assignmentAreas.querySelectorAll("input:checked")].map((input) => input.value);
        setStatus(assignmentStatus, "Guardando asignación...", null);
        try {
            const data = await request("teacher-assignments", {
                method: "PUT",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ email: assignmentEmail.value, areaIds })
            });
            renderAssignments(data.assignments || {});
            renderAssignmentAreas([]);
            assignmentForm.reset();
            setStatus(assignmentStatus, "Asignación guardada.", "success");
        } catch (error) {
            setStatus(assignmentStatus, error.message, "error");
        }
    }

    async function loadProfile() {
        try {
            currentProfile = await request("teacher-profile");
            authView.classList.add("hidden");
            appView.classList.remove("hidden");
            logoutButton.classList.remove("hidden");
            teacherName.textContent = currentProfile.user.name || "docente";
            teacherEmail.textContent = currentProfile.user.email;
            renderAreaSelect(currentProfile.areas || []);
            renderMaterials(currentProfile.materials || []);
            setStatus(appNotice, currentProfile.areas.length ? "Tus materiales se publicarán de inmediato y vencerán en dos meses." : "El administrador todavía no te ha asignado un área.", currentProfile.areas.length ? null : "error");
            if (currentProfile.user.isAdmin) {
                adminPanel.classList.remove("hidden");
                await loadAssignments();
            } else {
                adminPanel.classList.add("hidden");
            }
        } catch (error) {
            showAuth();
            setStatus(authStatus, error.message, "error");
        }
    }

    loginButton.addEventListener("click", function () {
        if (window.netlifyIdentity) window.netlifyIdentity.open("login");
        else setStatus(authStatus, "El acceso docente aún no está configurado en Netlify.", "error");
    });
    logoutButton.addEventListener("click", function () { window.netlifyIdentity.logout(); });
    materialForm.addEventListener("submit", submitMaterial);
    cancelEditButton.addEventListener("click", resetForm);
    materialsList.addEventListener("click", function (event) {
        const editButton = event.target.closest("[data-edit-id]");
        const deleteButton = event.target.closest("[data-delete-id]");
        if (editButton) startEdit(editButton.dataset.editId);
        if (deleteButton) removeMaterial(deleteButton.dataset.deleteId);
    });
    assignmentForm.addEventListener("submit", saveAssignment);

    if (!window.netlifyIdentity) {
        setStatus(authStatus, "El acceso docente aún no está configurado en Netlify.", "error");
    } else {
        window.netlifyIdentity.on("init", function (user) {
            if (user) loadProfile();
            else showAuth();
        });
        window.netlifyIdentity.on("login", function () { window.netlifyIdentity.close(); loadProfile(); });
        window.netlifyIdentity.on("logout", showAuth);
    }
}());
