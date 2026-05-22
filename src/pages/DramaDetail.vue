<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Play, Clock, Star, Calendar } from "lucide-vue-next";
import EpisodeItem from "../components/EpisodeItem.vue";

const route = useRoute();
const router = useRouter();
const drama = ref(null);
const isLoading = ref(true);
const error = ref(null);

onMounted(async () => {
  const bookId = route.params.id; // Keep as string for API
  isLoading.value = true;
  error.value = null;

  try {
    const [detailRes, chaptersRes] = await Promise.all([
      fetch(`${import.meta.env.VITE_API_DETAIL_URL}?bookId=${bookId}`),
      fetch(`${import.meta.env.VITE_API_ALLEPISODE_URL}?bookId=${bookId}`)
    ]);

    if (!detailRes.ok) throw new Error("Failed to fetch detail");

    const detailData = await detailRes.json();
    const chaptersData = await chaptersRes.json();
    
    // Safety check if chaptersData is an array or nested
    const episodesList = Array.isArray(chaptersData) ? chaptersData : chaptersData?.data || [];

    drama.value = {
      id: detailData.bookId || bookId,
      title: detailData.bookName || "Unknown Title",
      poster: detailData.coverWap,
      banner: detailData.coverWap,
      description: detailData.introduction || "No description available",
      genre: detailData.tags || [],
      rating: 4.8, // Fallback
      year: new Date().getFullYear(),
      totalDuration: `${episodesList.length} Eps`,
      episodes: episodesList.map((ep, index) => ({
        id: ep.chapterId || Math.random(),
        title: ep.chapterName || `Episode ${index + 1}`,
        duration: "", // Optional fallback
        videoUrl: ep.video || ep.videoUrl || ""
      }))
    };
  } catch (err) {
    console.error("Error fetching drama:", err);
    error.value = "Failed to load drama details.";
  } finally {
    isLoading.value = false;
  }
});

const playEpisode = (episode) => {
  if (drama.value) {
    router.push({
      name: "Player",
      params: {
        dramaId: drama.value.id,
        episodeId: episode.id,
      },
    });
  }
};

const playFirstEpisode = () => {
  if (drama.value && drama.value.episodes.length > 0) {
    playEpisode(drama.value.episodes[0]);
  }
};
</script>

<template>
  <div v-if="drama" class="min-h-screen pb-12">
    <!-- Backdrop -->
    <div class="relative h-[400px]">
      <div class="absolute inset-0">
        <img
          :src="drama.banner || drama.poster"
          class="w-full h-full object-cover"
          alt="Backdrop"
        />
        <div
          class="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/80 to-transparent"
        ></div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
      <div class="flex flex-col md:flex-row gap-8">
        <!-- Poster -->
        <div class="flex-shrink-0 w-48 md:w-64 mx-auto md:mx-0">
          <img
            :src="drama.poster"
            class="w-full rounded-xl shadow-2xl border-4 border-gray-800"
            :alt="drama.title"
          />
        </div>

        <!-- Info -->
        <div class="flex-grow text-center md:text-left pt-4 md:pt-12">
          <h1 class="text-4xl font-bold text-white mb-2">{{ drama.title }}</h1>

          <div
            class="flex flex-wrap items-center justify-center md:justify-start gap-4 text-gray-300 text-sm mb-6"
          >
            <div class="flex items-center gap-1">
              <Star class="w-4 h-4 text-yellow-400 fill-current" />
              <span>{{ drama.rating }}</span>
            </div>
            <div class="flex items-center gap-1">
              <Calendar class="w-4 h-4" />
              <span>{{ drama.year }}</span>
            </div>
            <div class="flex items-center gap-1">
              <Clock class="w-4 h-4" />
              <span>{{ drama.totalDuration }}</span>
            </div>
            <div class="flex gap-2">
              <span
                v-for="g in drama.genre"
                :key="g"
                class="bg-gray-800 px-2 py-0.5 rounded text-xs border border-gray-700"
              >
                {{ g }}
              </span>
            </div>
          </div>

          <p class="text-gray-300 mb-8 max-w-2xl leading-relaxed">
            {{ drama.description }}
          </p>

          <button
            @click="playFirstEpisode"
            class="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-8 py-3 rounded-full font-bold transition-all transform hover:scale-105 shadow-lg shadow-rose-600/20"
          >
            <Play class="w-5 h-5 fill-current" />
            Watch First Episode
          </button>
        </div>
      </div>

      <!-- Episodes List -->
      <div class="mt-16 max-w-4xl">
        <h2 class="text-2xl font-bold text-white mb-6">Episodes</h2>
        <div class="grid gap-4">
          <EpisodeItem
            v-for="episode in drama.episodes"
            :key="episode.id"
            :episode="episode"
            @play="playEpisode"
          />
        </div>
      </div>
    </div>
  </div>
  <div v-else class="min-h-screen flex flex-col items-center justify-center text-white">
    <div v-if="isLoading" class="text-xl animate-pulse">Loading drama details...</div>
    <div v-else-if="error" class="text-xl text-rose-500">{{ error }}</div>
    <div v-else class="text-xl text-gray-400">Drama not found.</div>
  </div>
</template>
