<script setup>
import { Play } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const props = defineProps({
  drama: {
    type: Object,
    required: true
  }
})

const router = useRouter()

const navigateToDetail = () => {
  router.push({ name: 'DramaDetail', params: { id: props.drama.id } })
}
</script>

<template>
  <div 
    class="group relative bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
    @click="navigateToDetail"
  >
    <!-- Poster Image -->
    <div class="aspect-[2/3] overflow-hidden relative">
      <img 
        :src="drama.poster" 
        :alt="drama.title" 
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <!-- Overlay on hover -->
      <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <div class="bg-rose-500 rounded-full p-3 shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300 delay-100">
          <Play class="w-6 h-6 text-white fill-current" />
        </div>
      </div>
      <!-- Rating Badge -->
      <div class="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1">
        <span class="text-yellow-400 text-xs">★</span>
        <span class="text-white text-xs font-bold">{{ drama.rating }}</span>
      </div>
    </div>

    <!-- Content -->
    <div class="p-4">
      <h3 class="text-white font-semibold truncate group-hover:text-rose-400 transition-colors">{{ drama.title }}</h3>
      <div class="flex items-center gap-2 mt-2 text-xs text-gray-400">
        <span>{{ drama.year }}</span>
        <span>•</span>
        <span class="truncate">{{ drama.genre.join(', ') }}</span>
      </div>
    </div>
  </div>
</template>
