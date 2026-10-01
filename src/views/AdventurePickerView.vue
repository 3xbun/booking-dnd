<template>
  <div class="picker-view">
    <!-- Header -->
    <section class="picker-hero">
      <div class="hero-content">
        <h1 class="hero-title">
          <i class="fa-duotone fa-solid fa-magic-wand-sparkles"></i>
          ช่วยเลือกให้หน่อย
        </h1>
        <p class="hero-subtitle">
          ตอบคำถามไม่กี่ข้อ แล้วเราจะแนะนำ 3 ผจญภัยที่ตรงกับสไตล์ของคุณ
        </p>
      </div>
    </section>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <i class="fa-duotone fa-regular fa-arrows-rotate fa-spin"></i>
      <p>กำลังโหลดรายการผจญภัย...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <Message severity="error" life="5000">
        <i class="fa-duotone fa-solid fa-triangle-exclamation"></i>
        ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง
      </Message>
    </div>

    <!-- Step 1: Questions -->
    <div v-else-if="step === 1" class="picker-content">
      <div class="question-card">
        <h2 class="question-title">
          <span class="step-badge">{{ currentQuestionIndex + 1 }} / {{ totalQuestions }}</span>
          {{ currentQuestion.text }}
        </h2>
        <p class="question-hint">{{ currentQuestion.hint }}</p>

        <div class="options-grid">
          <Button v-for="opt in currentQuestion.options" :key="opt.value" :label="opt.label" :class="[
            'option-btn p-button-rounded',
            selectedAnswers[currentQuestion.key] === opt.value
              ? 'p-button-primary'
              : 'p-button-outlined p-button-secondary'
          ]" @click="selectAnswer(currentQuestion.key, opt.value)" />
        </div>

        <div class="question-nav">
          <Button v-if="currentQuestionIndex > 0" label="ย้อนกลับ" icon="fa-duotone fa-solid fa-arrow-left"
            class="p-button-text p-button-sm" @click="prevQuestion" />
          <Button v-if="currentQuestionIndex < totalQuestions - 1" label="ถัดไป"
            icon="fa-duotone fa-solid fa-arrow-right" iconPos="right" class="p-button-primary p-button-sm"
            @click="nextQuestion" :disabled="!selectedAnswers[currentQuestion.key]" />
          <Button v-else label="ดูผลลัพธ์" icon="fa-duotone fa-solid fa-magic-wand-sparkles" iconPos="right"
            class="p-button-primary p-button-sm" @click="generateRecommendations"
            :disabled="!selectedAnswers[currentQuestion.key]" />
        </div>
      </div>
    </div>

    <!-- Step 2: Results -->
    <div v-else-if="step === 2" class="picker-content">
      <div class="results-header">
        <h2 class="results-title">
          <i class="fa-duotone fa-solid fa-star"></i>
          3 ผจญภัยแนะนำ
        </h2>
        <p class="results-subtitle">จากคำตอบของคุณ นี่คือ 3 ผจญภัยที่เราคิดว่าคุณจะชอบ:</p>
      </div>

      <div class="results-grid">
        <Card v-for="adv in recommendations" :key="adv.id" class="result-card">
          <template #content>
            <div class="result-card-inner">
              <!-- Cover -->
              <div class="result-cover">
                <img :src="coverUrls.get(adv.adventureId) || '/adventures/Generic.webp'" :alt="adv.title + ' cover'"
                  class="cover-image" />
              </div>

              <div class="result-content">
                <h4 class="result-title">{{ adv.title }}</h4>
                <div class="result-tags">
                  <Tag v-for="tag in adv.displayTags" :key="tag" :value="tag" :severity="tagSeverity(tag)"
                    class="result-tag" />
                </div>
                <p class="result-description">{{ adv.description }}</p>
                <div class="result-meta">
                  <span class="meta-item">
                    <i class="fa-duotone fa-solid fa-chart-simple"></i>
                    ระดับ {{ adv.startLevel }}{{ adv.endLevel && adv.endLevel !== adv.startLevel ? "–" + adv.endLevel :
                    "" }}
                  </span>
                  <span v-if="adv.settings" class="meta-item">
                    <i class="fa-duotone fa-solid fa-map-location-dot"></i>
                    {{ adv.settings }}
                  </span>
                </div>
                <RouterLink :to="{ path: '/adventures', query: { highlight: adv.id } }" class="result-action">
                  <i class="fa-duotone fa-solid fa-arrow-right"></i>
                  ดูรายละเอียด
                </RouterLink>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <div class="results-actions">
        <Button label="เริ่มใหม่" icon="fa-duotone fa-solid fa-rotate-left" class="p-button-outlined p-button-sm"
          @click="resetPicker" />
        <RouterLink to="/adventures" class="action-link">
          <Button label="ดูทั้งหมด" icon="fa-duotone fa-solid fa-list" :iconPos="right"
            class="p-button-primary p-button-sm" />
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import axios from "axios";

import Card from "primevue/card";
import Button from "primevue/button";
import Tag from "primevue/tag";
import Message from "primevue/message";

import { useRouter, useRoute } from "vue-router";

