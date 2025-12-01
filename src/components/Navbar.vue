<script setup>
import { ref, watch } from 'vue'
import { Search, Menu, X, PlayCircle } from 'lucide-vue-next'
import { useRouter, useRoute } from 'vue-router'
import { store } from '../store'

const router = useRouter()
const route = useRoute()
const isMobileMenuOpen = ref(false)

// Sync local input with store
const handleSearch = () => {
  if (route.path !== '/' && store.searchQuery) {
    router.push('/')
  }
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}
</script>

<template>
  <nav class="fixed top-0 w-full z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <div class="flex-shrink-0 cursor-pointer" @click="router.push('/')">
          <div class="flex items-center gap-2 text-primary-500">
            <PlayCircle class="w-8 h-8 text-rose-500" />
            <span class="text-xl font-bold bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent">
              DramaShorts
            </span>
          </div>
        </div>

        <!-- Desktop Menu -->
        <div class="hidden md:block">
          <div class="ml-10 flex items-baseline space-x-4">
            <router-link to="/" class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Home
            </router-link>
            <a href="#" class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Trending
            </a>
            <a href="#" class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
              New Releases
            </a>
          </div>
        </div>

        <!-- Search Bar -->
        <div class="hidden md:block flex-1 max-w-md ml-8">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search class="h-5 w-5 text-gray-400" />
            </div>
            <input
              v-model="store.searchQuery"
              @input="handleSearch"
              type="text"
              class="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-full leading-5 bg-gray-800 text-gray-300 placeholder-gray-400 focus:outline-none focus:bg-gray-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 sm:text-sm transition-all"
              placeholder="Search dramas, genres..."
            />
          </div>
        </div>

        <!-- Mobile menu button -->
        <div class="-mr-2 flex md:hidden">
          <button @click="toggleMobileMenu" class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none">
            <Menu v-if="!isMobileMenuOpen" class="h-6 w-6" />
            <X v-else class="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div v-if="isMobileMenuOpen" class="md:hidden bg-gray-900 border-b border-gray-800">
      <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
        <router-link to="/" class="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
          Home
        </router-link>
        <a href="#" class="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
          Trending
        </a>
        <a href="#" class="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
          New Releases
        </a>
        <div class="mt-4 px-3">
           <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search class="h-5 w-5 text-gray-400" />
            </div>
            <input
              v-model="store.searchQuery"
              @input="handleSearch"
              type="text"
              class="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-full leading-5 bg-gray-800 text-gray-300 placeholder-gray-400 focus:outline-none focus:bg-gray-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 sm:text-sm"
              placeholder="Search..."
            />
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>
