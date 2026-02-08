const buildWatchMenu = (title, size = "small") => {
  const summaryClass = size === "small" ? "btn ghost small" : "btn ghost";
  const links = OFFICIAL_PLATFORMS.map(
    (platform) =>
      `<a href="${platform.url(title)}" target="_blank" rel="noreferrer">${escapeHtml(
        platform.label
      )}</a>`
  ).join("");

  return `
    <details class="watch-menu">
      <summary class="${summaryClass}">شاهد الحلقات الرسمية</summary>
      <div class="watch-menu-list">${links}</div>
    </details>
  `;
};

const renderPlaylistItem = (anime, activeId) => {
  const thumb = anime.poster || (anime.trailerId ? getTrailerThumb(anime.trailerId) : "");
  const activeClass = anime.id === activeId ? "active" : "";
  const status = STATUS_LABELS[anime.status] || anime.status;

  return `
    <button class="playlist-item ${activeClass}" type="button" data-id="${anime.id}">
      <span class="playlist-thumb" style="background-image:url('${thumb}');"></span>
      <span class="playlist-info">
        <strong>${escapeHtml(anime.title)}</strong>
        <span>${status} • ⭐ ${anime.score.toFixed(1)}</span>
      </span>
    </button>
  `;
};

const updateWatchButtons = () => {
  const list = getWatchlist();
  document.querySelectorAll(".watch-toggle").forEach((button) => {
    if (button.dataset.mode === "remove") return;
    const id = button.dataset.id;
    if (!id) return;
    button.textContent = list.includes(id) ? "في قائمتي" : "أضف للقائمة";
  });
};

const renderCard = (anime, options = {}) => {
  const { delay = 0, mode = "default" } = options;
  const posterStyle = anime.poster
    ? `style="background-image:url('${anime.poster}');"`
    : `style="--g1:${anime.palette[0]};--g2:${anime.palette[1]};"`;
  const posterClass = anime.poster ? "poster has-image" : "poster";
  const chips = anime.genres
    .map((genre) => `<span class="chip">${GENRE_LABELS[genre] || genre}</span>`)
    .join("");
  const inList = getWatchlist().includes(anime.id);
  const buttonLabel =
    mode === "watchlist"
      ? "إزالة"
      : inList
      ? "في قائمتي"
      : "أضف للقائمة";
  const buttonMode = mode === "watchlist" ? "remove" : "toggle";
  const watchMenu = buildWatchMenu(anime.title);

  return `
    <article class="card reveal" style="--delay:${delay}s;">
      <div class="${posterClass}" ${posterStyle}>
        <span class="poster-title">${escapeHtml(anime.title)}</span>
      </div>
      <div class="card-body">
        <div class="card-top">
          <a class="card-title" href="detail.html?id=${anime.id}">${escapeHtml(anime.title)}</a>
          <span class="score">⭐ ${anime.score.toFixed(1)}</span>
        </div>
        <p class="card-desc">${escapeHtml(anime.tagline)}</p>
        <div class="meta">
          <span>${TYPE_LABELS[anime.type] || anime.type}</span>
          <span>${STATUS_LABELS[anime.status] || anime.status}</span>
          <span>${ERA_LABELS[anime.era] || anime.era}</span>
        </div>
        <div class="chips">${chips}</div>
        <div class="card-actions">
          <a class="btn small" href="detail.html?id=${anime.id}">التفاصيل</a>
          <a class="btn ghost small" href="player.html?id=${anime.id}">المشغل</a>
          <button class="btn ghost small watch-toggle" data-id="${anime.id}" data-mode="${buttonMode}">${buttonLabel}</button>
          ${watchMenu}
        </div>
      </div>
    </article>
  `;
};