const ADVENTURES_URL =
  "https://ndb.3xbun.com/api/v3/data/p0w0egc69gysun8/mslau6b61v0pln0/records";
const API_HEADERS = {
  "xc-token": import.meta.env.VITE_NDB_API,
};

const router = useRouter();
const route = useRoute();

// State
const adventures = ref([]);
const loading = ref(true);
const error = ref(false);
const step = ref(1); // 1 = questions, 2 = results
const currentQuestionIndex = ref(0);
const selectedAnswers = ref({});
const recommendations = ref([]);
const coverUrls = ref(new Map());

// Questions flow (Thai)
const questions = [
  {
    key: "experience",
    text: "ประสบการณ์เล่น D&D ของกลุ่มเป็นอย่างไร?",
    hint: "ช่วยให้เราเลือกความซับซ้อนที่เหมาะสม",
    options: [
      { value: "beginner", label: "พึ่งเริ่มเล่น" },
      { value: "some", label: "เล่นมาบ้างแล้ว" },
      { value: "experienced", label: "เล่นมานาน/เก๋าแล้ว" },
    ],
  },
  {
    key: "tone",
    text: "อยากได้บรรยากาศแบบไหน?",
    hint: "เลือกไวบส์ที่กลุ่มชอบที่สุด",
    options: [
      { value: "dark", label: "มืดมน ซับซ้อน" },
      { value: "heroic", label: "วีรบุรุษ มหากาพย์" },
      { value: "mystery", label: "ปริศนา สืบสวน" },
      { value: "light", label: "สนุก สบาย ๆ" },
    ],
  },
  {
    key: "length",
    text: "อยากเล่นนานแค่ไหน?",
    hint: "เวลาที่มีอยู่สำคัญมาก",
    options: [
      { value: "one-shot", label: "จบในครั้งเดียว (3-4 ชม.)" },
      { value: "short", label: "แคมเปญสั้น (4-8 รอบ)" },
      { value: "long", label: "แคมเปญยาว (10+ รอบ)" },
    ],
  },
  {
    key: "style",
    text: "ชอบเล่นแบบไหน?",
    hint: "กลุ่มของคุณชอบเล่นยังไง?",
    options: [
      { value: "combat", label: "ต่อสู้ กลยุทธ์" },
      { value: "roleplay", label: "บทบาท สังคม" },
      { value: "exploration", label: "สำรวจ แซนด์บ็อกซ์" },
      { value: "balanced", label: "ผสมผสานทุกอย่าง" },
    ],
  },
];

const totalQuestions = questions.length;

const currentQuestion = computed(() => questions[currentQuestionIndex.value]);

// Fetch catalog
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

// Cover preloader (reuse logic from AdventuresView)
const preloadCovers = () => {
  for (const adv of adventures.value) {
    const f = adv.fields || {};
    const aid = (f.AdventureID || "").trim();
    if (!aid) continue;
    const url = `/adventures/${aid}.webp`;
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth > 0) coverUrls.value.set(aid, url);
    };
    img.src = url;
  }
};

const selectAnswer = (key, value) => {
  selectedAnswers.value[key] = value;
};

const nextQuestion = () => {
  if (currentQuestionIndex.value < totalQuestions - 1) {
    currentQuestionIndex.value++;
  }
};

const prevQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--;
  }
};

const resetPicker = () => {
  step.value = 1;
  currentQuestionIndex.value = 0;
  selectedAnswers.value = {};
  recommendations.value = [];
};

// Scoring algorithm
const generateRecommendations = () => {
  const answers = selectedAnswers.value;
  const catalog = adventures.value.map((record) => {
    const f = record.fields || {};
    return {
      id: record.id,
      adventureId: (f.AdventureID || "").trim(),
      title: (f.Title || "").replace(/\r?\n+$/, "").trim(),
      description: (f.Description || "").replace(/\r?\n+$/, "").trim(),
      startLevel: f.StartLevel || "",
      endLevel: f.EndLevel || "",
      tags: Array.isArray(f.Tags) ? f.Tags : [],
      settings: f.Settings || "",
      type: (f.Types || "").trim(),
    };
  });

  // Score each adventure
  const scored = catalog.map((adv) => {
    let score = 0;

    // Experience -> Level range
    if (answers.experience === "beginner") {
      if (parseInt(adv.startLevel) <= 2) score += 3;
      else if (parseInt(adv.startLevel) <= 5) score += 1;
    } else if (answers.experience === "experienced") {
      if (parseInt(adv.startLevel) >= 5) score += 2;
    }

    // Tone -> Tags
    if (answers.tone === "dark") {
      if (adv.tags.some(t => ["Dark Fantasy", "Gothic Horror", "Psychological Horror", "Cosmic Horror", "Survival Horror"].includes(t))) score += 4;
    }
    if (answers.tone === "heroic") {
      if (adv.tags.some(t => ["High Fantasy", "Epic Fantasy"].includes(t))) score += 4;
    }
    if (answers.tone === "mystery") {
      if (adv.tags.some(t => ["Mystery", "Investigation"].includes(t))) score += 4;
    }
    if (answers.tone === "light") {
      if (adv.tags.some(t => ["Beginner Friendly", "High Fantasy"].includes(t))) score += 2;
    }

    // Length -> Type
    if (answers.length === "one-shot" && adv.type.includes("One Shot")) score += 5;
    if (answers.length === "short" && adv.type.includes("Short Campaigns")) score += 4;
    if (answers.length === "long" && adv.type.includes("Long Campaign")) score += 4;

    // Style -> Tags
    if (answers.style === "combat") {
      if (adv.tags.some(t => ["Tactical Combat", "Combat Heavy", "Survival Horror"].includes(t))) score += 3;
    }
    if (answers.style === "roleplay") {
      if (adv.tags.some(t => ["Roleplay Heavy", "Social", "Mystery", "Investigation"].includes(t))) score += 3;
    }
    if (answers.style === "exploration") {
      if (adv.tags.some(t => ["Exploration", "Sandbox", "High Fantasy", "Epic Fantasy"].includes(t))) score += 3;
    }
    if (answers.style === "balanced") {
      // Small bonus for variety
      score += adv.tags.length;
    }

    return { ...adv, score };
  });

  // Sort by score, take top 3
  scored.sort((a, b) => b.score - a.score);
  recommendations.value = scored.slice(0, 3);

  // Preload covers for results
  preloadCovers();

  step.value = 2;
};

