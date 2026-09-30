<template>
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
          <Card v-for="adventure in filteredAdventures" :key="adventure.id" class="adventure-card">
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
                      Lv {{ adventure.startLevel }}{{ adventure.endLevel && adventure.endLevel !== adventure.startLevel
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
</template>

<script setup>
import { computed, onMounted, ref, reactive } from "vue";
import axios from "axios";

import Card from "primevue/card";
import Button from "primevue/button";
import Tag from "primevue/tag";
import Message from "primevue/message";

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

/* Level select dropdowns */
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