const renderDiscover = () => {
  const grid = document.getElementById("animeGrid");
  if (!grid) return;

  const searchInput = document.getElementById("searchInput");
  const genreFilter = document.getElementById("genreFilter");
  const typeFilter = document.getElementById("typeFilter");
  const statusFilter = document.getElementById("statusFilter");
  const eraFilter = document.getElementById("eraFilter");
  const sortFilter = document.getElementById("sortFilter");
  const resultCount = document.getElementById("resultCount");
  const resetFilters = document.getElementById("resetFilters");

  const params = new URLSearchParams(window.location.search);
  if (params.get("q")) searchInput.value = params.get("q");
  if (params.get("genre")) genreFilter.value = params.get("genre");

  const applyFilters = () => {
    const q = searchInput.value.trim().toLowerCase();
    const genre = genreFilter.value;
    const type = typeFilter.value;
    const status = statusFilter.value;
    const era = eraFilter.value;
    let list = ANIME.filter((anime) => {
      const haystack = [
        anime.title,
        anime.jp,
        anime.tagline,
        anime.description,
        ...(anime.tags || []),
        ...anime.genres
      ]
        .join(" ")
        .toLowerCase();

      if (q && !haystack.includes(q)) return false;
      if (genre !== "all" && !anime.genres.includes(genre)) return false;
      if (type !== "all" && anime.type !== type) return false;
      if (status !== "all" && anime.status !== status) return false;
      if (era !== "all" && anime.era !== era) return false;
      return true;
    });

    if (sortFilter.value === "score") {
      list = list.sort((a, b) => b.score - a.score);
    } else if (sortFilter.value === "title") {
      list = list.sort((a, b) => a.title.localeCompare(b.title));
    }

    grid.innerHTML = list
      .map((anime, index) => renderCard(anime, { delay: index * 0.03 }))
      .join("");
    if (resultCount) {
      resultCount.textContent = `${list.length} نتيجة`;
    }
    updateWatchButtons();
  };

  searchInput.addEventListener("input", applyFilters);
  [genreFilter, typeFilter, statusFilter, eraFilter, sortFilter].forEach((select) =>
    select.addEventListener("change", applyFilters)
  );

  if (resetFilters) {
    resetFilters.addEventListener("click", () => {
      searchInput.value = "";
      genreFilter.value = "all";
      typeFilter.value = "all";
      statusFilter.value = "all";
      eraFilter.value = "all";
      sortFilter.value = "suggested";
      applyFilters();
    });
  }

  document.querySelectorAll(".filter-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      genreFilter.value = chip.dataset.genre || "all";
      applyFilters();
    });
  });

  applyFilters();
};

const renderWatchlist = () => {
  const grid = document.getElementById("watchlistGrid");
  if (!grid) return;
  const empty = document.getElementById("watchlistEmpty");
  const items = getWatchlist()
    .map((id) => byId.get(id))
    .filter(Boolean);

  grid.innerHTML = items
    .map((anime, index) => renderCard(anime, { delay: index * 0.03, mode: "watchlist" }))
    .join("");

  if (empty) {
    empty.classList.toggle("hidden", items.length > 0);
  }
  updateWatchButtons();
};

