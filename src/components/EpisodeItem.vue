<script setup>
import { PlayCircle } from 'lucide-vue-next'

defineProps({
  episode: {
    type: Object,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  }
})

defineEmits(['play'])
</script>

<template>
  <div 
    class="flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors group"
    :class="isActive ? 'bg-rose-500/10 border border-rose-500/20' : 'bg-gray-800 hover:bg-gray-700'"
    @click="$emit('play', episode)"
  >
    <div class="flex-shrink-0">
      <PlayCircle 
        class="w-8 h-8 transition-colors"
        :class="isActive ? 'text-rose-500' : 'text-gray-400 group-hover:text-white'" 
      />
    </div>
    <div class="flex-grow min-w-0">
      <h4 
        class="text-sm font-medium truncate"
        :class="isActive ? 'text-rose-400' : 'text-gray-200 group-hover:text-white'"
      >
        {{ episode.title }}
      </h4>
      <p class="text-xs text-gray-500 mt-0.5">{{ episode.duration }}</p>
    </div>
  </div>
</template>
