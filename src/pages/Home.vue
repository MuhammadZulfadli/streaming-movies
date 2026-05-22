<script setup>
import { ref, computed, onMounted } from 'vue'
import HeroBanner from '../components/HeroBanner.vue'
import DramaCard from '../components/DramaCard.vue'
import dramasData from '../data/dramas.json'
import { store } from '../store'
import { Filter } from 'lucide-vue-next'

const dramas = ref(dramasData)

// Featured drama (first one for now)
const featuredDrama = computed(() => dramas.value[0])

// Trending dramas (mock logic: top rated) - fallback if needed, but not used in UI now
const trendingDramas = computed(() => {
  return [...dramas.value].sort((a, b) => b.rating - a.rating).slice(0, 4)
})

const apiTrendingDramas = ref([])
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

onMounted(() => {
  fetchTrendingDramas()
  fetchLatestDramas()
})

// Search Logic
const searchResults = computed(() => {
  if (!store.searchQuery && !store.selectedGenre && !store.selectedDuration) return []

  return dramas.value.filter(drama => {
    const matchesQuery = drama.title.toLowerCase().includes(store.searchQuery.toLowerCase()) ||
                         drama.genre.some(g => g.toLowerCase().includes(store.searchQuery.toLowerCase()))
    
    const matchesGenre = !store.selectedGenre || drama.genre.includes(store.selectedGenre)
    
    // Mock duration logic
    // 'short' < 1h 30m, 'medium' < 2h, 'long' >= 2h
    // drama.totalDuration is string like "1h 30m"
    // For simplicity, let's just check if string contains "1h" or "2h"
    let matchesDuration = true
    if (store.selectedDuration) {
      if (store.selectedDuration === 'short') matchesDuration = drama.totalDuration.includes('1h') && !drama.totalDuration.includes('2h')
      if (store.selectedDuration === 'medium') matchesDuration = drama.totalDuration.includes('1h 4') || drama.totalDuration.includes('1h 5')
      if (store.selectedDuration === 'long') matchesDuration = drama.totalDuration.includes('2h')
    }

    return matchesQuery && matchesGenre && matchesDuration
  })
})

const allGenres = computed(() => {
  const genres = new Set()
  dramas.value.forEach(d => d.genre.forEach(g => genres.add(g)))
  return Array.from(genres)
})

const isSearching = computed(() => !!store.searchQuery || !!store.selectedGenre || !!store.selectedDuration)
</script>

<template>
  <div class="space-y-12 pb-12">
    <!-- Hero Section (Hidden when searching) -->
    <HeroBanner v-if="featuredDrama && !isSearching" :drama="featuredDrama" />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12" :class="{ 'pt-8': isSearching }">
      
      <!-- Search Filters -->
      <div v-if="isSearching" class="bg-gray-800 p-4 rounded-xl border border-gray-700">
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex items-center gap-2 text-rose-500 font-medium">
            <Filter class="w-5 h-5" />
            <span>Filters:</span>
          </div>
          
          <select v-model="store.selectedGenre" class="bg-gray-900 text-white border border-gray-700 rounded-md px-3 py-1.5 text-sm focus:ring-rose-500 focus:border-rose-500">
            <option value="">All Genres</option>
            <option v-for="genre in allGenres" :key="genre" :value="genre">{{ genre }}</option>
          </select>

          <select v-model="store.selectedDuration" class="bg-gray-900 text-white border border-gray-700 rounded-md px-3 py-1.5 text-sm focus:ring-rose-500 focus:border-rose-500">
            <option value="">Any Duration</option>
            <option value="short">Short (< 1.5h)</option>
            <option value="medium">Medium (1.5h - 2h)</option>
            <option value="long">Long (> 2h)</option>
          </select>

          <button 
            @click="store.searchQuery = ''; store.selectedGenre = ''; store.selectedDuration = ''"
            class="text-gray-400 hover:text-white text-sm underline ml-auto"
          >
            Clear All
          </button>
        </div>
      </div>

      <!-- Search Results -->
      <section v-if="isSearching">
        <h2 class="text-2xl font-bold text-white mb-6">
          Search Results 
          <span class="text-gray-400 text-lg font-normal">({{ searchResults.length }} found)</span>
        </h2>
        <div v-if="searchResults.length > 0" class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <DramaCard 
            v-for="drama in searchResults" 
            :key="drama.id" 
            :drama="drama" 
          />
        </div>
        <div v-else class="text-center py-12 text-gray-400">
          No dramas found matching your criteria.
        </div>
      </section>

      <!-- Default Sections (Hidden when searching) -->
      <template v-else>
        <!-- Trending Section -->
        <section>
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-white">Trending Now</h2>
            <a href="#" class="text-rose-500 hover:text-rose-400 text-sm font-medium">View All</a>
          </div>
          
          <div v-if="isLoading" class="text-center py-8 text-gray-400">
            Loading trending content...
          </div>
          <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-6">
            <DramaCard 
              v-for="drama in apiTrendingDramas" 
              :key="drama.id" 
              :drama="drama" 
            />
          </div>
        </section>

        <!-- Latest Releases Section -->
        <section>
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-white">New Releases</h2>
            <a href="#" class="text-rose-500 hover:text-rose-400 text-sm font-medium">View All</a>
          </div>
          <div v-if="isLatestLoading" class="text-center py-8 text-gray-400">
            Loading new releases...
          </div>
          <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-6">
            <DramaCard 
              v-for="drama in apiLatestDramas" 
              :key="drama.id" 
              :drama="drama" 
            />
          </div>
        </section>
      </template>
    </div>
  </div>
</template>
