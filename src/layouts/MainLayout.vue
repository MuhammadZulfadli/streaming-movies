<script setup>
import Navbar from '../components/Navbar.vue'
import Footer from '../components/Footer.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-950 text-white">
    <Navbar />
    <main class="flex-grow pt-16">
      <slot />
    </main>
    <Footer />
  </div>
</template>
