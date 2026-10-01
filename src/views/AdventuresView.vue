<template>
  <div>
    <div class="adventures-view">
      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <i class="fa-duotone fa-regular fa-arrows-rotate fa-spin"></i>
        <p>Loading adventures...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-container">
        <Message severity="error" life="5000">
          <i class="fa-duotone fa-solid fa-triangle-exclamation"></i>
          Unable to load adventures. Please try again.
        </Message>
      </div>

      <div v-else class="adventures-content">
        <!-- Hero CTA Section -->
        <section class="hero-cta">
          <!-- Animated Book Covers Background -->
          <div class="hero-cta-bg" aria-hidden="true">
            <div class="hero-cta-books">
              <div v-for="(book, index) in randomBooks" :key="book.id" class="hero-cta-book" :style="book.style">
                <img :src="book.cover" :alt="book.title + ' cover'" class="hero-cta-book-img" />
              </div>
            </div>
          </div>

          <div class="hero-cta-content">
            <h1 class="hero-cta-title">
              <i class="fa-duotone fa-solid fa-magic-wand-sparkles"></i>
              ไม่แน่ใจจะเลือกอันไหน?
            </h1>
            <p class="hero-cta-subtitle">
              ตอบคำถามสั้นๆ เราจะแนะนำ 3 ผจญภัยที่ตรงกับสไตล์ของคุณ
            </p>
            <RouterLink to="/adventures/random" class="hero-cta-btn">
              <Button label="ช่วยเลือกให้หน่อย" icon="fa-duotone fa-solid fa-magic-wand-sparkles"
                class="hero-cta-btn-inner" />
            </RouterLink>
          </div>
        </section>

        <!-- Filter Bar -->
        <div class="filter-bar">
          <div class="filter-group">
            <span class="filter-label">Type</span>
            <div class="filter-pills">
              <Button v-for="t in typeOptions" :key="t" :label="t" :class="[
                'p-button-rounded p-button-sm',
                selectedType === t
                  ? 'p-button-primary'
                  : 'p-button-outlined p-button-secondary',
              ]" @click="selectedType = t === selectedType ? '' : t" />
            </div>
          </div>
          <div class="filter-group">
            <span class="filter-label">Tags</span>
            <div class="filter-pills">
              <Button v-for="t in tagOptions" :key="t" :label="t" :class="[
                'p-button-rounded p-button-sm',
                selectedTags.includes(t)
                  ? 'p-button-primary'
                  : 'p-button-outlined p-button-secondary',
              ]" @click="toggleTag(t)" />
            </div>
          </div>
          <Button v-if="selectedType || selectedTags.length" label="Clear" icon="fa-duotone fa-solid fa-xmark"
            class="p-button-text p-button-sm" @click="clearFilters" />
        </div>

        <!-- Unified List (100% width cards) -->
        <section v-if="filteredAdventures.length" class="adventure-section">
          <div class="adventure-list">
            <Card v-for="adventure in filteredAdventures" :key="adventure.id" class="adventure-card"
              @click="openHighlight(adventure.id)">
              <template #content>
                <div class="adventure-card-inner">
                  <!-- Book Cover -->
                  <div class="book-cover">
                    <img :src="coverUrls.get(adventure.adventureId) || '/adventures/Generic.webp'"
                      :alt="adventure.title + ' cover'" class="cover-image" />
                    <!-- Hidden preloader for specific cover -->
                    <img v-if="adventure.adventureId" :src="'/adventures/' + adventure.adventureId + '.webp'"
                      @load="onCoverLoad(adventure, $event)" @error="onCoverError(adventure)" style="display: none;" />
                  </div>

                  <!-- Content -->
                  <div class="adventure-content">
                    <div class="adventure-header">
                      <h4 class="adventure-name">{{ adventure.title }}</h4>
                      <div class="adventure-tags">
                        <Tag v-for="tag in adventure.displayTags" :key="tag" :value="tag" :severity="tagSeverity(tag)"
                          class="adventure-tag" />
                      </div>
                    </div>

                    <p class="adventure-description">{{ adventure.description }}</p>

                    <div class="adventure-meta">
                      <span class="meta-item">
                        <i class="fa-duotone fa-solid fa-chart-simple"></i>
                        Lv {{ adventure.startLevel }}{{ adventure.endLevel && adventure.endLevel !==
                          adventure.startLevel
                          ? "–" + adventure.endLevel : "" }}
                      </span>
                      <span v-if="adventure.settings" class="meta-item">
                        <i class="fa-duotone fa-solid fa-map-location-dot"></i>
                        {{ adventure.settings }}
                      </span>
                    </div>
                  </div>
                </div>
              </template>
            </Card>
          </div>
        </section>

        <!-- Empty State -->
        <div v-if="!filteredAdventures.length && catalog.length" class="empty-state">
          <i class="fa-duotone fa-solid fa-filter empty-icon"></i>
          <p>No adventures match the current filters.</p>
        </div>
        <div v-if="!catalog.length" class="empty-state">
          <i class="fa-duotone fa-solid fa-scroll empty-icon"></i>
          <p>No adventures found in the catalog.</p>
        </div>
      </div>
    </div>

    <!-- Highlight Modal -->
    <Teleport to="body">
      <div v-if="showHighlight" class="highlight-modal-overlay" @click.self="closeHighlight">
        <div class="highlight-modal" @click.stop>
          <div class="highlight-modal-header">
            <h3>{{ selectedAdventure ? selectedAdventure.title : '' }}</h3>
            <Button icon="fa-duotone fa-solid fa-xmark" class="p-button-text p-button-sm" @click="closeHighlight" />
          </div>
          <div v-if="selectedAdventure" class="highlight-modal-content">
            <div class="highlight-cover">
              <img :src="coverUrls.get(selectedAdventure.adventureId) || '/adventures/Generic.webp'"
                :alt="selectedAdventure.title + ' cover'" class="highlight-cover-img" />
            </div>
            <div class="highlight-tags">
              <Tag v-for="tag in selectedAdventure.displayTags" :key="tag" :value="tag" :severity="tagSeverity(tag)"
                class="highlight-tag" />
            </div>
            <p class="highlight-description">{{ selectedAdventure.description }}</p>
            <div class="highlight-meta">
              <span class="meta-item">
                <i class="fa-duotone fa-solid fa-chart-simple"></i>
                Lv {{ selectedAdventure.startLevel }}{{ selectedAdventure.endLevel && selectedAdventure.endLevel !==
                  selectedAdventure.startLevel ? "–" + selectedAdventure.endLevel : "" }}
              </span>
              <span v-if="selectedAdventure.settings" class="meta-item">
                <i class="fa-duotone fa-solid fa-map-location-dot"></i>
                {{ selectedAdventure.settings }}
              </span>
            </div>
          </div>
          <div class="highlight-modal-footer">
            <Button label="ปิด" icon="fa-duotone fa-solid fa-xmark" @click="closeHighlight" class="p-button-text" />
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, reactive, watch, onBeforeUnmount } from "vue";
import axios from "axios";

