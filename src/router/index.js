import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import DramaDetail from '../pages/DramaDetail.vue'
import Player from '../pages/Player.vue'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home
    },
    {
        path: '/drama/:id',
        name: 'DramaDetail',
        component: DramaDetail,
        props: true
    },
    {
        path: '/watch/:dramaId/:episodeId',
        name: 'Player',
        component: Player,
        props: true
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        return { top: 0 }
    }
})

export default router