// Tag severity (copied from AdventuresView)
const tagSeverity = (tag) => {
  const t = tag.toLowerCase();
  if (tag === "One Shot") return "success";
  if (tag === "Long Campaign") return "info";
  if (tag === "Short Campaigns") return "warn";
  if (t.includes("horror") || t.includes("dark fantasy") || t.includes("grimdark")) return "danger";
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
.picker-view {
  padding: 1.5rem 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 900px;
  margin: 0 auto;
}

/* Hero */
.picker-hero {
  text-align: center;
  padding: 2rem 1.5rem;
  background: linear-gradient(135deg, rgba(220, 39, 44, 0.15), rgba(139, 92, 246, 0.1));
  border: 1px solid var(--dark-border);
  border-radius: 1.5rem;
}

.hero-title {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 800;
  color: var(--white);
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
}

.hero-title i {
  color: var(--primary);
  font-size: 2.25rem;
}

.hero-subtitle {
  margin: 0;
  color: var(--dark-text-secondary);
  font-size: 1.1rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
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

/* Question Card */
.picker-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.question-card {
  width: 100%;
  max-width: 600px;
  background: var(--dark-card);
  border: 1px solid var(--dark-border);
  border-radius: 1.25rem;
  padding: 2rem;
}

.question-title {
  margin: 0 0 0.25rem 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--white);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.step-badge {
  background: var(--primary);
  color: var(--white);
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
}

.question-hint {
  margin: 0 0 1.5rem 0;
  color: var(--dark-text-secondary);
  font-size: 0.9rem;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

@media (max-width: 480px) {
  .options-grid {
    grid-template-columns: 1fr;
  }
}

.option-btn {
  height: 3.5rem !important;
  font-size: 0.95rem !important;
  font-weight: 600 !important;
  text-align: center !important;
  transition: all 0.2s;
}

.option-btn.p-button-primary {
  box-shadow: 0 0 0 2px rgba(220, 39, 44, 0.3);
}

.question-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid var(--dark-border);
}

/* Results */
.results-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.results-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--white);
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
}

.results-title i {
  color: #f59e0b;
}

.results-subtitle {
  margin: 0;
  color: var(--dark-text-secondary);
  font-size: 1rem;
}

.results-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 768px) {
  .results-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.result-card {
  background: var(--dark-card) !important;
  border: 1px solid var(--dark-border) !important;
  border-radius: 1rem !important;
  transition: transform 0.2s, border-color 0.2s;
}

.result-card:hover {
  transform: translateY(-4px);
  border-color: rgba(220, 39, 44, 0.4) !important;
}

.result-card :deep(.p-card-body) {
  padding: 0 !important;
}

.result-card-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.result-cover {
  width: 100%;
  aspect-ratio: 3/4;
  overflow: hidden;
  border-radius: 1rem 1rem 0 0;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.result-card:hover .cover-image {
  transform: scale(1.05);
}

.result-content {
  flex: 1;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.result-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--white);
}

.result-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-bottom: 0.75rem;
}

.result-tag {
  font-size: 0.65rem !important;
}

.result-description {
  margin: 0 0 0.75rem 0;
  color: var(--dark-text-secondary);
  font-size: 0.85rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.result-meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  font-size: 0.75rem;
  color: var(--dark-text-secondary);
  margin-bottom: 1rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.result-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.6rem 1rem;
  background: rgba(220, 39, 44, 0.15);
  border: 1px solid rgba(220, 39, 44, 0.3);
  border-radius: 0.5rem;
  color: var(--primary);
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
}

.result-action:hover {
  background: rgba(220, 39, 44, 0.25);
  border-color: var(--primary);
}

.results-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}

.action-link {
  text-decoration: none;
}
</style>