import Card from "primevue/card";
import Button from "primevue/button";
import Tag from "primevue/tag";
import Message from "primevue/message";

import { RouterLink, useRoute, useRouter } from "vue-router";

const ADVENTURES_URL =
  "https://ndb.3xbun.com/api/v3/data/p0w0egc69gysun8/mslau6b61v0pln0/records";
const API_HEADERS = {
  "xc-token": import.meta.env.VITE_NDB_API,
};

// State
const adventures = ref([]);
const loading = ref(true);
const error = ref(false);

// Reactive cover URLs: adventureId -> current cover URL
const coverUrls = reactive(new Map());

// Filter state
const selectedType = ref("");
const selectedTags = ref([]);

// Highlight modal - simple approach
const selectedAdventure = ref(null);
const showHighlight = ref(false);

// Handle highlight from URL query
const openHighlight = (id) => {
  const found = catalog.value.find((a) => a.id === parseInt(id));
  if (found) {
    selectedAdventure.value = found;
    showHighlight.value = true;
  }
};

// Watch for highlight query parameter
const route = useRoute();
watch(() => route.query.highlight, (val) => {
  if (val) {
    openHighlight(val);
  } else {
    selectedAdventure.value = null;
    showHighlight.value = false;
  }
});

// Close modal on route change (before navigation)
watch(() => route.fullPath, () => {
  if (showHighlight.value) {
    closeHighlight();
  }
});

// Close modal on component unmount
onBeforeUnmount(() => {
  if (showHighlight.value) {
    selectedAdventure.value = null;
    showHighlight.value = false;
    // Clean up any teleported elements
    const modals = document.querySelectorAll('.highlight-modal-overlay');
    modals.forEach(el => el.remove());
  }
});

