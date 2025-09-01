import { createStore } from 'vuex'
import user from '~/store/user.js'
import modal from '~/store/modal.js'
import error from '~/store/error.js'
import preloader from '~/store/preloader.js'
import notifications from '~/store/notifications.js'
import windowContent from './window.js'

const store = createStore({
	state: {
		changed_router: false,
		friends_leagues_rewards: [],
		leagues: [],
		tasks_id_pending: null,
		donations_id_pending: null,
		donation_helper: {
			active: false,
			closeAnimation: false,
			title: null,
			callback: {
				name: null,
				props: {},
			},
			buttons: [],
		},
		global_loading: {
			active: false,
			message: null,
		},
		daily_raffle: {
			last_winner: null,
		},
	},
	modules: {
		user: user,
		modal: modal,
		error: error,
		preloader: preloader,
		notifications: notifications,
		window: windowContent,
	},
	mutations: {
		SET_CHANGED_ROUTER: (state, payload) => {
			state.changed_router = payload
		},
		SET_FRIENDS_LEAGUES_REWARDS: (state, payload) => {
			state.friends_leagues_rewards = payload
		},
		SET_LEAGUES: (state, payload) => {
			state.leagues = payload
		},
		SET_TASKS_ID_PENDING: (state, payload) => {
			state.tasks_id_pending = payload
		},
		SET_DONATIONS_ID_PENDING: (state, payload) => {
			state.donations_id_pending = payload
		},
		SET_DONATION_HELPER_ACTIVE: (state, payload) => {
			state.donation_helper.active = payload
		},
		SET_DONATION_HELPER_CLOSE_ANIMATION: (state, payload) => {
			state.donation_helper.closeAnimation = payload
		},
		SET_DONATION_HELPER_TITLE: (state, payload) => {
			state.donation_helper.title = payload
		},
		ADD_DONATION_HELPER_BUTTONS: (state, payload) => {
			state.donation_helper.buttons.push(payload)
		},
		CLEAR_DONATION_HELPER_BUTTONS: (state, payload) => {
			state.donation_helper.buttons = []
		},
		SET_DONATION_HELPER_CALLBACK: (state, payload) => {
			if (!payload) {
				state.donation_helper.callback = {
					name: null,
					props: {},
				}
			} else {
				if (payload.name) {
					state.donation_helper.callback.name = payload.name
				}
				if (payload.props) {
					state.donation_helper.callback.props = payload.props
				}
			}
		},
		SET_GLOBAL_LOADING: (state, payload) => {
			if (payload) {
				state.global_loading.active = true
				state.global_loading.message = payload
			} else if (!payload) {
				state.global_loading.active = false
				state.global_loading.message = null
			}
		},
		SET_DAILY_RAFFLE_LAST_WINNER: (state, payload) => {
			state.daily_raffle.last_winner = payload
		},
	},
	actions: {
		setChangedRouter: ({ commit }, payload) => {
			commit('SET_CHANGED_ROUTER', payload)
		},
		setFriendsLeaguesRewards: ({ commit }, payload) => {
			commit('SET_FRIENDS_LEAGUES_REWARDS', payload)
		},
		setListOfLeagues: ({ commit }, payload) => {
			commit('SET_LEAGUES', payload)
		},
		setTasksIdPending: ({ commit }, payload) => {
			commit('SET_TASKS_ID_PENDING', payload)
		},
		setDonationsIdPending: ({ commit }, payload) => {
			commit('SET_DONATIONS_ID_PENDING', payload)
		},
		setDonationHelperActive: ({ commit }, payload) => {
			commit('SET_DONATION_HELPER_ACTIVE', payload)
		},
		setDonationHelperTitle: ({ commit }, payload) => {
			commit('SET_DONATION_HELPER_TITLE', payload)
		},
		setDonationHelperCloseAnimation: ({ commit }, payload) => {
			commit('SET_DONATION_HELPER_CLOSE_ANIMATION', payload)
		},
		addDonationHelperButtons: ({ commit }, payload) => {
			commit('ADD_DONATION_HELPER_BUTTONS', payload)
		},
		clearDonationHelperButtons: ({ commit }, payload) => {
			commit('CLEAR_DONATION_HELPER_BUTTONS', payload)
		},
		setDonationHelperCallback: ({ commit }, payload) => {
			commit('SET_DONATION_HELPER_CALLBACK', payload)
		},
		setGlobalLoading: ({ commit }, payload) => {
			commit('SET_GLOBAL_LOADING', payload)
		},
		setDailyRaffleLastWinner: ({ commit }, payload) => {
			commit('SET_DAILY_RAFFLE_LAST_WINNER', payload)
		},
	},
})

export default store
