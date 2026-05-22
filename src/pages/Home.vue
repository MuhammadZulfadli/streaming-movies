<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import DramaCard from '../components/DramaCard.vue'
import HeroBanner from '../components/HeroBanner.vue'
import { store } from '../store'

// State trending data
const apiTrendingDramas = ref([])

// State untuk hero banner
const dramas = ref(apiTrendingDramas)

// computed untuk mendapatkan data random dari trending data
const featuredDrama = computed(() => dramas.value[Math.floor(Math.random() * dramas.value.length)])

const isLoading = ref(false)

const fetchTrendingDramas = async () => {
  isLoading.value = true
  try {
    const response = await fetch(import.meta.env.VITE_SANSEKAI_API_URL)
    const data = await response.json()
    apiTrendingDramas.value = data.slice(0, 4).map(item => ({
      id: item.bookId,
      title: item.bookName,
      poster: item.coverWap,
      genre: item.tags,
      rating: 4.8, // Default rating
      year: 2024,
      description: item.introduction,
      episodes: []
    }))
  } catch (error) {
    console.error('Error fetching trending dramas:', error)
  } finally {
    isLoading.value = false
  }
}

const apiLatestDramas = ref([])
const isLatestLoading = ref(false)

const fetchLatestDramas = async () => {
  isLatestLoading.value = true
  try {
    const response = await fetch(import.meta.env.VITE_API_LATEST_URL)
    const data = await response.json()
    apiLatestDramas.value = data.slice(0, 8).map(item => ({
      id: item.bookId,
      title: item.bookName,
      poster: item.coverWap,
      genre: item.tags || [],
      rating: 4.7, // Default rating
      year: item.shelfTime ? new Date(item.shelfTime).getFullYear() : 2024,
      description: item.introduction,
      episodes: []
    }))
  } catch (error) {
    console.error('Error fetching latest dramas:', error)
  } finally {
    isLatestLoading.value = false
  }
}

onMounted(async () => {
  await Promise.all(
    fetchTrendingDramas(),
    fetchLatestDramas()
  )
})

// Search Logic — API-based
const searchResults = ref([])
const isSearchLoading = ref(false)
let searchDebounceTimer = null

const fetchSearchResults = async (query) => {
  if (!query || query.trim() === '') {
    searchResults.value = []
    return
  }

  isSearchLoading.value = true
  try {
    const encodedQuery = encodeURIComponent(query.trim())
    const response = await fetch(`${import.meta.env.VITE_API_SEARCH_URL}?query=${encodedQuery}`)
    if (!response.ok) throw new Error('Gagal mengambil hasil pencarian')

    const data = await response.json()
    searchResults.value = data.map(item => ({
      id: item.bookId,
      title: item.bookName,
      poster: item.cover,
      genre: item.tags || [],
      rating: 4.8,
      year: item.shelfTime ? new Date(item.shelfTime).getFullYear() : 2024,
      description: item.introduction,
      episodes: []
    }))
  } catch (error) {
    console.error('Error fetching search results:', error)
    searchResults.value = []
  } finally {
    isSearchLoading.value = false
  }
}

// Watch perubahan searchQuery dengan debounce 500ms
watch(() => store.searchQuery, (newQuery) => {
  clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(() => {
    fetchSearchResults(newQuery)
  }, 500)
})

const isSearching = computed(() => !!store.searchQuery)
</script>

<template>
  <div class="space-y-12 pb-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pt-8">

      <!-- Hero Section (Hidden when searching) -->
      <HeroBanner v-if="featuredDrama && !isSearching" :drama="featuredDrama" />

      <!-- Search Results -->
      <section v-if="isSearching">
        <h2 class="text-2xl font-bold text-white mb-6">
          Search Results
          <span class="text-gray-400 text-lg font-normal">({{ searchResults.length }} found)</span>
        </h2>

        <!-- Loading State saat API sedang dipanggil -->
        <div v-if="isSearchLoading" class="text-center py-12 text-gray-400">
          Mencari drama...
        </div>

        <!-- Tampilkan hasil setelah loading selesai -->
        <template v-else>
          <div v-if="searchResults.length > 0" class="grid grid-cols-2 md:grid-cols-4 gap-6">
            <DramaCard v-for="drama in searchResults" :key="drama.id" :drama="drama" />
          </div>
          <div v-else-if="store.searchQuery" class="text-center py-12 text-gray-400">
            Tidak ada drama yang ditemukan untuk "<strong class="text-white">{{ store.searchQuery }}</strong>".
          </div>
        </template>
      </section>

      <!-- Default Sections (Hidden when searching) -->
      <template v-else>
        <!-- Trending Section -->
        <section id="trending">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-white">Trending Now</h2>
          </div>

          <div v-if="isLoading" class="text-center py-8 text-gray-400">
            Loading trending content...
          </div>
          <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-6">
            <DramaCard v-for="drama in apiTrendingDramas" :key="drama.id" :drama="drama" />
          </div>
        </section>

        <!-- Latest Releases Section -->
        <section>
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-white">New Releases</h2>
          </div>
          <div v-if="isLatestLoading" class="text-center py-8 text-gray-400">
            Loading new releases...
          </div>
          <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-6">
            <DramaCard v-for="drama in apiLatestDramas" :key="drama.id" :drama="drama" />
          </div>
        </section>
      </template>
    </div>
  </div>
</template>