// Close highlight modal
const closeHighlight = () => {
  selectedAdventure.value = null;
  showHighlight.value = false;
  router.push({ path: route.path, query: {} });
};

// Hero CTA random book covers - 10 books raining down
const randomBooks = computed(() => {
  if (catalog.value.length === 0) return [];
  // Shuffle and take up to 10
  const shuffled = [...catalog.value].sort(() => Math.random() - 0.5);
  const count = Math.min(10, shuffled.length);
  return shuffled.slice(0, count).map((book) => {
    const xPos = Math.random() * 90 + 5; // 5-95%
    const startY = -50 - Math.random() * 50; // Start above viewport
    const endY = 110 + Math.random() * 30; // End below viewport
    const duration = 8 + Math.random() * 8; // 8-16s fall duration
    const delay = Math.random() * 15; // Staggered start
    const rotation = (Math.random() - 0.5) * 30; // -15 to 15 deg
    const scale = 0.5 + Math.random() * 0.6; // 0.5-1.1
    const fallDistance = 100 + Math.random() * 50; // 100-150vh fall

    return {
      id: book.id,
      cover: book.adventureId ? `/adventures/${book.adventureId}.webp` : null,
      title: book.title,
      style: {
        left: `${Math.random() * 90 + 5}%`,
        top: `${-50 - Math.random() * 50}%`,
        '--rotation': `${(Math.random() - 0.5) * 30}deg`,
        '--scale': `${0.5 + Math.random() * 0.6}`,
        '--delay': `${Math.random() * 15}s`,
        '--duration': `${8 + Math.random() * 8}s`,
        '--fall-distance': `${100 + Math.random() * 100}vh`,
        '--opacity': '0.1',
      }
    };
  });
});

const router = useRouter();

// Unique type options from catalog
const typeOptions = computed(() => {
  const types = new Set();
  for (const a of catalog.value) {
    if (a.type) types.add(a.type);
  }
  return Array.from(types).sort();
});

// Unique tag options from catalog (excluding type tags)
const tagOptions = computed(() => {
  const tags = new Set();
  for (const a of catalog.value) {
    for (const tag of a.tags) tags.add(tag);
  }
  return Array.from(tags).sort();
});

// Filtered adventures
const filteredAdventures = computed(() => {
  let list = catalog.value;
  if (selectedType.value) {
    list = list.filter((a) => a.type === selectedType.value);
  }
  if (selectedTags.value.length) {
    list = list.filter((a) =>
      selectedTags.value.every((t) => a.tags.includes(t)),
    );
  }
  // Sort alphabetically by title
  list.sort((a, b) => a.title.localeCompare(b.title));
  return list;
});

const toggleTag = (tag) => {
  const idx = selectedTags.value.indexOf(tag);
  if (idx >= 0) selectedTags.value.splice(idx, 1);
  else selectedTags.value.push(tag);
};

const clearFilters = () => {
  selectedType.value = "";
  selectedTags.value = [];
  levelMin.value = null;
  levelMax.value = null;
};

// Fetching Data (catalog only)
onMounted(async () => {
  try {
    const res = await axios.get(ADVENTURES_URL, { headers: API_HEADERS });
    adventures.value = res.data.records || [];
  } catch (err) {
    console.error(err);
    error.value = true;
  } finally {
    loading.value = false;
  }
});

// Cover load handler - when specific cover loads successfully, use it
const onCoverLoad = (adventure, event) => {
  const img = event.target;
  if (img.naturalWidth > 0 && img.naturalHeight > 0) {
    // Valid specific cover - switch to it
    coverUrls.set(adventure.adventureId, `/adventures/${adventure.adventureId}.webp`);
  }
};

// Cover error handler - specific cover failed, keep Generic.webp
const onCoverError = (adventure) => {
  // Specific cover failed - keep showing Generic.webp (already the default)
  // No action needed
};