const renderDetail = () => {
  const container = document.getElementById("detail");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const anime = byId.get(id);

  if (!anime) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>لم نجد هذا العنوان</h3>
        <p>ارجع إلى صفحة الاكتشاف لتصفح العناوين المتاحة.</p>
        <a class="btn primary" href="anime.html">اكتشف الآن</a>
      </div>
    `;
    return;
  }

  const posterStyle = anime.poster
    ? `style="background-image:url('${anime.poster}');"`
    : `style="--g1:${anime.palette[0]};--g2:${anime.palette[1]};"`;
  const posterClass = anime.poster ? "detail-poster has-image" : "detail-poster";
  const genres = anime.genres
    .map((genre) => `<span class="chip">${GENRE_LABELS[genre] || genre}</span>`)
    .join("");
  const trailerBlock = anime.trailerId
    ? `
      <div class="video-embed">
        <iframe
          src="https://www.youtube.com/embed/${anime.trailerId}?rel=0"
          title="Trailer - ${escapeHtml(anime.title)}"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          loading="lazy"
        ></iframe>
      </div>
    `
    : `<div class="video-placeholder">لا يوجد تريلر رسمي متاح لهذا الأنمي حالياً.</div>`;
  const watchMenu = buildWatchMenu(anime.title, "default");
  const inList = getWatchlist().includes(anime.id);

  document.title = `Anime-Gold | ${anime.title}`;

  container.innerHTML = `
    <div class="detail-card">
      <div class="${posterClass}" ${posterStyle}></div>
      <div class="detail-content">
        <div class="card-top">
          <h2>${escapeHtml(anime.title)}</h2>
          <span class="score">⭐ ${anime.score.toFixed(1)}</span>
        </div>
        <p class="lead">${escapeHtml(anime.tagline)}</p>
        <p>${escapeHtml(anime.description)}</p>
        ${trailerBlock}
        <div class="detail-meta">
          <div>النوع: ${genres}</div>
          <div>النوع الفني: ${TYPE_LABELS[anime.type] || anime.type}</div>
          <div>الحالة: ${STATUS_LABELS[anime.status] || anime.status}</div>
          <div>الحقبة: ${ERA_LABELS[anime.era] || anime.era}</div>
          <div>الحلقات: ${anime.episodes}</div>
          <div>المدة: ${anime.duration}</div>
        </div>
        <div class="card-actions">
          <button class="btn primary watch-toggle" data-id="${anime.id}">${inList ? "في قائمتي" : "أضف للقائمة"}</button>
          <a class="btn ghost" href="anime.html?genre=${anime.genres[0]}">مشابه</a>
          <a class="btn ghost" href="player.html?id=${anime.id}">المشغل</a>
          ${watchMenu}
        </div>
      </div>
    </div>
  `;

  const similarGrid = document.getElementById("similarGrid");
  if (similarGrid) {
    const similar = ANIME.filter(
      (item) => item.id !== anime.id && item.genres.some((g) => anime.genres.includes(g))
    ).slice(0, 4);
    similarGrid.innerHTML = similar
      .map((item, index) => renderCard(item, { delay: index * 0.03 }))
      .join("");
  }
};

const renderPlayer = () => {
  const embed = document.getElementById("playerEmbed");
  if (!embed) return;

  const list = ANIME.filter((anime) => anime.trailerId);
  const params = new URLSearchParams(window.location.search);
  const requested = params.get("id");
  const current = byId.get(requested) || list[0] || ANIME[0];
  if (!current) return;

  const titleEl = document.getElementById("playerTitle");
  const scoreEl = document.getElementById("playerScore");
  const taglineEl = document.getElementById("playerTagline");
  const metaEl = document.getElementById("playerMeta");
  const actionsEl = document.getElementById("playerActions");
  const listEl = document.getElementById("playerList");

  const setPlayer = (anime) => {
    const trailer = anime.trailerId
      ? `
        <iframe
          src="https://www.youtube.com/embed/${anime.trailerId}?rel=0"
          title="Trailer - ${escapeHtml(anime.title)}"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          loading="lazy"
        ></iframe>
      `
      : `<div class="video-placeholder">لا يوجد تريلر رسمي متاح لهذا الأنمي حالياً.</div>`;

    embed.innerHTML = trailer;

    if (titleEl) titleEl.textContent = anime.title;
    if (scoreEl) scoreEl.textContent = `⭐ ${anime.score.toFixed(1)}`;
    if (taglineEl) taglineEl.textContent = anime.tagline;

    if (metaEl) {
      metaEl.innerHTML = `
        <span>${TYPE_LABELS[anime.type] || anime.type}</span>
        <span>${STATUS_LABELS[anime.status] || anime.status}</span>
        <span>${ERA_LABELS[anime.era] || anime.era}</span>
        <span>${anime.episodes}</span>
        <span>${anime.duration}</span>
      `;
    }

    if (actionsEl) {
      const inList = getWatchlist().includes(anime.id);
      actionsEl.innerHTML = `
        <a class="btn primary" href="detail.html?id=${anime.id}">صفحة التفاصيل</a>
        <a class="btn ghost" href="anime.html?genre=${anime.genres[0]}">اكتشف مشابه</a>
        <button class="btn ghost watch-toggle" data-id="${anime.id}">${inList ? "في قائمتي" : "أضف للقائمة"}</button>
        ${buildWatchMenu(anime.title, "default")}
      `;
      updateWatchButtons();
    }

    if (listEl) {
      listEl.querySelectorAll(".playlist-item").forEach((item) => {
        item.classList.toggle("active", item.dataset.id === anime.id);
      });
    }

    if (window.history && anime.id) {
      const url = new URL(window.location.href);
      url.searchParams.set("id", anime.id);
      window.history.replaceState({}, "", url.toString());
    }
  };

  if (listEl) {
    listEl.innerHTML = list.map((anime) => renderPlaylistItem(anime, current.id)).join("");
    listEl.addEventListener("click", (event) => {
      const item = event.target.closest(".playlist-item");
      if (!item) return;
      const anime = byId.get(item.dataset.id);
      if (anime) setPlayer(anime);
    });
  }

  setPlayer(current);
};
