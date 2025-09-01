import {createMemoryHistory, createRouter} from 'vue-router'

/* Pages */
import Home from './frames/Home/Main/main.vue'
import Tasks from './frames/Tasks/Main/main.vue'
import Friends from './frames/Friends/Main/main.vue'
import Shop from './frames/Shop/Main/main.vue'

const routes = [
	{
		path: '/',
		name: 'home',
		component: Home
	},
	{
		path: '/tasks',
		name: 'tasks',
		component: Tasks
	},
	{
		path: '/friends',
		name: 'friends',
		component: Friends
	},
	{
		path: '/shop',
		name: 'shop',
		component: Shop
	},
	{
		path: '/:catchAll(.*)',
		redirect: '/',
	},
]

const router = createRouter({
	history: createMemoryHistory(),
	routes,
	mode: 'history'
})

export default router