// Parse catalog records into unified format
const catalog = computed(() => {
  return adventures.value.map((record) => {
    const f = record.fields || {};
    const type = (f.Types || "").trim();
    const isOneShot = /one\s*shot/i.test(type);
    const adventureId = (f.AdventureID || "").trim();
    const title = (f.Title || "").replace(/\r?\n+$/, "").trim();
    return {
      id: record.id,
      adventureId,
      title,
      description: (f.Description || "").replace(/\r?\n+$/, "").trim(),
      startLevel: f.StartLevel || "",
      endLevel: f.EndLevel || "",
      tags: Array.isArray(f.Tags) ? f.Tags : [],
      settings: f.Settings || "",
      type,
      isOneShot,
      // Unified display properties
      icon: isOneShot ? "fa-solid fa-dice" : "fa-solid fa-dragon",
      // Use original type from DB
      displayTags: [...(Array.isArray(f.Tags) ? [...f.Tags].sort() : []), type || (isOneShot ? "One Shot" : "Campaign")],
      // Default to Generic.webp, will upgrade to specific cover if it exists
      coverUrl: '/adventures/Generic.webp',
    };
  });
});

// Tag color by type - uses keyword matching for flexible tag colors
const tagSeverity = (tag) => {
  const t = tag.toLowerCase();

  // Exact type matches first
  if (tag === "One Shot") return "success";
  if (tag === "Long Campaign") return "info";
  if (tag === "Short Campaigns") return "warn";

  // Keyword-based matching (check more specific first)
  if (t.includes("horror")) return "danger";
  if (t.includes("dark fantasy") || t.includes("grimdark")) return "danger";
  if (t.includes("high fantasy") || t.includes("epic fantasy")) return "info";
  if (t.includes("survival")) return "warn";
  if (t.includes("mystery") || t.includes("investigation")) return "info";
  if (t.includes("beginner") || t.includes("intro") || t.includes("starter")) return "success";
  if (t.includes("combat") || t.includes("tactical")) return "warn";
  if (t.includes("roleplay") || t.includes("social")) return "info";
  if (t.includes("exploration") || t.includes("sandbox")) return "info";

  return "secondary";
};
</script>

<style scoped>
.adventures-view {
  padding: 1.5rem 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Filter Bar */
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: var(--dark-card);
  border: 1px solid var(--dark-border);
  border-radius: 0.75rem;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  flex-wrap: wrap;
}

.filter-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--dark-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.filter-pills {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.filter-pills :deep(.p-button) {
  font-size: 0.75rem !important;
  padding: 0.3rem 0.7rem !important;
  height: auto !important;
}

.filter-bar .p-button-text {
  color: var(--primary);
  font-size: 0.8rem !important;
}

.help-me-pick-link {
  flex-shrink: 0;
}

.help-me-pick-btn {
  height: 2.25rem !important;
  background: linear-gradient(135deg, var(--primary), #8b5cf6) !important;
  border: none !important;
  color: var(--white) !important;
  border-radius: 0.5rem !important;
  font-size: 0.85rem !important;
  font-weight: 600 !important;
  padding: 0.4rem 1rem !important;
  box-shadow: 0 4px 12px rgba(220, 39, 44, 0.3) !important;
  transition: all 0.2s !important;
}

.help-me-pick-btn:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 6px 16px rgba(220, 39, 44, 0.4) !important;
  background: linear-gradient(135deg, #dc272e, #7c3aed) !important;
}

/* Hero CTA Section */
.hero-cta {
  margin-bottom: 1.5rem;
  padding: 2.5rem 2rem;
  background: linear-gradient(135deg, rgba(220, 39, 44, 0.15), rgba(139, 92, 246, 0.15));
  border: 1px solid rgba(220, 39, 44, 0.3);
  border-radius: 1.5rem;
  text-align: center;
}

.hero-cta-content {
  max-width: 700px;
  margin: 0 auto;
}

.hero-cta-title {
  margin: 0 0 0.75rem 0;
  font-size: 2rem;
  font-weight: 800;
  color: var(--white);
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
}

.hero-cta-title i {
  color: var(--primary);
  font-size: 2.25rem;
}

.hero-cta-subtitle {
  margin: 0 0 1.5rem 0;
  color: var(--dark-text-secondary);
  font-size: 1.1rem;
  line-height: 1.6;
}

.hero-cta-btn {
  display: inline-block;
}

.hero-cta-btn-inner {
  height: 3.5rem !important;
  background: linear-gradient(135deg, var(--primary), #8b5cf6) !important;
  border: none !important;
  color: var(--white) !important;
  border-radius: 0.75rem !important;
  font-size: 1.1rem !important;
  font-weight: 700 !important;
  padding: 0 2.5rem !important;
  box-shadow: 0 8px 24px rgba(220, 39, 44, 0.4) !important;
  transition: all 0.2s !important;
}

.hero-cta-btn-inner:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 12px 32px rgba(220, 39, 44, 0.5) !important;
  background: linear-gradient(135deg, #dc272e, #7c3aed) !important;
}

/* Hero CTA Background Book Covers */
.hero-cta {
  position: relative;
  overflow: hidden;
}

.hero-cta-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.hero-cta-books {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.hero-cta-book {
  position: absolute;
  width: 180px;
  height: 270px;
  transform-origin: center center;
  filter: drop-shadow(0 10px 25px rgba(0, 0, 0, 0.35));
  opacity: var(--opacity, 0.1);
  z-index: 0;
  animation: rainDown var(--duration, 12s) linear var(--delay, 0s) infinite;
  transform: rotate(var(--rotation, 0deg)) scale(var(--scale, 0.8));
}

.hero-cta-book-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0.75rem;
  box-shadow:
    0 10px 25px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(255, 255, 255, 0.05);
}

@keyframes rainDown {
  0% {
    transform: rotate(var(--rotation, 0deg)) scale(var(--scale, 0.8)) translateY(0);
    opacity: 0;
  }

  5% {
    opacity: var(--opacity, 0.1);
  }

  95% {
    opacity: var(--opacity, 0.1);
  }

  100% {
    transform: rotate(var(--rotation, 0deg)) scale(var(--scale, 0.8)) translateY(var(--fall-distance, 200vh));
    opacity: 0;
  }
}

.hero-cta-content {
  position: relative;
  z-index: 1;
}

/* Highlight Modal */
.highlight-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

.highlight-modal {
  background: var(--dark-card);
  border: 1px solid var(--dark-border);
  border-radius: 1rem;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  animation: slideUp 0.2s ease;
}

.highlight-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--dark-border);
}

.highlight-modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--white);
}

