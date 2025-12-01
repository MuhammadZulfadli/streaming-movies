<script setup>
import { Play, Info } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const props = defineProps({
  drama: {
    type: Object,
    required: true
  }
})

const router = useRouter()

const playDrama = () => {
  if (props.drama.episodes && props.drama.episodes.length > 0) {
    router.push({ 
      name: 'Player', 
      params: { 
        dramaId: props.drama.id, 
        episodeId: props.drama.episodes[0].id 
      } 
    })
  }
}

const showDetails = () => {
  router.push({ name: 'DramaDetail', params: { id: props.drama.id } })
}
</script>

<template>
  <div class="relative w-full h-[500px] md:h-[600px] overflow-hidden">
    <!-- Background Image -->
    <div class="absolute inset-0">
      <img 
        :src="drama.banner || drama.poster" 
        class="w-full h-full object-cover"
        alt="Hero Banner"
      />
      <!-- Gradient Overlay -->
      <div class="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/60 to-transparent"></div>
      <div class="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-900/40 to-transparent"></div>
    </div>

    <!-- Content -->
    <div class="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-end pb-16 md:pb-24">
      <div class="max-w-2xl">
        <div class="flex items-center gap-2 mb-4">
          <span class="bg-rose-600 text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">Trending</span>
          <span class="text-gray-300 text-sm font-medium">{{ drama.genre.join(' • ') }}</span>
        </div>
        <h1 class="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
          {{ drama.title }}
        </h1>
        <p class="text-gray-300 text-base md:text-lg mb-8 line-clamp-3 md:line-clamp-2">
          {{ drama.description }}
        </p>
        
        <div class="flex flex-wrap gap-4">
          <button 
            @click="playDrama"
            class="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-full font-semibold transition-all transform hover:scale-105"
          >
            <Play class="w-5 h-5 fill-current" />
            Watch Now
          </button>
          <button 
            @click="showDetails"
            class="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-full font-semibold transition-all border border-white/10"
          >
            <Info class="w-5 h-5" />
            More Info
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
