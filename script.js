const triggers = document.querySelectorAll("[data-open-letter]");
const letterCard = document.querySelector("[data-letter-card]");
const music = document.querySelector("[data-love-song]");
const musicToggle = document.querySelector("[data-music-toggle]");
const musicKicker = document.querySelector("[data-music-kicker]");
const musicTitle = document.querySelector("[data-music-title]");
const musicArtist = document.querySelector("[data-music-artist]");
const trackSections = document.querySelectorAll("[data-track-src]");

let activeTrackSrc = "";
let hasUnlockedPlayback = false;
let userPaused = false;

const updateMusicCopy = (section) => {
  if (!section) {
    return;
  }

  if (musicKicker) {
    musicKicker.textContent = section.dataset.trackKicker || "";
  }

  if (musicTitle) {
    musicTitle.textContent = section.dataset.trackTitle || "";
  }

  if (musicArtist) {
    musicArtist.textContent = section.dataset.trackArtist || "";
  }
};

const syncToggleLabel = () => {
  if (!music || !musicToggle) {
    return;
  }

  musicToggle.textContent = music.paused ? "Tocar música" : "Pausar música";
};

const playCurrentTrack = () => {
  if (!music) {
    return;
  }

  music.play().then(() => {
    hasUnlockedPlayback = true;
    syncToggleLabel();
  }).catch(() => {
    syncToggleLabel();
  });
};

const setTrackFromSection = (section) => {
  if (!music || !section) {
    return;
  }

  const nextTrackSrc = section.dataset.trackSrc;

  updateMusicCopy(section);

  if (!nextTrackSrc || nextTrackSrc === activeTrackSrc) {
    if (!userPaused) {
      playCurrentTrack();
    }
    return;
  }

  activeTrackSrc = nextTrackSrc;
  music.src = nextTrackSrc;
  music.load();

  if (!userPaused) {
    playCurrentTrack();
  } else {
    syncToggleLabel();
  }
};

const tryStartPlayback = () => {
  const firstSection = trackSections[0];

  if (!firstSection) {
    return;
  }

  userPaused = false;
  setTrackFromSection(firstSection);
};

window.addEventListener("load", tryStartPlayback);

["click", "touchstart"].forEach((eventName) => {
  window.addEventListener(eventName, () => {
    if (!hasUnlockedPlayback && !userPaused) {
      playCurrentTrack();
    }
  }, { once: true });
});

if (triggers.length > 0 && letterCard) {
  const openLetter = () => {
    letterCard.classList.add("is-open");

    const letterSection = letterCard.closest("[data-track-src]");

    if (letterSection) {
      userPaused = false;
      setTrackFromSection(letterSection);
    }
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", openLetter);
  });
}

if (music && musicToggle) {
  music.addEventListener("error", () => {
    musicToggle.textContent = "Arquivo da música não encontrado";
    musicToggle.disabled = true;
  });

  music.addEventListener("play", syncToggleLabel);
  music.addEventListener("pause", syncToggleLabel);

  musicToggle.addEventListener("click", () => {
    if (music.paused) {
      userPaused = false;
      playCurrentTrack();
      return;
    }

    userPaused = true;
    music.pause();
    syncToggleLabel();
  });
}

if (trackSections.length > 0) {
  const observer = new IntersectionObserver((entries) => {
    const visibleEntries = entries
      .filter((entry) => entry.isIntersecting)
      .sort((entryA, entryB) => entryB.intersectionRatio - entryA.intersectionRatio);

    const mostVisible = visibleEntries[0];

    if (mostVisible) {
      setTrackFromSection(mostVisible.target);
    }
  }, {
    threshold: [0.35, 0.55, 0.75],
    rootMargin: "-10% 0px -10% 0px",
  });

  trackSections.forEach((section) => {
    observer.observe(section);
  });
}
