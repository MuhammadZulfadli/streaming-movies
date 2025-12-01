<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  poster: {
    type: String,
    default: ''
  }
})

const videoRef = ref(null)

// Simple watch to reload video if src changes
watch(() => props.src, (newSrc) => {
  if (videoRef.value) {
    videoRef.value.load()
    videoRef.value.play().catch(e => console.log('Autoplay prevented:', e))
  }
})
</script>

<template>
  <div class="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
    <video
      ref="videoRef"
      class="w-full h-full object-contain"
      controls
      :poster="poster"
    >
      <source :src="src" type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  </div>
</template>
