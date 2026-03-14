const STORAGE_KEY = "publistar_save_v3";

const APP_META = {
  Publistar: { icon: "🎙️", level: 1, installable: false },
  "Apple Music": { icon: "🍎", level: 1, installable: false },
  Spotify: { icon: "🎧", level: 1, installable: true },
  Deezer: { icon: "💿", level: 1, installable: true },
  Calendrier: { icon: "📆", level: 1, installable: false },
  Finance: { icon: "💳", level: 2, installable: true },
  Crypto: { icon: "📈", level: 3, installable: true },
  Instagram: { icon: "📸", level: 2, installable: true },
  X: { icon: "🐦", level: 2, installable: true },
  Gestion: { icon: "🏢", level: 5, installable: true },
  Notes: { icon: "📝", level: 1, installable: true },
  Safari: { icon: "🌐", level: 1, installable: true },
  Téléphone: { icon: "📞", level: 10, installable: false },
  "App Store": { icon: "🛒", level: 1, installable: false },
};

const COMPANY_CATALOG = [
  { name: "Restaurant", price: 50000, monthly: 3500, risk: 0.06 },
  { name: "Marque vêtements", price: 20000, monthly: 1600, risk: 0.05 },
  { name: "Startup crypto", price: 100000, monthly: 7800, risk: 0.13 },
  { name: "Label musique", price: 200000, monthly: 14000, risk: 0.08 },
  { name: "Équipe de foot", price: 1000000, monthly: 50000, risk: 0.04 },
];

const CRYPTO_LIST = [
  { name: "BitCoinX", price: 28000, history: [] },
  { name: "EtherumX", price: 1800, history: [] },
  { name: "PubliCoin", price: 4.5, history: [] },
  { name: "MoonCoin", price: 0.3, history: [] },
];

const FAN_COMMENTS = [
  "🔥 incroyable",
  "banger",
  "le goat",
  "ça tourne en boucle",
  "masterclass",
  "album de l'année",
];

const HATER_COMMENTS = [
  "c'est nul",
  "trop répétitif",
  "c'est de la merde",
  "toujours la même prod",
  "zéro originalité",
];

const ALBUM_NAMES = [
  "Rivages Nocturnes",
  "Étoiles Sales",
  "Nuit Royale",
  "Dernier Étage",
  "Quartz Noir",
  "Vitrine Cassée",
  "Lune Liquide",
  "Faux Diamants",
  "Après Minuit",
  "Ville Fantôme",
];

const SONG_NAMES = [
  "Skyline", "Minuit", "Sans Frein", "Aura", "Nébuleuse", "Magma", "Roller",
  "Ligne Rouge", "Plein Sud", "Fiction", "Cassette", "Chrome", "Pulsar", "Nouveau Monde",
  "Satellite", "Money Rain", "Soleil Noir", "Tard Le Soir", "Palace", "Radar"
];

function freshState() {
  return {
    money: 100,
    fans: 0,
    level: 1,
    xp: 0,
    inspiration: 100,
    streamsTotal: 0,
    totalSongs: 0,
    currentDay: 1,
    currentMonth: 1,
    currentYear: 1,
    installedApps: {
      Publistar: true,
      "Apple Music": true,
      Spotify: false,
      Deezer: false,
      Calendrier: true,
      Finance: false,
      Crypto: false,
      Instagram: false,
      X: false,
      Gestion: false,
      Notes: true,
      Safari: true,
      Téléphone: false,
      "App Store": true,
    },
    songs: [],
    posts: [],
    notes: ["Objectif: rentrer dans le Top 100 France."],
    companies: [],
    taxesDue: 0,
    monthlyIncomeHistory: [],
    managerPaidUntilMonth: 0,
    bankCreated: false,
    bankBalance: 0,
    cryptoWallet: {},
    cryptos: JSON.parse(JSON.stringify(CRYPTO_LIST)).map((c) => ({
      ...c,
      history: Array.from({ length: 18 }, (_, i) => {
        const factor = 0.92 + Math.random() * 0.16;
        return Number((c.price * factor).toFixed(2));
      }),
    })),
    playerName: "PUBLISTAR",
    latestTop100Rank: null,
    albums: [],
    viralMultiplier: 1,
    lastAdvice: "Sors un premier morceau pour lancer ta carrière.",
    openedApp: "home",
  };
}

let state = loadState();
let activeMusicTab = "Apple Music";
let activeSocialTab = "Instagram";
let currentTrackAnimation = null;

function syncViewportHeight() {
  document.documentElement.style.setProperty("--app-height", `${window.innerHeight}px`);
}

const el = {
  screen: document.getElementById("screen"),
  topbar: document.getElementById("topbar"),
  statusDate: document.getElementById("status-date"),
  adviceText: document.getElementById("adviceText"),
  homeBtn: document.getElementById("homeBtn"),
  saveBtn: document.getElementById("saveBtn"),
  resetBtn: document.getElementById("resetBtn"),
};

init();

function init() {
  syncViewportHeight();
  window.addEventListener("resize", syncViewportHeight);
  window.addEventListener("orientationchange", syncViewportHeight);
  bindGlobalActions();
  ensureUnlocks();
  refreshUI();
  showHome();
}

