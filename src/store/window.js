export default {
    namespaced: true,
    state: {
        active: false,
        selected: null,
        props: {}
    },
    mutations: {
        SET_WINDOW_PROPS: (state, payload) => {
            state.props = payload
        },
        SET_WINDOW_ACTIVE: (state, payload) => {
            if (!payload) {
                state.active = false
                state.selected = null
                state.props = {}
            } else {
                state.selected = payload
                state.active = true
            }
        },
    },
    actions: {
        setWindowProps: ({ commit }, payload) => {
            commit('SET_WINDOW_PROPS', payload)
        },
        setWindowActive: ({ commit }, payload) => {
            commit('SET_WINDOW_ACTIVE', payload)
        },
    },
}
