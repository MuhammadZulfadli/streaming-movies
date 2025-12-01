<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronLeft, List } from 'lucide-vue-next'
import VideoPlayer from '../components/VideoPlayer.vue'
import EpisodeItem from '../components/EpisodeItem.vue'
import dramasData from '../data/dramas.json'

const route = useRoute()
const router = useRouter()

const drama = ref(null)
const currentEpisode = ref(null)

const loadData = () => {
  const dramaId = parseInt(route.params.dramaId)
  const episodeId = parseInt(route.params.episodeId)
  
  drama.value = dramasData.find(d => d.id === dramaId)
  
  if (drama.value) {
    currentEpisode.value = drama.value.episodes.find(e => e.id === episodeId)
  }
}

onMounted(loadData)

watch(() => route.params, loadData)

const playEpisode = (episode) => {
  router.push({
    name: 'Player',
    params: {
      dramaId: drama.value.id,
      episodeId: episode.id
    }
  })
}

const goBack = () => {
  if (drama.value) {
    router.push({ name: 'DramaDetail', params: { id: drama.value.id } })
  } else {
    router.push('/')
  }
}
</script>

<template>
  <div v-if="drama && currentEpisode" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="mb-6">
      <button 
        @click="goBack"
        class="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
      >
        <ChevronLeft class="w-5 h-5" />
        Back to Details
      </button>
      <h1 class="text-xl md:text-2xl font-bold text-white">
        {{ drama.title }} - <span class="text-rose-500">{{ currentEpisode.title }}</span>
      </h1>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Player Column -->
      <div class="lg:col-span-2">
        <VideoPlayer 
          :src="currentEpisode.videoUrl" 
          :poster="drama.banner"
        />
        <div class="mt-6 bg-gray-900 p-6 rounded-xl border border-gray-800">
          <h2 class="text-lg font-semibold text-white mb-2">Episode Description</h2>
          <p class="text-gray-400 text-sm">
            Watching {{ currentEpisode.title }}. Duration: {{ currentEpisode.duration }}.
            {{ drama.description }}
          </p>
        </div>
      </div>

      <!-- Playlist Column -->
      <div class="lg:col-span-1">
        <div class="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div class="p-4 border-b border-gray-800 flex items-center gap-2">
            <List class="w-5 h-5 text-rose-500" />
            <h3 class="font-bold text-white">Up Next</h3>
          </div>
          <div class="p-4 space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
            <EpisodeItem 
              v-for="ep in drama.episodes" 
              :key="ep.id" 
              :episode="ep"
              :is-active="ep.id === currentEpisode.id"
              @play="playEpisode"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="min-h-screen flex items-center justify-center text-white">
    Loading...
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #1f2937; 
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #4b5563; 
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #6b7280; 
}
</style>
