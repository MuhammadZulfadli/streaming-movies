import { reactive } from 'vue'

export const store = reactive({
    searchQuery: '',
    selectedGenre: '',
    selectedDuration: '' // 'short', 'medium', 'long'
})