function bindGlobalActions() {
  el.homeBtn.addEventListener("click", showHome);
  el.saveBtn.addEventListener("click", () => {
    saveState();
    toast("Sauvegarde effectuée.", "success");
  });
  el.resetBtn.addEventListener("click", () => {
    if (!confirm("Supprimer la sauvegarde et recommencer ?")) return;
    state = freshState();
    saveState();
    refreshUI();
    showHome();
    toast("Nouvelle partie lancée.", "success");
  });

  document.querySelectorAll(".shortcut").forEach((btn) => {
    btn.addEventListener("click", () => openApp(btn.dataset.app));
  });
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return freshState();
    const parsed = JSON.parse(raw);
    const merged = freshState();
    return deepMerge(merged, parsed);
  } catch (error) {
    console.error(error);
    return freshState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function deepMerge(target, source) {
  for (const key in source) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === "object"
    ) {
      target[key] = deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

function refreshUI() {
  ensureUnlocks();
  saveState();
  renderTopbar();
  el.statusDate.textContent = `Jour ${state.currentDay} · Mois ${state.currentMonth} · Année ${state.currentYear}`;
  el.adviceText.textContent = state.lastAdvice;
}

function renderTopbar() {
  const xpPct = Math.min(100, state.xp);
  const inspirationPct = clamp(state.inspiration, 0, 100);
  const stats = [
    ["Argent", formatMoney(state.money)],
    ["Fans", formatNumber(state.fans)],
    ["Niveau", `${state.level}`],
    ["Streams", formatNumber(state.streamsTotal)],
  ];

  el.topbar.innerHTML = `
    ${stats
      .map(
        ([label, value]) => `
      <div class="stat-card">
        <span class="stat-label">${label}</span>
        <div class="stat-value">${value}</div>
      </div>`
      )
      .join("")}
    <div class="stat-card">
      <span class="stat-label">XP</span>
      <div class="progress-wrap">
        <div class="progress-label"><span>${state.xp}/100</span><span>${xpPct}%</span></div>
        <div class="progress"><div class="progress-bar" style="width:${xpPct}%"></div></div>
      </div>
    </div>
    <div class="stat-card">
      <span class="stat-label">Inspiration</span>
      <div class="progress-wrap">
        <div class="progress-label"><span>${state.inspiration}%</span><span>${inspirationPct}%</span></div>
        <div class="progress"><div class="progress-bar" style="width:${inspirationPct}%"></div></div>
      </div>
    </div>
  `;
}

function showHome() {
  state.openedApp = "home";
  stopTrackAnimation();
  const appNames = Object.keys(APP_META);
  el.screen.innerHTML = `
    <div class="hero-banner">
      <h2>📱 Accueil</h2>
      <p class="subtitle">Ton empire musical, financier et social dans un smartphone.</p>
      <div class="stats-grid">
        <div class="panel"><div class="small">Titres sortis</div><div class="kpi">${state.totalSongs}</div></div>
        <div class="panel"><div class="small">Entreprises</div><div class="kpi">${state.companies.length}</div></div>
        <div class="panel"><div class="small">Classement</div><div class="kpi">${state.latestTop100Rank ? `#${state.latestTop100Rank}` : "--"}</div></div>
      </div>
    </div>
    <div class="home-grid">
      ${appNames.map(renderAppIcon).join("")}
    </div>
  `;

  Array.from(el.screen.querySelectorAll(".icon-app")).forEach((node) => {
    node.addEventListener("click", () => openApp(node.dataset.app));
  });

  refreshUI();
}

function renderAppIcon(appName) {
  const meta = APP_META[appName];
  const installed = !!state.installedApps[appName];
  const lockedByLevel = state.level < meta.level;
  const locked = lockedByLevel || !installed;
  return `
    <button class="icon-app" data-app="${escapeHtml(appName)}" ${locked ? "" : ""}>
      <span class="app-emoji">${meta.icon}</span>
      <span class="app-name">${escapeHtml(appName)}</span>
      ${locked ? `<span class="lock-badge">🔒</span>` : ""}
    </button>
  `;
}

function openApp(appName) {
  const meta = APP_META[appName];
  if (!meta) return;

  if (state.level < meta.level) {
    toast(`Cette app se débloque au niveau ${meta.level}.`, "danger");
    return;
  }

  if (!state.installedApps[appName]) {
    toast(`${appName} n'est pas installée. Passe par l'App Store.`, "danger");
    return;
  }

  state.openedApp = appName;
  stopTrackAnimation();

  switch (appName) {
    case "Publistar":
      renderPublistar();
      break;
    case "Apple Music":
    case "Spotify":
    case "Deezer":
      activeMusicTab = appName;
      renderMusicPlatform(appName);
      break;
    case "Calendrier":
      renderCalendar();
      break;
    case "Finance":
      renderFinance();
      break;
    case "Crypto":
      renderCrypto();
      break;
    case "Instagram":
    case "X":
      activeSocialTab = appName;
      renderSocial(appName);
      break;
    case "Gestion":
      renderCompanies();
      break;
    case "Notes":
      renderNotes();
      break;
    case "Safari":
      renderSafari();
      break;
    case "Téléphone":
      renderPhone();
      break;
    case "App Store":
      renderAppStore();
      break;
    default:
      showHome();
  }
  refreshUI();
}

function appHeader(title, subtitle = "") {
  return `
    <div class="page-header">
      <div>
        <h2>${title}</h2>
        ${subtitle ? `<p class="subtitle">${subtitle}</p>` : ""}
      </div>
      <button class="btn secondary" data-action="home">Retour</button>
    </div>
  `;
}

function wireHomeButton() {
  const btn = el.screen.querySelector('[data-action="home"]');
  if (btn) btn.addEventListener("click", showHome);
}

function renderPublistar() {
  const lastSongs = [...state.songs].reverse().slice(0, 8);
  const bestSong = state.songs.reduce((best, song) => (!best || song.streams > best.streams ? song : best), null);

  el.screen.innerHTML = `
    <div class="app-page">
      ${appHeader("🎙️ Publistar", "Crée des titres, publie des albums et développe ta carrière.")}

      <div class="dual-grid">
        <div class="form-card">
          <h3>Créer une musique</h3>
          <label class="label">Titre</label>
          <input class="input" id="songTitle" maxlength="30" placeholder="Ex: Skyline" value="${escapeHtml(randomSongName())}">

          <label class="label">Genre</label>
          <select class="select" id="songGenre">
            <option value="rap">Rap</option>
            <option value="pop">Pop</option>
            <option value="electro">Electro</option>
          </select>

          <label class="label">Qualité</label>
          <select class="select" id="songQuality">
            <option value="mauvais">Mauvais</option>
            <option value="moyen">Moyen</option>
            <option value="bon" selected>Bon</option>
          </select>

          <label class="label">Feat</label>
          <select class="select" id="songFeat">
            <option value="non">Non</option>
            <option value="oui">Oui</option>
          </select>

          <label class="label">Durée</label>
          <select class="select" id="songDuration">
            <option value="2">2 min</option>
            <option value="3" selected>3 min</option>
            <option value="4">4 min</option>
          </select>

          <div class="form-actions">
            <button class="btn green" id="releaseSongBtn">Sortir le titre</button>
            <button class="btn" id="releaseAlbumBtn">Sortir un album</button>
          </div>
          <div id="releaseResult"></div>
        </div>

        <div class="list-card">
          <h3>Stats carrière</h3>
          <div class="tag-row">
            <span class="tag">🎵 ${state.totalSongs} titres</span>
            <span class="tag">🌍 ${formatNumber(state.streamsTotal)} streams</span>
            <span class="tag">👥 ${formatNumber(state.fans)} fans</span>
            <span class="tag">💡 ${state.inspiration}% inspiration</span>
          </div>
          <div class="panel" style="margin-top:12px;">
            <div class="small">Meilleur titre</div>
            <div class="row-title">${bestSong ? escapeHtml(bestSong.title) : "Aucun"}</div>
            <div class="row-meta">${bestSong ? `${formatNumber(bestSong.streams)} streams · ${bestSong.genre}` : "Sors un premier titre."}</div>
          </div>
          <div class="panel" style="margin-top:12px;">
            <div class="small">Dernier conseil manager</div>
            <div>${escapeHtml(managerAdviceText())}</div>
          </div>
        </div>
      </div>

      <div class="list-card">
        <h3>Dernières sorties</h3>
        <div class="music-grid" id="songList">
          ${lastSongs.length ? lastSongs.map(renderSongRow).join("") : '<div class="empty">Aucune musique sortie.</div>'}
        </div>
      </div>
    </div>
  `;

  wireHomeButton();
  document.getElementById("releaseSongBtn").addEventListener("click", releaseSongFromForm);
  document.getElementById("releaseAlbumBtn").addEventListener("click", releaseAlbumFromForm);
}

function renderSongRow(song) {
  return `
    <div class="song-row">
      <div class="row-left">
        <div class="row-title">${escapeHtml(song.title)}</div>
        <div class="row-meta">${song.genre} · ${song.quality} · ${song.duration} min · feat ${song.feat}</div>
      </div>
      <div class="row-right">
        <div class="row-title">${formatNumber(song.streams)} streams</div>
        <div class="row-meta">+${formatNumber(song.fansEarned)} fans · ${formatMoney(song.moneyEarned)}</div>
      </div>
    </div>
  `;
}

function releaseSongFromForm() {
  const title = document.getElementById("songTitle").value.trim() || randomSongName();
  const genre = document.getElementById("songGenre").value;
  const quality = document.getElementById("songQuality").value;
  const feat = document.getElementById("songFeat").value;
  const duration = Number(document.getElementById("songDuration").value);

  const result = createSong({ title, genre, quality, feat, duration, isAlbumTrack: false });
  const resultBox = document.getElementById("releaseResult");
  resultBox.innerHTML = `
    <div class="notice ${result.viral ? "success" : ""}">
      <strong>${escapeHtml(result.song.title)}</strong><br>
      ${formatNumber(result.song.streams)} streams · +${formatNumber(result.song.fansEarned)} fans · ${formatMoney(result.song.moneyEarned)}
      ${result.viral ? "<br>🔥 Buzz viral !" : ""}
    </div>
  `;
  toast(`Titre sorti : ${title}`, result.viral ? "success" : "default");
  renderPublistar();
}

function releaseAlbumFromForm() {
  const baseGenre = document.getElementById("songGenre").value;
  const quality = document.getElementById("songQuality").value;
  const feat = document.getElementById("songFeat").value;
  const duration = Number(document.getElementById("songDuration").value);

  if (state.inspiration < 20) {
    toast("Inspiration trop basse pour un album propre.", "danger");
    return;
  }

  const albumTitle = randomAlbumName();
  const count = 4 + Math.floor(Math.random() * 4);
  const released = [];

  for (let i = 0; i < count; i++) {
    const song = createSong({
      title: `${randomSongName()} ${i + 1}`,
      genre: Math.random() < 0.75 ? baseGenre : randomChoice(["rap", "pop", "electro"]),
      quality,
      feat: Math.random() < 0.35 ? "oui" : feat,
      duration,
      isAlbumTrack: true,
      silent: true,
    }).song;
    released.push(song);
  }

  state.albums.push({
    title: albumTitle,
    tracks: released.map((s) => s.id),
    totalStreams: released.reduce((a, b) => a + b.streams, 0),
    releasedAt: dateString(),
  });

  addXP(24);
  state.lastAdvice = `Album ${albumTitle} lancé avec ${count} titres.`;
  saveState();
  renderPublistar();
  toast(`Nouvel album : ${albumTitle}`, "success");
}

function createSong({ title, genre, quality, feat, duration, isAlbumTrack = false, silent = false }) {
  const qualityMap = { mauvais: 800, moyen: 6500, bon: 22000 };
  let streams = qualityMap[quality] || 1200;

  const genreBoost = genre === "rap" ? 1.08 : genre === "pop" ? 1.02 : 0.97;
  const featBoost = feat === "oui" ? 1.65 : 1;
  const durationBoost = duration === 3 ? 1.08 : duration === 2 ? 0.96 : 1.03;
  const fanBoost = 1 + Math.min(state.fans / 1000000, 0.9);
  const inspirationBoost = 0.45 + state.inspiration / 100;
  const platformBoost = installedPlatformCount() * 0.04 + 1;
  const viral = Math.random() < 0.12;
  const viralBoost = viral ? 1.8 + Math.random() * 1.4 : 1;
  const albumPenalty = isAlbumTrack ? 0.74 : 1;

  streams = Math.floor(streams * genreBoost * featBoost * durationBoost * fanBoost * inspirationBoost * platformBoost * viralBoost * albumPenalty);
  streams = Math.max(streams, 120);

  const moneyEarned = Math.floor(streams * 0.0032);
  const fansEarned = Math.floor(streams / 120 + (viral ? 260 : 0));

  const song = {
    id: `song_${Date.now()}_${Math.floor(Math.random() * 99999)}`,
    title,
    genre,
    quality,
    feat,
    duration,
    streams,
    moneyEarned,
    fansEarned,
    releasedAt: dateString(),
    likes: Math.floor(streams * (0.18 + Math.random() * 0.2)),
    comments: Math.floor(streams * (0.02 + Math.random() * 0.03)),
  };

  state.songs.push(song);
  state.totalSongs += 1;
  state.streamsTotal += streams;
  state.money += moneyEarned;
  state.fans += fansEarned;
  state.taxesDue += Math.floor(moneyEarned * 0.13);
  state.inspiration = clamp(state.inspiration - (isAlbumTrack ? 6 : 12), 0, 100);
  addXP(isAlbumTrack ? 4 : 12);
  spawnSocialReaction(song, viral);
  state.lastAdvice = viral ? "Tu as lancé un buzz viral. Profite du momentum." : managerAdviceText();
  ensureUnlocks();
  saveState();

  if (!silent) refreshUI();
  return { song, viral };
}

function installedPlatformCount() {
  return ["Apple Music", "Spotify", "Deezer"].filter((app) => state.installedApps[app]).length;
}

function renderMusicPlatform(appName) {
  const songs = [...state.songs].reverse();
  const totalStreams = songs.reduce((acc, song) => acc + song.streams, 0);
  const topSong = songs[0] || null;

  el.screen.innerHTML = `
    <div class="app-page">
      ${appHeader(`${APP_META[appName].icon} ${appName}`, "Catalogue, lecture simulée et perfs de tes titres.")}
      <div class="tab-row">
        ${["Apple Music", "Spotify", "Deezer"]
          .filter((name) => state.installedApps[name])
          .map((name) => `<button class="tab-btn" data-music-tab="${name}">${APP_META[name].icon} ${name}</button>`)
          .join("")}
      </div>
      <div class="card-grid">
        <div class="panel"><div class="small">Titres disponibles</div><div class="kpi">${songs.length}</div></div>
        <div class="panel"><div class="small">Streams cumulés</div><div class="kpi">${formatNumber(totalStreams)}</div></div>
      </div>
      <div class="list-card">
        <h3>Top titre</h3>
        ${topSong ? renderTrackCard(topSong) : '<div class="empty">Aucun titre.</div>'}
      </div>
      <div class="list-card">
        <h3>Catalogue</h3>
        <div class="music-grid">
          ${songs.length ? songs.slice(0, 14).map(renderTrackCard).join("") : '<div class="empty">Sors de la musique pour remplir la plateforme.</div>'}
        </div>
      </div>
    </div>
  `;

  wireHomeButton();
  el.screen.querySelectorAll("[data-music-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeMusicTab = btn.dataset.musicTab;
      renderMusicPlatform(activeMusicTab);
    });
  });

  el.screen.querySelectorAll("[data-play-song]").forEach((btn) => {
    btn.addEventListener("click", () => simulateTrackPlayback(btn.dataset.playSong));
  });
}

function renderTrackCard(song) {
  return `
    <div class="track-card">
      <div class="song-row" style="padding:0; background:transparent; border:0;">
        <div class="row-left">
          <div class="row-title">${escapeHtml(song.title)}</div>
          <div class="row-meta">${song.genre} · ${song.quality} · ${formatNumber(song.likes)} likes</div>
        </div>
        <div class="row-right">
          <button class="btn" data-play-song="${song.id}">Lecture</button>
        </div>
      </div>
      <div class="track-player" id="player_${song.id}">
        <div class="playbar"><div class="playbar-fill"></div></div>
        <div class="small">${formatNumber(song.streams)} streams · ${song.duration} min · ${song.releasedAt}</div>
      </div>
    </div>
  `;
}

function simulateTrackPlayback(songId) {
  stopTrackAnimation();
  const player = document.getElementById(`player_${songId}`);
  if (!player) return;
  const fill = player.querySelector(".playbar-fill");
  let width = 0;
  currentTrackAnimation = setInterval(() => {
    width += 4 + Math.random() * 9;
    fill.style.width = `${Math.min(width, 100)}%`;
    if (width >= 100) stopTrackAnimation();
  }, 120);
}

function stopTrackAnimation() {
  if (currentTrackAnimation) {
    clearInterval(currentTrackAnimation);
    currentTrackAnimation = null;
  }
}

function renderCalendar() {
  el.screen.innerHTML = `
    <div class="app-page">
      ${appHeader("📆 Calendrier", "Fais avancer le temps et encaisse tes revenus passifs.")}
      <div class="stats-grid">
        <div class="panel"><div class="small">Jour</div><div class="kpi">${state.currentDay}</div></div>
        <div class="panel"><div class="small">Mois</div><div class="kpi">${state.currentMonth}</div></div>
        <div class="panel"><div class="small">Année</div><div class="kpi">${state.currentYear}</div></div>
      </div>
      <div class="form-card">
        <h3>Avancer le temps</h3>
        <div class="form-actions">
          <button class="btn" data-time="day">+1 jour</button>
          <button class="btn green" data-time="month">+1 mois</button>
          <button class="btn yellow" data-time="year">+1 an</button>
        </div>
        <div class="panel" style="margin-top:12px;">
          <div class="small">Effets</div>
          <div class="row-meta">XP gagnée, inspiration régénérée, revenus entreprises, coûts manager et évolution crypto.</div>
        </div>
      </div>
      <div class="list-card">
        <h3>Historique financier</h3>
        <div class="music-grid">
          ${state.monthlyIncomeHistory.length ? [...state.monthlyIncomeHistory].reverse().slice(0, 10).map((row) => `<div class="list-row"><div class="row-left"><div class="row-title">${row.label}</div><div class="row-meta">${row.details}</div></div><div class="row-right"><div class="row-title">${formatMoney(row.amount)}</div></div></div>`).join("") : '<div class="empty">Aucune rentrée mensuelle pour le moment.</div>'}
        </div>
      </div>
    </div>
  `;

  wireHomeButton();
  el.screen.querySelectorAll("[data-time]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const type = btn.dataset.time;
      if (type === "day") advanceDay();
      if (type === "month") advanceMonth();
      if (type === "year") advanceYear();
      renderCalendar();
    });
  });
}

function advanceDay() {
  state.currentDay += 1;
  if (state.currentDay > 30) {
    state.currentDay = 1;
    advanceMonth();
  } else {
    addXP(2);
    evolveCryptos(1);
    decayInspiration();
    randomPassiveStreams();
  }
  state.lastAdvice = "Le temps travaille pour toi. Ne laisse pas l'inspiration tomber trop bas.";
  refreshUI();
}

function advanceMonth() {
  state.currentMonth += 1;
  if (state.currentMonth > 12) {
    state.currentMonth = 1;
    state.currentYear += 1;
  }

  const companyIncome = payCompanies();
  const managerCost = processManagerMonthlyCost();
  const bankInterest = processBankInterest();
  state.inspiration = clamp(state.inspiration + 10, 0, 100);
  addXP(18);
  evolveCryptos(5);
  randomPassiveStreams(true);
  state.viralMultiplier = 1;

  const summary = companyIncome - managerCost + bankInterest;
  state.monthlyIncomeHistory.push({
    label: `Mois ${state.currentMonth} / Année ${state.currentYear}`,
    amount: summary,
    details: `Sociétés ${formatMoney(companyIncome)} · Manager -${formatMoney(managerCost)} · Banque ${formatMoney(bankInterest)}`,
  });
  state.lastAdvice = companyIncome > 0 ? "Tes sociétés travaillent pour toi." : "Construis des revenus passifs avec tes sociétés.";
  refreshUI();
}

function advanceYear() {
  for (let i = 0; i < 12; i++) advanceMonth();
  addXP(40);
  state.inspiration = clamp(state.inspiration + 15, 0, 100);
  state.lastAdvice = "Une année de plus. Pense à diversifier tes revenus.";
  refreshUI();
}

function decayInspiration() {
  if (state.songs.length >= 3) {
    const recent = state.songs.slice(-3);
    const avg = recent.reduce((a, b) => a + b.streams, 0) / recent.length;
    if (avg < 8000) state.inspiration = clamp(state.inspiration - 3, 0, 100);
  }
}

function randomPassiveStreams(monthly = false) {
  const sample = state.songs.slice(-6);
  if (!sample.length) return;
  let extra = 0;
  sample.forEach((song) => {
    const bump = Math.floor(song.streams * (monthly ? 0.12 : 0.01) * (0.4 + Math.random() * 0.9));
    song.streams += bump;
    extra += bump;
  });
  state.streamsTotal += extra;
  state.money += Math.floor(extra * 0.001);
}

function renderFinance() {
  const companyRevenue = state.companies.reduce((a, b) => a + b.monthly, 0);
  el.screen.innerHTML = `
    <div class="app-page">
      ${appHeader("💳 Finance", "Banque, impôts, paiements et trésorerie.")}
      <div class="finance-grid">
        <div class="form-card">
          <h3>Compte bancaire</h3>
          <div class="panel ${state.bankCreated ? "success" : ""}">
            <div class="small">Statut</div>
            <div class="row-title">${state.bankCreated ? "Compte actif" : "Aucun compte"}</div>
            <div class="row-meta">Solde banque: ${formatMoney(state.bankBalance)}</div>
          </div>
          <div class="form-actions" style="margin-top:12px;">
            <button class="btn green" id="createBankBtn">Créer un compte</button>
            <button class="btn" id="depositBankBtn">Déposer 1 000€</button>
            <button class="btn" id="withdrawBankBtn">Retirer 1 000€</button>
          </div>
        </div>

        <div class="form-card">
          <h3>Paiements</h3>
          <div class="tag-row">
            <span class="tag">Impôts dus ${formatMoney(state.taxesDue)}</span>
            <span class="tag">Manager ${managerStatus()}</span>
            <span class="tag">Sociétés ${formatMoney(companyRevenue)}/mois</span>
          </div>
          <div class="form-actions" style="margin-top:12px;">
            <button class="btn yellow" id="payTaxesBtn">Payer les impôts</button>
            <button class="btn red" id="payManagerBtn">Payer le manager</button>
          </div>
        </div>
      </div>

      <div class="list-card">
        <h3>Résumé</h3>
        <div class="music-grid">
          <div class="bank-row"><div class="row-left"><div class="row-title">Cash</div><div class="row-meta">Disponible immédiatement</div></div><div class="row-right"><div class="row-title">${formatMoney(state.money)}</div></div></div>
          <div class="bank-row"><div class="row-left"><div class="row-title">Banque</div><div class="row-meta">Rapporte 1% / mois</div></div><div class="row-right"><div class="row-title">${formatMoney(state.bankBalance)}</div></div></div>
          <div class="bank-row"><div class="row-left"><div class="row-title">Revenus entreprises</div><div class="row-meta">Potentiel mensuel</div></div><div class="row-right"><div class="row-title">${formatMoney(companyRevenue)}</div></div></div>
        </div>
      </div>
    </div>
  `;

  wireHomeButton();
  document.getElementById("createBankBtn").addEventListener("click", createBankAccount);
  document.getElementById("depositBankBtn").addEventListener("click", () => moveBankMoney(1000, "deposit"));
  document.getElementById("withdrawBankBtn").addEventListener("click", () => moveBankMoney(1000, "withdraw"));
  document.getElementById("payTaxesBtn").addEventListener("click", payTaxes);
  document.getElementById("payManagerBtn").addEventListener("click", payManager);
}

function createBankAccount() {
  if (state.bankCreated) {
    toast("Compte déjà créé.");
    return;
  }
  if (state.money < 200) {
    toast("Il faut 200€ pour ouvrir le compte.", "danger");
    return;
  }
  state.money -= 200;
  state.bankCreated = true;
  state.lastAdvice = "Une banque te permet de sécuriser ta trésorerie.";
  refreshUI();
  renderFinance();
}

function moveBankMoney(amount, type) {
  if (!state.bankCreated) {
    toast("Crée un compte bancaire d'abord.", "danger");
    return;
  }
  if (type === "deposit") {
    if (state.money < amount) {
      toast("Pas assez de cash.", "danger");
      return;
    }
    state.money -= amount;
    state.bankBalance += amount;
  } else {
    if (state.bankBalance < amount) {
      toast("Pas assez en banque.", "danger");
      return;
    }
    state.bankBalance -= amount;
    state.money += amount;
  }
  refreshUI();
  renderFinance();
}

function payTaxes() {
  if (state.taxesDue <= 0) {
    toast("Aucun impôt en attente.");
    return;
  }
  if (state.money < state.taxesDue) {
    toast("Cash insuffisant pour payer les impôts.", "danger");
    return;
  }
  state.money -= state.taxesDue;
  state.taxesDue = 0;
  state.lastAdvice = "Tes comptes sont propres.";
  refreshUI();
  renderFinance();
}

function payManager() {
  if (state.level < 10) {
    toast("Le manager se débloque au niveau 10.", "danger");
    return;
  }
  const cost = 10000;
  if (state.money < cost) {
    toast("Pas assez d'argent pour payer le manager.", "danger");
    return;
  }
  state.money -= cost;
  state.managerPaidUntilMonth = state.currentMonth + 1 + (state.currentYear - 1) * 12;
  state.lastAdvice = "Manager payé pour le mois à venir.";
  refreshUI();
  renderFinance();
}

function processManagerMonthlyCost() {
  if (state.level < 10) return 0;
  const currentMonthIndex = state.currentMonth + (state.currentYear - 1) * 12;
  if (state.managerPaidUntilMonth >= currentMonthIndex) return 0;
  return 10000;
}

function managerStatus() {
  if (state.level < 10) return "verrouillé";
  const currentMonthIndex = state.currentMonth + (state.currentYear - 1) * 12;
  return state.managerPaidUntilMonth >= currentMonthIndex ? "payé" : "impayé";
}

function processBankInterest() {
  if (!state.bankCreated || state.bankBalance <= 0) return 0;
  const interest = Math.floor(state.bankBalance * 0.01);
  state.bankBalance += interest;
  return interest;
}

function renderCrypto() {
  const selected = state.cryptos[0];
  el.screen.innerHTML = `
    <div class="app-page">
      ${appHeader("📈 Crypto", "Achète, vends et suis tes prix en direct simulé.")}
      <div class="chart-card">
        <h3>Graphique ${selected.name}</h3>
        <canvas id="cryptoChart" class="chart" width="600" height="180"></canvas>
      </div>
      <div class="form-card">
        <h3>Trader</h3>
        <div class="form-actions">
          <button class="btn" id="refreshCryptoBtn">Actualiser les prix</button>
        </div>
      </div>
      <div class="list-card">
        <h3>Marché</h3>
        <div class="music-grid">
          ${state.cryptos.map(renderCryptoRow).join("")}
        </div>
      </div>
    </div>
  `;

  wireHomeButton();
  document.getElementById("refreshCryptoBtn").addEventListener("click", () => {
    evolveCryptos(2);
    renderCrypto();
    toast("Marché mis à jour.");
  });
  el.screen.querySelectorAll("[data-buy-crypto]").forEach((btn) => btn.addEventListener("click", () => tradeCrypto(btn.dataset.buyCrypto, "buy")));
  el.screen.querySelectorAll("[data-sell-crypto]").forEach((btn) => btn.addEventListener("click", () => tradeCrypto(btn.dataset.sellCrypto, "sell")));
  drawCryptoChart(selected);
}

function renderCryptoRow(coin) {
  const walletAmount = state.cryptoWallet[coin.name] || 0;
  return `
    <div class="crypto-row">
      <div class="row-left">
        <div class="row-title">${coin.name}</div>
        <div class="row-meta">Prix: ${formatMoney(coin.price)} · Portefeuille: ${walletAmount.toFixed(2)}</div>
      </div>
      <div class="row-right">
        <div class="form-actions">
          <button class="btn green" data-buy-crypto="${coin.name}">Acheter 1</button>
          <button class="btn red" data-sell-crypto="${coin.name}">Vendre 1</button>
        </div>
      </div>
    </div>
  `;
}

function evolveCryptos(multiplier = 1) {
  state.cryptos.forEach((coin) => {
    const volatility = coin.name === "MoonCoin" ? 0.32 : coin.name === "PubliCoin" ? 0.18 : 0.08;
    const drift = 1 + ((Math.random() - 0.5) * volatility * multiplier);
    coin.price = Math.max(0.05, Number((coin.price * drift).toFixed(2)));
    coin.history.push(coin.price);
    if (coin.history.length > 32) coin.history.shift();
  });
}

function tradeCrypto(name, type) {
  const coin = state.cryptos.find((c) => c.name === name);
  if (!coin) return;
  const walletAmount = state.cryptoWallet[name] || 0;

  if (type === "buy") {
    if (state.money < coin.price) {
      toast("Pas assez de cash.", "danger");
      return;
    }
    state.money -= coin.price;
    state.cryptoWallet[name] = walletAmount + 1;
  } else {
    if (walletAmount < 1) {
      toast("Tu n'en possèdes pas.", "danger");
      return;
    }
    state.money += coin.price;
    state.cryptoWallet[name] = walletAmount - 1;
  }

  state.lastAdvice = type === "buy" ? `Position ouverte sur ${name}.` : `Tu as pris tes profits sur ${name}.`;
  refreshUI();
  renderCrypto();
}

function drawCryptoChart(coin) {
  const canvas = document.getElementById("cryptoChart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);

  const data = coin.history;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const pad = 18;

  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    const y = pad + ((height - pad * 2) / 3) * i;
    ctx.beginPath();
    ctx.moveTo(pad, y);
    ctx.lineTo(width - pad, y);
    ctx.stroke();
  }

  ctx.beginPath();
  data.forEach((value, index) => {
    const x = pad + (index / (data.length - 1 || 1)) * (width - pad * 2);
    const normalized = (value - min) / ((max - min) || 1);
    const y = height - pad - normalized * (height - pad * 2);
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = "#7ab5ff";
  ctx.lineWidth = 3;
  ctx.stroke();
}

function renderSocial(appName) {
  const feed = state.posts.filter((post) => post.platform === appName || post.platform === "both").slice().reverse();
  el.screen.innerHTML = `
    <div class="app-page">
      ${appHeader(`${APP_META[appName].icon} ${appName}`, "Buzz, commentaires, portée et posts promo.")}
      <div class="tab-row">
        ${["Instagram", "X"].filter((name) => state.installedApps[name]).map((name) => `<button class="tab-btn" data-social-tab="${name}">${APP_META[name].icon} ${name}</button>`).join("")}
      </div>
      <div class="form-card">
        <h3>Poster un message</h3>
        <textarea class="textarea" id="socialText" maxlength="180" placeholder="Annonce une sortie, tease un album, réponds aux fans..."></textarea>
        <div class="form-actions">
          <button class="btn green" id="postSocialBtn">Publier</button>
        </div>
      </div>
      <div class="list-card">
        <h3>Feed</h3>
        <div class="feed">
          ${feed.length ? feed.map(renderPost).join("") : '<div class="empty">Aucun post pour le moment.</div>'}
        </div>
      </div>
    </div>
  `;

  wireHomeButton();
  document.getElementById("postSocialBtn").addEventListener("click", () => createManualPost(appName));
  el.screen.querySelectorAll("[data-social-tab]").forEach((btn) => btn.addEventListener("click", () => {
    activeSocialTab = btn.dataset.socialTab;
    renderSocial(activeSocialTab);
  }));
}

function renderPost(post) {
  return `
    <div class="social-post">
      <strong>${post.platform === "both" ? "Instagram + X" : post.platform}</strong>
      <div>${escapeHtml(post.text)}</div>
      <div class="row-meta" style="margin-top:8px;">❤️ ${formatNumber(post.likes)} · 💬 ${formatNumber(post.comments)} · ${post.date}</div>
    </div>
  `;
}

function createManualPost(platform) {
  const text = document.getElementById("socialText").value.trim();
  if (!text) {
    toast("Écris un message d'abord.", "danger");
    return;
  }
  const likes = Math.floor((state.fans * 0.02) * (0.6 + Math.random() * 1.8));
  const comments = Math.floor(likes * 0.08);
  const viral = Math.random() < 0.1;
  state.posts.push({
    platform,
    text,
    likes: viral ? likes * 5 : likes,
    comments: viral ? comments * 4 : comments,
    date: dateString(),
  });
  if (viral) {
    state.viralMultiplier = 1.5;
    state.lastAdvice = "Ton post a pris, profite du buzz viral.";
    toast("Post viral 🔥", "success");
  }
  addXP(6);
  refreshUI();
  renderSocial(platform);
}

function spawnSocialReaction(song, viral = false) {
  const fanText = `${song.title} : ${randomChoice(FAN_COMMENTS)}`;
  const haterText = `${song.title} : ${randomChoice(HATER_COMMENTS)}`;
  const platforms = [];
  if (state.installedApps.Instagram || state.installedApps["Instagram"]) platforms.push("Instagram");
  if (state.installedApps.X) platforms.push("X");
  if (!platforms.length) return;

  platforms.forEach((platform) => {
    state.posts.push({
      platform,
      text: fanText,
      likes: Math.floor(song.likes * (viral ? 1.6 : 0.8)),
      comments: Math.floor(song.comments * (viral ? 1.4 : 0.8)),
      date: dateString(),
    });
    state.posts.push({
      platform,
      text: haterText,
      likes: Math.floor(song.likes * 0.25),
      comments: Math.floor(song.comments * 0.22),
      date: dateString(),
    });
  });
}

function renderCompanies() {
  const owned = state.companies;
  el.screen.innerHTML = `
    <div class="app-page">
      ${appHeader("🏢 Gestion de société", "Achète des business et encaisse des revenus mensuels.")}
      <div class="list-card">
        <h3>Marché</h3>
        <div class="music-grid">
          ${COMPANY_CATALOG.map(renderCompanyMarketRow).join("")}
        </div>
      </div>
      <div class="list-card">
        <h3>Entreprises possédées</h3>
        <div class="music-grid">
          ${owned.length ? owned.map(renderOwnedCompany).join("") : '<div class="empty">Aucune entreprise pour le moment.</div>'}
        </div>
      </div>
    </div>
  `;
  wireHomeButton();
  el.screen.querySelectorAll("[data-buy-company]").forEach((btn) => btn.addEventListener("click", () => buyCompany(btn.dataset.buyCompany)));
}

function renderCompanyMarketRow(company) {
  return `
    <div class="company-row">
      <div class="row-left">
        <div class="row-title">${company.name}</div>
        <div class="row-meta">Prix ${formatMoney(company.price)} · Revenu ${formatMoney(company.monthly)}/mois</div>
      </div>
      <div class="row-right">
        <button class="btn green" data-buy-company="${company.name}">Acheter</button>
      </div>
    </div>
  `;
}

function renderOwnedCompany(company) {
  return `
    <div class="company-row">
      <div class="row-left">
        <div class="row-title">${company.name}</div>
        <div class="row-meta">Revenu ${formatMoney(company.monthly)} / mois · achetée le ${company.boughtAt}</div>
      </div>
      <div class="row-right">
        <div class="row-title">${company.performance}</div>
      </div>
    </div>
  `;
}

function buyCompany(name) {
  const template = COMPANY_CATALOG.find((c) => c.name === name);
  if (!template) return;
  if (state.money < template.price) {
    toast("Pas assez d'argent.", "danger");
    return;
  }
  state.money -= template.price;
  state.companies.push({
    name: template.name,
    monthly: template.monthly,
    risk: template.risk,
    performance: randomChoice(["stable", "croissance", "premium"]),
    boughtAt: dateString(),
  });
  addXP(18);
  state.lastAdvice = `${template.name} ajoutée à ton portefeuille.`;
  refreshUI();
  renderCompanies();
}

function payCompanies() {
  if (!state.companies.length) return 0;
  let income = 0;
  state.companies.forEach((company) => {
    let multiplier = 0.85 + Math.random() * 0.5;
    if (Math.random() < company.risk) multiplier *= 0.5;
    const gain = Math.floor(company.monthly * multiplier);
    company.performance = gain > company.monthly ? "croissance" : gain < company.monthly * 0.7 ? "fragile" : "stable";
    income += gain;
  });
  state.money += income;
  addXP(8);
  return income;
}

function renderNotes() {
  el.screen.innerHTML = `
    <div class="app-page">
      ${appHeader("📝 Notes", "Garde tes idées, objectifs et plans de carrière.")}
      <div class="form-card">
        <label class="label">Nouvelle note</label>
        <textarea class="textarea" id="noteInput" placeholder="Écris quelque chose..."></textarea>
        <div class="form-actions">
          <button class="btn green" id="saveNoteBtn">Sauvegarder</button>
        </div>
      </div>
      <div class="list-card">
        <h3>Mes notes</h3>
        <div class="music-grid">
          ${state.notes.length ? state.notes.map((note, i) => `<div class="note-row"><div>${escapeHtml(note)}</div><button class="btn red" data-del-note="${i}">Supprimer</button></div>`).join("") : '<div class="empty">Aucune note.</div>'}
        </div>
      </div>
    </div>
  `;
  wireHomeButton();
  document.getElementById("saveNoteBtn").addEventListener("click", saveNote);
  el.screen.querySelectorAll("[data-del-note]").forEach((btn) => btn.addEventListener("click", () => deleteNote(Number(btn.dataset.delNote))));
}

function saveNote() {
  const text = document.getElementById("noteInput").value.trim();
  if (!text) return;
  state.notes.push(text);
  refreshUI();
  renderNotes();
}

function deleteNote(index) {
  state.notes.splice(index, 1);
  refreshUI();
  renderNotes();
}

function renderSafari() {
  el.screen.innerHTML = `
    <div class="app-page">
      ${appHeader("🌐 Safari", "Recherche simulée dans ton univers musical.")}
      <div class="form-card">
        <label class="label">Recherche</label>
        <input class="input" id="safariSearch" value="PUBLISTAR top 100 france">
        <div class="form-actions"><button class="btn" id="searchSafariBtn">Rechercher</button></div>
      </div>
      <div class="list-card" id="safariResults">
        ${renderSafariResults("PUBLISTAR top 100 france")}
      </div>
    </div>
  `;
  wireHomeButton();
  document.getElementById("searchSafariBtn").addEventListener("click", () => {
    const query = document.getElementById("safariSearch").value.trim() || "PUBLISTAR";
    document.getElementById("safariResults").innerHTML = renderSafariResults(query);
  });
}

function renderSafariResults(query) {
  return `
    <h3>Résultats pour “${escapeHtml(query)}”</h3>
    <div class="music-grid">
      <div class="list-row"><div class="row-left"><div class="row-title">Classement des artistes émergents</div><div class="row-meta">Streams, buzz et crédibilité scénique</div></div></div>
      <div class="list-row"><div class="row-left"><div class="row-title">Comment rentrer dans le Top 100 France</div><div class="row-meta">Le manager estime ton placement selon tes streams</div></div></div>
      <div class="list-row"><div class="row-left"><div class="row-title">Investir ses revenus musicaux intelligemment</div><div class="row-meta">Entreprises, banque, impôts et crypto</div></div></div>
    </div>
  `;
}

function renderPhone() {
  const canUseManager = state.level >= 10 && managerStatus() === "payé";
  el.screen.innerHTML = `
    <div class="app-page">
      ${appHeader("📞 Téléphone", "Appelle ton manager pour du conseil carrière.")}
      <div class="notice ${canUseManager ? "success" : "danger"}">
        ${canUseManager ? "Manager disponible." : "Manager indisponible. Il faut être niveau 10 et le payer 10 000€/mois."}
      </div>
      <div class="form-actions">
        <button class="btn" id="askTopBtn">Place dans le Top 100 France</button>
        <button class="btn green" id="askAlbumBtn">Nouvel album ?</button>
      </div>
      <div class="list-card" id="managerAnswer">
        <div class="empty">Pose une question au manager.</div>
      </div>
    </div>
  `;
  wireHomeButton();
  document.getElementById("askTopBtn").addEventListener("click", askManagerTop);
  document.getElementById("askAlbumBtn").addEventListener("click", askManagerAlbum);
}

function askManagerTop() {
  const box = document.getElementById("managerAnswer");
  if (state.level < 10 || managerStatus() !== "payé") {
    box.innerHTML = `<div class="danger notice">Le manager n'est pas dispo.</div>`;
    return;
  }
  const threshold = 120000 + state.level * 12000;
  if (state.streamsTotal >= threshold) {
    const rank = Math.max(1, 100 - Math.floor(state.streamsTotal / 50000));
    state.latestTop100Rank = rank;
    box.innerHTML = `<div class="success notice">Tu es dans le Top 100 France : place #${rank}.</div>`;
    state.lastAdvice = `Bonne dynamique. Tu pointes à la place #${rank}.`;
  } else {
    box.innerHTML = `<div class="danger notice">T'es pas selectionner mon sang.</div>`;
    state.lastAdvice = "Besoin de plus de streams avant de viser le classement.";
  }
  refreshUI();
}

function askManagerAlbum() {
  const box = document.getElementById("managerAnswer");
  if (state.level < 10 || managerStatus() !== "payé") {
    box.innerHTML = `<div class="danger notice">Le manager n'est pas dispo.</div>`;
    return;
  }
  const msg = state.inspiration >= 60
    ? "Oui, l'inspiration est haute. C'est le moment de lancer un album."
    : state.inspiration >= 35
    ? "Attends encore un peu ou sors un single avant."
    : "Mauvaise idée. Tu vas sortir un projet fatigué.";
  box.innerHTML = `<div class="notice">${msg}</div>`;
  state.lastAdvice = msg;
  refreshUI();
}

function renderAppStore() {
  const list = Object.entries(APP_META).filter(([name, meta]) => meta.installable);
  el.screen.innerHTML = `
    <div class="app-page">
      ${appHeader("🛒 App Store", "Installe les apps utiles à ta progression.")}
      <div class="list-card">
        <h3>Catalogue</h3>
        <div class="music-grid">
          ${list.map(([name]) => renderStoreRow(name)).join("")}
        </div>
      </div>
    </div>
  `;
  wireHomeButton();
  el.screen.querySelectorAll("[data-install-app]").forEach((btn) => btn.addEventListener("click", () => installApp(btn.dataset.installApp)));
}

function renderStoreRow(name) {
  const installed = state.installedApps[name];
  const locked = state.level < APP_META[name].level;
  return `
    <div class="list-row">
      <div class="row-left">
        <div class="row-title">${APP_META[name].icon} ${name}</div>
        <div class="row-meta">Niveau requis ${APP_META[name].level}</div>
      </div>
      <div class="row-right">
        ${installed ? '<span class="tag">Installée</span>' : locked ? '<span class="tag">🔒 verrouillée</span>' : `<button class="btn green" data-install-app="${name}">Installer</button>`}
      </div>
    </div>
  `;
}

function installApp(name) {
  if (state.level < APP_META[name].level) {
    toast(`Niveau ${APP_META[name].level} requis.`, "danger");
    return;
  }
  state.installedApps[name] = true;
  state.lastAdvice = `${name} installée sur ton téléphone.`;
  refreshUI();
  renderAppStore();
}

function ensureUnlocks() {
  if (state.level >= 10) state.installedApps["Téléphone"] = true;
}

function addXP(amount) {
  state.xp += amount;
  while (state.xp >= 100) {
    state.xp -= 100;
    state.level += 1;
    toast(`Niveau ${state.level} atteint !`, "success");
  }
}

function toast(message, type = "default") {
  const node = document.createElement("div");
  node.className = `modal-toast ${type === "success" ? "success" : type === "danger" ? "danger" : ""}`;
  node.innerHTML = message;
  document.body.appendChild(node);
  setTimeout(() => node.remove(), 2400);
}

function formatMoney(value) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

function formatNumber(value) {
  return new Intl.NumberFormat("fr-FR").format(Math.floor(value));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomSongName() {
  return randomChoice(SONG_NAMES);
}

function randomAlbumName() {
  return randomChoice(ALBUM_NAMES);
}

function dateString() {
  return `J${state.currentDay}/M${state.currentMonth}/A${state.currentYear}`;
}

function managerAdviceText() {
  if (state.inspiration >= 70) return "Tu es chaud. Capitalise avec un single fort ou un album.";
  if (state.inspiration >= 35) return "Continue mais espace un peu les sorties pour rester inspiré.";
  return "Prends le temps. Ton niveau d'inspiration est trop bas.";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