.highlight-modal-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 60vh;
  overflow-y: auto;
}

.highlight-cover {
  width: 100%;
  aspect-ratio: 3/4;
  border-radius: 0.75rem;
  overflow: hidden;
}

.highlight-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.highlight-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.highlight-tag {
  font-size: 0.65rem !important;
}

.highlight-description {
  margin: 0;
  color: var(--dark-text-secondary);
  font-size: 0.9rem;
  line-height: 1.6;
}

.highlight-meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  font-size: 0.8rem;
  color: var(--dark-text-secondary);
}

.highlight-meta .meta-item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.highlight-modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--dark-border);
  display: flex;
  justify-content: flex-end;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Loading & Error */
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  height: 50vh;
  color: var(--dark-text-secondary);
}

.error-container {
  margin: 3rem 0;
}

/* Sections */
.adventure-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* List - 100% width cards */
.adventure-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.adventure-card {
  background: var(--dark-card) !important;
  border: 1px solid var(--dark-border) !important;
  border-radius: 0.75rem !important;
  transition: border-color 0.2s;
  cursor: pointer;
}

.adventure-card:hover {
  border-color: rgba(255, 255, 255, 0.15) !important;
}

.adventure-card :deep(.p-card-body) {
  padding: 0 !important;
}

.adventure-card-inner {
  display: flex;
  align-items: stretch;
  min-height: 160px;
}

/* Book Cover - left side */
.book-cover {
  width: 120px;
  flex-shrink: 0;
  border-radius: 0.75rem 0 0 0.75rem;
  overflow: hidden;
  position: relative;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.cover-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: rgba(255, 255, 255, 0.7);
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

/* Content - right side, fills remaining width */
.adventure-content {
  flex: 1;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
}

.adventure-header {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 0.5rem;
}

.adventure-name {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--white);
}

.adventure-tags {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.adventure-tag {
  font-size: 0.65rem !important;
}

.adventure-description {
  margin: 0 0 0.5rem 0;
  color: var(--dark-text-secondary);
  font-size: 0.85rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.adventure-meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  font-size: 0.75rem;
  color: var(--dark-text-secondary);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 4rem 1rem;
  color: var(--dark-text-secondary);
}

.empty-icon {
  font-size: 2.5rem;
  color: var(--dark-border);
}

/* Responsive: stack on very small screens */
@media (max-width: 480px) {
  .adventure-card-inner {
    flex-direction: column;
  }

  .book-cover {
    width: 100%;
    height: 180px;
    border-radius: 0.75rem 0.75rem 0 0;
  }

  .adventure-content {
    padding: 1rem;
  }
}
</style>