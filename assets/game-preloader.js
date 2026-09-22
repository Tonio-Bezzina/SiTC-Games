(() => {
    "use strict";

    const missionLink = document.querySelector("[data-game-preload]");
    if (!missionLink) return;

    const manifestUrl = new URL(missionLink.dataset.preloadManifest, window.location.href);
    const state = { promise: null, complete: false, loaded: 0, total: 0, failed: 0 };
    let overlay;
    let progressBar;
    let progressText;
    let stageText;

    function installStyles() {
        const style = document.createElement("style");
        style.textContent = `
            .game-preload-overlay { position: fixed; inset: 0; z-index: 10000; display: grid; place-items: center; padding: 24px; background: rgba(4, 20, 38, .92); color: #153344; }
            .game-preload-overlay[hidden] { display: none; }
            .game-preload-card { width: min(520px, 92vw); padding: 28px; border-radius: 22px; background: #fff; box-shadow: 0 24px 70px rgba(0, 0, 0, .32); text-align: center; }
            .game-preload-card h2 { margin: 0 0 8px; color: #073c63; }
            .game-preload-card p { margin: 0 0 18px; }
            .game-preload-track { height: 16px; overflow: hidden; border-radius: 999px; background: #dceaf1; }
            .game-preload-bar { width: 0; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #087fc1, #21c9dc); transition: width .18s ease; }
            .game-preload-percent { display: block; margin-top: 10px; font-weight: 800; color: #073c63; }
        `;
        document.head.appendChild(style);
    }

    function buildOverlay() {
        if (overlay) return;
        overlay = document.createElement("div");
        overlay.className = "game-preload-overlay";
        overlay.hidden = true;
        overlay.setAttribute("role", "dialog");
        overlay.setAttribute("aria-modal", "true");
        overlay.setAttribute("aria-labelledby", "gamePreloadTitle");
        overlay.innerHTML = `
            <div class="game-preload-card">
                <h2 id="gamePreloadTitle">Preparing your mission</h2>
                <p data-preload-stage>Downloading the laboratory in mission order…</p>
                <div class="game-preload-track" role="progressbar" aria-label="Mission download progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
                    <div class="game-preload-bar"></div>
                </div>
                <strong class="game-preload-percent" data-preload-progress>0%</strong>
            </div>
        `;
        document.body.appendChild(overlay);
        progressBar = overlay.querySelector(".game-preload-bar");
        progressText = overlay.querySelector("[data-preload-progress]");
        stageText = overlay.querySelector("[data-preload-stage]");
    }

    function updateProgress(stageName) {
        const percent = state.total ? Math.round((state.loaded / state.total) * 100) : 0;
        if (!overlay) return;
        progressBar.style.width = `${percent}%`;
        progressText.textContent = `${percent}%`;
        stageText.textContent = stageName ? `Preparing: ${stageName}` : "Preparing your mission…";
        overlay.querySelector("[role='progressbar']").setAttribute("aria-valuenow", String(percent));
    }

    async function fetchAsset(file) {
        const assetUrl = new URL(file, manifestUrl);
        const response = await fetch(assetUrl, { cache: "force-cache" });
        if (!response.ok) throw new Error(`Could not preload ${assetUrl.pathname}`);
        await response.blob();
    }

    async function loadGroup(group, concurrency = 4) {
        let nextIndex = 0;
        const workers = Array.from({ length: Math.min(concurrency, group.files.length) }, async () => {
            while (nextIndex < group.files.length) {
                const file = group.files[nextIndex];
                nextIndex += 1;
                try {
                    await fetchAsset(file);
                } catch (error) {
                    state.failed += 1;
                    console.warn(error);
                } finally {
                    state.loaded += 1;
                    updateProgress(group.name);
                }
            }
        });
        await Promise.all(workers);
    }

    async function preloadMission() {
        const response = await fetch(manifestUrl, { cache: "no-cache" });
        if (!response.ok) throw new Error("Could not load the mission asset list.");
        const manifest = await response.json();
        const groups = Array.isArray(manifest.groups) ? manifest.groups : [];
        state.total = groups.reduce((total, group) => total + group.files.length, 0);
        updateProgress(groups[0]?.name);

        for (const group of groups) await loadGroup(group);

        state.complete = true;
        updateProgress("");
    }

    function ensurePreload() {
        if (!state.promise) {
            state.promise = preloadMission().catch((error) => {
                state.failed += 1;
                console.warn(error);
            });
        }
        return state.promise;
    }

    async function enterMission(event) {
        if (state.complete) return;
        event.preventDefault();
        buildOverlay();
        overlay.hidden = false;
        document.body.setAttribute("aria-busy", "true");
        await ensurePreload();
        stageText.textContent = state.failed ? "The mission is ready. A missing file will retry inside the game." : "Mission ready!";
        progressBar.style.width = "100%";
        progressText.textContent = "100%";
        window.setTimeout(() => window.location.assign(missionLink.href), 180);
    }

    installStyles();
    missionLink.addEventListener("click", enterMission);
    missionLink.addEventListener("pointerenter", ensurePreload, { once: true });
    missionLink.addEventListener("focus", ensurePreload, { once: true });
    missionLink.addEventListener("touchstart", ensurePreload, { once: true, passive: true });

    const beginInBackground = () => ensurePreload();
    if ("requestIdleCallback" in window) window.requestIdleCallback(beginInBackground, { timeout: 1200 });
    else window.setTimeout(beginInBackground, 350);
})();
