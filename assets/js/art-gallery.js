/**
 * Art gallery — multiple pieces per event/collection.
 * Add artworks inside each collection's `pieces` array (same event, many cards).
 */
(function () {
  "use strict";

  var ART_COLLECTIONS = [
    {
      id: "enkutatash",
      label: "Ethiopian New Year",
      pieces: [
        {
          id: "enkutatash-couples",
          title: "New Year Couples",
          image: "assets/img/portfolio/New yr Couples.jpg",
          description:
            "Hand-drawn ink piece for Enkutatash — a couple at a café table with Adey Abeba flowers, warm yellow accents, and playful little details (including a curious cat).",
        },
        {
          id: "enkutatash-adey-abeba",
          title: "Melkam Addis Amet",
          image: "assets/img/portfolio/New year with Adey Abeba.jpg",
          description:
            "A girl in traditional dress among Adey Abeba flowers, with a speech bubble wishing Melkam Addis Amet — soft yellow blooms and celebratory Enkutatash mood.",
        },
        {
          id: "enkutatash-ego-feast",
          title: "Mesob & Shared Meal",
          image: "assets/img/portfolio/New year with Ego.jpg",
          description:
            "Communal dining around a mesob — hands breaking injera together, patterned shawl, and Amharic dialogue. A New Year piece about food, family, and tradition.",
        },
        {
          id: "enkutatash-evil-margaret",
          title: "Evil Margaret — Flower Comic",
          image: "assets/img/portfolio/New year with Evil Margaret.jpg",
          description:
            "Four-panel comic: Margaret gathers Adey Abeba with shears and big personality — humor, yellow flower accents, and Enkutatash spirit in sequential art.",
        },
      ],
    },
    {
      id: "halloween",
      label: "Halloween",
      pieces: [
        {
          id: "halloween-horror-family",
          title: "Horror Family",
          image: "assets/img/portfolio/Horror Family.jpg",
          description: "A Halloween-themed horror family illustration.",
        },
        {
          id: "halloween-moonlight-tamed-hyena",
          title: "Moonlight — Tamed Hyena",
          image: "assets/img/portfolio/Moonligth  Tamed heyena.jpg",
          description: "A Halloween-themed illustration of a tamed hyena in moonlight.",
        },
      ],
    },
    {
      id: "christmas",
      label: "Christmas",
      pieces: [
        {
          id: "christmas-slot",
          title: "Christmas collection",
          image: null,
          placeholder: "christmas",
          placeholderEmoji: "🎄",
          placeholderText: "Add Christmas art to the Christmas `pieces` array",
          description: "Stack multiple holiday drawings in one collection — filter by Christmas to browse only those pieces.",
        },
      ],
    },
    {
      id: "freestyle",
      label: "Freestyle",
      pieces: [
        {
          id: "freestyle-slot",
          title: "Other sketches",
          image: null,
          placeholder: "sketch",
          placeholderEmoji: "✏️",
          placeholderText: "Birthdays, random doodles, any event",
          description: "Use the Freestyle collection for art that is not tied to one holiday.",
        },
      ],
    },
  ];

  function flattenCollections(collections) {
    var list = [];
    collections.forEach(function (col) {
      col.pieces.forEach(function (piece) {
        list.push({
          id: piece.id,
          title: piece.title,
          image: piece.image || null,
          placeholder: piece.placeholder || null,
          placeholderEmoji: piece.placeholderEmoji,
          placeholderText: piece.placeholderText,
          description: piece.description || "",
          event: col.id,
          eventLabel: col.label,
        });
      });
    });
    return list;
  }

  var ARTWORKS = flattenCollections(ART_COLLECTIONS);

  var scene = document.getElementById("artCarouselScene");
  var ring = document.getElementById("artCarouselRing");
  var detailTitle = document.getElementById("artDetailTitle");
  var detailText = document.getElementById("artDetailText");
  var detailEvent = document.getElementById("artDetailEvent");
  var collectionMeta = document.getElementById("artCollectionMeta");
  var btnPrev = document.getElementById("artCarouselPrev");
  var btnNext = document.getElementById("artCarouselNext");
  var btnView = document.getElementById("artViewFull");
  var dotsRoot = document.getElementById("artProgressDots");
  var filterBar = document.getElementById("artFilterBar");

  if (!scene || !ring) return;

  var currentFilter = "all";
  var filtered = ARTWORKS.slice();
  var activeIndex = 0;
  var cardEls = [];
  var dragStartX = 0;
  var dragDelta = 0;
  var isDragging = false;
  var wheelLock = false;

  function countForEvent(eventId) {
    return ARTWORKS.filter(function (a) {
      return a.event === eventId;
    }).length;
  }

  function buildFilterBar() {
    if (!filterBar) return;
    filterBar.innerHTML = "";

    var allBtn = document.createElement("button");
    allBtn.type = "button";
    allBtn.className = "art-filter-btn is-active";
    allBtn.dataset.filter = "all";
    allBtn.setAttribute("role", "tab");
    allBtn.innerHTML = 'All <span class="art-filter-count">' + ARTWORKS.length + "</span>";
    filterBar.appendChild(allBtn);

    ART_COLLECTIONS.forEach(function (col) {
      var n = countForEvent(col.id);
      if (n === 0) return;
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "art-filter-btn";
      btn.dataset.filter = col.id;
      btn.setAttribute("role", "tab");
      btn.innerHTML =
        col.label + ' <span class="art-filter-count">' + n + "</span>";
      filterBar.appendChild(btn);
    });
  }

  function applyFilter(eventKey) {
    currentFilter = eventKey;
    if (eventKey === "all") {
      filtered = ARTWORKS.slice();
    } else {
      filtered = ARTWORKS.filter(function (a) {
        return a.event === eventKey;
      });
    }
    if (!filtered.length) filtered = ARTWORKS.slice();
    activeIndex = 0;
    renderActiveCard();
    updateCarousel();
    buildDots();
    updateCollectionMeta();
  }

  function renderActiveCard() {
    ring.innerHTML = "";
    cardEls = [];
    if (!filtered.length) return;

    var art = filtered[activeIndex];
    var card = document.createElement("article");
    card.className = "art-carousel-card is-active";
    card.setAttribute("role", "group");
    card.setAttribute("aria-label", art.title);

    var inner = document.createElement("div");
    inner.className = "art-card-inner";

    var media = document.createElement("div");
    media.className = "art-card-media";

    if (art.image) {
      var img = document.createElement("img");
      img.src = art.image;
      img.alt = art.title + " — " + art.eventLabel;
      img.loading = "eager";
      img.decoding = "async";
      img.draggable = false;
      img.setAttribute("fetchpriority", "high");
      media.appendChild(img);
    } else {
      var ph = document.createElement("div");
      ph.className =
        "art-card-placeholder art-placeholder--" + (art.placeholder || "sketch");
      ph.innerHTML =
        '<span class="ph-emoji" aria-hidden="true">' +
        (art.placeholderEmoji || "🎨") +
        "</span><p>" +
        (art.placeholderText || "Artwork coming soon") +
        "</p>";
      media.appendChild(ph);
    }

    inner.appendChild(media);
    card.appendChild(inner);
    ring.appendChild(card);
    cardEls.push(card);

    card.addEventListener("click", function () {
      if (art.image) openLightboxForActive();
    });
  }

  function updateCarousel() {
    if (!filtered.length) return;

    var art = filtered[activeIndex];
    if (art && detailTitle) {
      detailTitle.textContent = art.title;
      detailText.textContent = art.description;
      if (detailEvent) detailEvent.textContent = art.eventLabel;
    }

    if (btnView) {
      btnView.style.display = art && art.image ? "" : "none";
    }

    dotsRoot.querySelectorAll(".art-progress-dot").forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === activeIndex);
      dot.setAttribute("aria-current", i === activeIndex ? "true" : "false");
    });

    updateCollectionMeta();
  }

  function updateCollectionMeta() {
    if (!collectionMeta) return;
    var total = filtered.length;
    var label =
      currentFilter === "all"
        ? "All collections"
        : (ART_COLLECTIONS.find(function (c) {
            return c.id === currentFilter;
          }) || {}).label || "Collection";

    collectionMeta.innerHTML =
      "<strong>" +
      label +
      "</strong> · Piece <span>" +
      (activeIndex + 1) +
      "</span> of <span>" +
      total +
      "</span>";
  }

  function buildDots() {
    dotsRoot.innerHTML = "";
    if (filtered.length <= 1) return;

    filtered.forEach(function (art, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "art-progress-dot";
      dot.setAttribute("aria-label", art.title + " — piece " + (i + 1));
      dot.addEventListener("click", function () {
        activeIndex = i;
        renderActiveCard();
        updateCarousel();
      });
      dotsRoot.appendChild(dot);
    });
  }

  function step(dir) {
    var total = filtered.length;
    activeIndex = (activeIndex + dir + total) % total;
    renderActiveCard();
    updateCarousel();
  }

  function openLightboxForActive() {
    var withImages = filtered.filter(function (a) {
      return a.image;
    });
    if (!withImages.length) return;

    var elements = withImages.map(function (a) {
      return { href: a.image, type: "image", title: a.title + " — " + a.eventLabel };
    });

    var current = filtered[activeIndex];
    var startAt = Math.max(
      0,
      withImages.findIndex(function (a) {
        return a.id === current.id;
      })
    );

    if (typeof GLightbox === "undefined") {
      window.open(current.image, "_blank");
      return;
    }

    var lb = GLightbox({ elements: elements, startAt: startAt });
    lb.open();
  }

  btnPrev.addEventListener("click", function () {
    step(-1);
  });
  btnNext.addEventListener("click", function () {
    step(1);
  });

  btnView.addEventListener("click", openLightboxForActive);

  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });

  scene.addEventListener(
    "wheel",
    function (e) {
      if (wheelLock) return;
      var useX = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      var delta = useX ? e.deltaX : e.deltaY;
      if (Math.abs(delta) < 8) return;
      e.preventDefault();
      wheelLock = true;
      step(delta > 0 ? 1 : -1);
      setTimeout(function () {
        wheelLock = false;
      }, 420);
    },
    { passive: false }
  );

  scene.addEventListener("pointerdown", function (e) {
    if (!e.target.closest(".art-carousel-card.is-active")) return;
    isDragging = true;
    dragStartX = e.clientX;
    dragDelta = 0;
    scene.setPointerCapture(e.pointerId);
    if (cardEls[0]) cardEls[0].classList.add("is-dragging");
  });

  scene.addEventListener("pointermove", function (e) {
    if (!isDragging) return;
    dragDelta = e.clientX - dragStartX;
  });

  function endDrag(e) {
    if (!isDragging) return;
    isDragging = false;
    try {
      scene.releasePointerCapture(e.pointerId);
    } catch (err) {
      /* ignore */
    }
    if (cardEls[0]) {
      cardEls[0].classList.remove("is-dragging");
    }
    if (Math.abs(dragDelta) > 60) {
      step(dragDelta < 0 ? 1 : -1);
    }
    dragDelta = 0;
  }

  scene.addEventListener("pointerup", endDrag);
  scene.addEventListener("pointercancel", endDrag);

  if (filterBar) {
    filterBar.addEventListener("click", function (e) {
      var btn = e.target.closest(".art-filter-btn");
      if (!btn) return;
      filterBar.querySelectorAll(".art-filter-btn").forEach(function (b) {
        b.classList.remove("is-active");
      });
      btn.classList.add("is-active");
      applyFilter(btn.dataset.filter);
    });
  }

  buildFilterBar();
  renderActiveCard();
  buildDots();
  updateCarousel();

  window.ArtGallery = {
    collections: ART_COLLECTIONS,
    refresh: function () {
      ARTWORKS = flattenCollections(ART_COLLECTIONS);
      buildFilterBar();
      applyFilter(currentFilter);
    },
  };
})();
