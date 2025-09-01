import { createApp, provide, h, watch, ref } from 'vue'
import './assets/css/default.css'
import store from './store/index.js'
import router from './routes.js'
import {
	ApolloClient,
	createHttpLink,
	InMemoryCache,
} from '@apollo/client/core'
import { DefaultApolloClient } from '@vue/apollo-composable'
import { VueTelegramPlugin } from 'vue-tg'
import App from './app.vue'
import { setContext } from '@apollo/client/link/context/index.js'
import {
	createTonConnectUIProvider,
	TonConnectUIContext,
	TonConnectUIOptionsContext,
} from 'ton-ui-vue'
import { io } from 'socket.io-client'

const { tonConnectUI, setOptions } = createTonConnectUIProvider({
	manifestUrl: import.meta.env.VITE_TONCONNECT_MANIFEST,
})

const socketEnabled = ref(false),
	socketMultiDevices = ref(false)

const graphqlRequestHeader = state => {
	return setContext((_, { headers }) => {
		const token = state.user.auth_token
		return {
			headers: {
				...headers,
				token: token,
			},
		}
	})
}

const graphqlLink = graphqlRequestHeader(store.state).concat(
	createHttpLink({
		uri: import.meta.env.VITE_GRAPHQL_URL,
	})
)

const defaultGraphQLClient = new ApolloClient({
	link: graphqlLink,
	cache: new InMemoryCache(),
})

const app = createApp({
	setup() {
		provide(DefaultApolloClient, defaultGraphQLClient)
	},
	render: () => h(App),
})

app.use(store)
app.use(router)
app.use(VueTelegramPlugin)

const socketClient = io(import.meta.env.VITE_SOCKET, {
	autoConnect: false,
	transports: ['websocket'],
	reconnection: true,
	reconnectionDelay: 3 * 1000,
	auth: {
		token: null,
	},
})

socketClient.on('connect_error', async () => {
	await store.dispatch('error/setError', {
		status: true,
		title: 'Error',
		description: 'There was an error on our server side',
		button: { type: 'success', name: 'Refresh app', function: 'reloadApp' },
	})
})
socketClient.on('daily_raffle_winner', async data => {
	await store.dispatch('setDailyRaffleLastWinner', data)
})
socketClient.on('game_error', async data => {
	if (!data.status) {
		data.status = true
	}
	await store.dispatch('error/setError', data)
	socketEnabled.value = false
	if (data.is_multi && !socketMultiDevices.value) {
		socketMultiDevices.value = true
	}
})
socketClient.on('notification', async data => {
	await store.dispatch('notifications/addItemNotificationsPopup', data)
})

watch(
	() => store.state.user.auth_token,
	token => {
		if (!socketEnabled.value) {
			if (socketClient.connected) {
				socketClient.disconnect()
			}
			socketClient.auth = { token: token }
			socketClient.connect()
			socketEnabled.value = true
		}
	}
)

app.provide(TonConnectUIContext, tonConnectUI)
app.provide(TonConnectUIOptionsContext, setOptions)
app.provide('socket-client', socketClient)

app.mount('#app')
