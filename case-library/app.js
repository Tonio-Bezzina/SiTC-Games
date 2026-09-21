(() => {
  "use strict";

  const LABS = {
    transfusion: { name: "Transfusion", icon: "🩸", home: "../transfusion/" },
    chemistry: { name: "Clinical Chemistry", icon: "🧪", home: "../chemistry/" },
    bacteriology: { name: "Bacteriology", icon: "🦠", home: "../bacteriology/main/" },
    haematology: { name: "Haematology", icon: "🔬", home: "../haematology/" },
    histology: { name: "Histology", icon: "🔎", home: "../histology/" },
    mycology: { name: "Mycology", icon: "🍄", home: "../mycology/" }
  };

  const elements = {
    app: document.getElementById("caseApp"),
    loading: document.getElementById("loadingState"),
    library: document.getElementById("libraryView"),
    viewer: document.getElementById("viewerView"),
    error: document.getElementById("errorState"),
    grid: document.getElementById("caseGrid"),
    empty: document.getElementById("emptyState"),
    count: document.getElementById("caseCount"),
    title: document.getElementById("pageTitle"),
    description: document.getElementById("pageDescription"),
    icon: document.getElementById("labIcon"),
    labBack: document.getElementById("labBackLink"),
    viewerTitle: document.getElementById("viewerTitle"),
    slideCounter: document.getElementById("slideCounter"),
    image: document.getElementById("caseImage"),
    stage: document.getElementById("slideStage"),
    previous: document.getElementById("previousSlide"),
    next: document.getElementById("nextSlide"),
    returnToLibrary: document.getElementById("returnToLibrary")
  };

  const parameters = new URLSearchParams(window.location.search);
  const labId = parameters.get("lab");
  const lab = LABS[labId];
  let catalogue = [];
  let selectedCase = null;
  let slideIndex = 0;
  let touchStartX = null;
  let touchStartY = null;

  function assetUrl(assetPath) {
    return new URL(`../${assetPath.split("/").map(encodeURIComponent).join("/")}`, window.location.href).href;
  }

  function caseUrl(caseId = null) {
    const url = new URL(window.location.href);
    url.search = "";
    url.searchParams.set("lab", labId);
    if (caseId) url.searchParams.set("case", caseId);
    return url;
  }

  function showOnly(target) {
    [elements.loading, elements.library, elements.viewer, elements.error].forEach((section) => {
      section.classList.toggle("hidden", section !== target);
    });
  }

  function renderLibrary({ updateHistory = false } = {}) {
    selectedCase = null;
    slideIndex = 0;
    elements.grid.replaceChildren();
    elements.count.textContent = `${catalogue.length} ${catalogue.length === 1 ? "case" : "cases"} available`;
    elements.empty.classList.toggle("hidden", catalogue.length !== 0);

    for (const caseItem of catalogue) {
      const card = document.createElement("a");
      card.className = "case-card";
      card.href = caseUrl(caseItem.id);
      card.innerHTML = `
        <img class="case-thumbnail" src="${assetUrl(caseItem.thumbnail)}" alt="Thumbnail for ${escapeHtml(caseItem.title)}">
        <div class="case-card-copy">
          <h3>${escapeHtml(caseItem.title)}</h3>
          <span class="slide-total">${caseItem.slideCount} ${caseItem.slideCount === 1 ? "slide" : "slides"}</span>
        </div>`;
      card.addEventListener("click", (event) => {
        event.preventDefault();
        openCase(caseItem, { updateHistory: true });
      });
      elements.grid.appendChild(card);
    }

    if (updateHistory) history.pushState({ labId }, "", caseUrl());
    document.title = `${lab.name} Cases | SiTC Games`;
    showOnly(elements.library);
    elements.app.focus({ preventScroll: true });
  }

  function escapeHtml(value) {
    const temporary = document.createElement("div");
    temporary.textContent = value;
    return temporary.innerHTML;
  }

  function openCase(caseItem, { updateHistory = false } = {}) {
    selectedCase = caseItem;
    slideIndex = 0;
    elements.viewerTitle.textContent = caseItem.title;
    if (updateHistory) history.pushState({ labId, caseId: caseItem.id }, "", caseUrl(caseItem.id));
    showOnly(elements.viewer);
    renderSlide();
    elements.returnToLibrary.focus({ preventScroll: true });
  }

  function renderSlide() {
    if (!selectedCase) return;
    const total = selectedCase.slides.length;
    const current = slideIndex + 1;
    elements.image.src = assetUrl(selectedCase.slides[slideIndex]);
    elements.image.alt = `${selectedCase.title}, slide ${current} of ${total}`;
    elements.slideCounter.textContent = `${current} / ${total}`;
    elements.previous.disabled = slideIndex === 0;
    elements.next.disabled = slideIndex === total - 1;
    document.title = `${selectedCase.title} (${current}/${total}) | SiTC Games`;
  }

  function changeSlide(direction) {
    if (!selectedCase) return;
    const nextIndex = Math.max(0, Math.min(selectedCase.slides.length - 1, slideIndex + direction));
    if (nextIndex === slideIndex) return;
    slideIndex = nextIndex;
    renderSlide();
  }

  function readUrl() {
    const currentParameters = new URLSearchParams(window.location.search);
    const requestedCase = currentParameters.get("case");
    const match = catalogue.find((caseItem) => caseItem.id === requestedCase);
    if (match) openCase(match);
    else renderLibrary();
  }

  async function initialise() {
    if (!lab) {
      showOnly(elements.error);
      return;
    }

    elements.title.textContent = `${lab.name} Cases`;
    elements.description.textContent = "Scientist-guided cases are always available and do not affect game progress.";
    elements.icon.textContent = lab.icon;
    elements.labBack.href = lab.home;
    elements.labBack.textContent = `← ${lab.name} Laboratory`;

    try {
      const response = await fetch("catalogue.json", { cache: "no-cache" });
      if (!response.ok) throw new Error(`Catalogue request failed: ${response.status}`);
      const data = await response.json();
      catalogue = Array.isArray(data.laboratories?.[labId]) ? data.laboratories[labId] : [];
      readUrl();
    } catch (error) {
      console.error("Could not load passive case catalogue", error);
      showOnly(elements.error);
    }
  }

  elements.previous.addEventListener("click", () => changeSlide(-1));
  elements.next.addEventListener("click", () => changeSlide(1));
  elements.returnToLibrary.addEventListener("click", () => renderLibrary({ updateHistory: true }));

  elements.stage.addEventListener("touchstart", (event) => {
    const touch = event.changedTouches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  }, { passive: true });

  elements.stage.addEventListener("touchend", (event) => {
    if (touchStartX === null || touchStartY === null) return;
    const touch = event.changedTouches[0];
    const horizontal = touch.clientX - touchStartX;
    const vertical = touch.clientY - touchStartY;
    touchStartX = null;
    touchStartY = null;
    if (Math.abs(horizontal) < 45 || Math.abs(horizontal) <= Math.abs(vertical)) return;
    changeSlide(horizontal < 0 ? 1 : -1);
  }, { passive: true });

  window.addEventListener("keydown", (event) => {
    if (!selectedCase || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === "ArrowLeft") changeSlide(-1);
    if (event.key === "ArrowRight") changeSlide(1);
  });

  window.addEventListener("popstate", readUrl);
  initialise();
})();
