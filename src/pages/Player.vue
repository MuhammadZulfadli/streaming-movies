<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronLeft, List } from 'lucide-vue-next'
import VideoPlayer from '../components/VideoPlayer.vue'
import EpisodeItem from '../components/EpisodeItem.vue'

const route = useRoute()
const router = useRouter()

const drama = ref(null)
const currentEpisode = ref(null)
const decryptedVideoUrl = ref("")
const isLoading = ref(true)
const isDecrypting = ref(false)
const error = ref(null)

const getEncryptedUrl = (episodeObj) => {
  if (episodeObj.cdnList && episodeObj.cdnList.length > 0) {
    const cdn = episodeObj.cdnList.find(c => c.isDefault) || episodeObj.cdnList[0];
    if (cdn.videoPathList && cdn.videoPathList.length > 0) {
      const video = cdn.videoPathList.find(v => v.isDefault) || cdn.videoPathList[0];
      return video.videoPath;
    }
  }
  return episodeObj.video || episodeObj.videoUrl || "";
};

const decryptVideo = async (encryptedUrl) => {
  if (!encryptedUrl) {
    error.value = "Link streaming tidak valid."
    return
  }

  isDecrypting.value = true
  try {
    const res = await fetch(`${import.meta.env.VITE_API_DECRYPT_URL}?url=${encodeURIComponent(encryptedUrl)}`)
    if (!res.ok) throw new Error("Gagal mendekripsi video")
    
    const result = await res.json()
    if (result.success && result.streamUrl) {
      decryptedVideoUrl.value = result.streamUrl
    } else {
      throw new Error(result.message || "Dekripsi gagal")
    }
  } catch (err) {
    console.error(err)
    error.value = "Gagal mendekripsi link video streaming."
  } finally {
    isDecrypting.value = false
  }
}

const loadData = async () => {
  isLoading.value = true
  error.value = null
  decryptedVideoUrl.value = ""

  const { dramaId, episodeId } = route.params

  try {
    const [detailRes, episodesRes] = await Promise.all([
      fetch(`${import.meta.env.VITE_API_DETAIL_URL}?bookId=${dramaId}`),
      fetch(`${import.meta.env.VITE_API_ALLEPISODE_URL}?bookId=${dramaId}`)
    ])

    if (!detailRes.ok || !episodesRes.ok) {
      throw new Error("Gagal mengambil data dari API")
    }

    const detailData = await detailRes.json()
    const episodesDataRaw = await episodesRes.json()
    const episodesData = Array.isArray(episodesDataRaw) ? episodesDataRaw : episodesDataRaw?.data || []

    drama.value = {
      id: detailData.bookId || dramaId,
      title: detailData.bookName || "Unknown Title",
      banner: detailData.coverWap,
      description: detailData.introduction || "No description available",
      episodes: episodesData.map((ep, idx) => ({
        id: ep.chapterId,
        title: ep.chapterName || `Episode ${idx + 1}`,
        encryptedUrl: getEncryptedUrl(ep)
      }))
    }

    const matchedEp = drama.value.episodes.find(e => String(e.id) === String(episodeId))
    if (matchedEp) {
      currentEpisode.value = matchedEp
      await decryptVideo(matchedEp.encryptedUrl)
    } else {
      error.value = "Episode tidak ditemukan."
    }
  } catch (err) {
    console.error(err)
    error.value = "Gagal memuat data drama atau daftar episode."
  } finally {
    isLoading.value = false
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
  <div v-if="!isLoading && !error && drama && currentEpisode" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          v-if="decryptedVideoUrl"
          :src="decryptedVideoUrl" 
          :poster="drama.banner"
        />
        <div v-else-if="isDecrypting" class="aspect-video bg-black rounded-xl flex items-center justify-center text-white shadow-2xl">
          <div class="animate-pulse flex flex-col items-center">
            <div class="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            Mendekripsi link streaming...
          </div>
        </div>
        <div v-else-if="error" class="aspect-video bg-black rounded-xl flex items-center justify-center text-rose-500 shadow-2xl">
          {{ error }}
        </div>

        <div class="mt-6 bg-gray-900 p-6 rounded-xl border border-gray-800">
          <h2 class="text-lg font-semibold text-white mb-2">Episode Description</h2>
          <p class="text-gray-400 text-sm">
            Watching {{ currentEpisode.title }}. Duration: {{ currentEpisode.duration || 'N/A' }}.
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
              :is-active="String(ep.id) === String(currentEpisode.id)"
              @play="playEpisode"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="min-h-screen flex flex-col items-center justify-center text-white">
    <div v-if="isLoading" class="text-xl animate-pulse">Memuat pemutar video...</div>
    <div v-else-if="error" class="text-xl text-rose-500">{{ error }}</div>
    <div v-else class="text-xl text-gray-400">Data tidak ditemukan.</div>
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
