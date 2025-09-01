export default {
    namespaced: true,
    state: {
        id: null,
        telegram_id: null,
        avatar: null,
        name: null,
        balance: {
            tonomo: 0,
            vTono: 0
        },
        is_premium: false,
        friend_code: null,
        auth_token: null,
        available_daily_rewards: {
            status: false,
            amount: 0
        },
        league: {
            type: 'lazy',
            place: 0
        },
        current_farm: {
            unique: null,
            wait_time: 0,
            end_timer: 0,
            earn_per_second: 0
        }
    },
    mutations: {
        SET_USER(state, payload) {
            state.id = payload.id;
            state.telegram_id = payload.telegram_id;
            state.avatar = payload.avatar;
            state.name = payload.name;
            state.is_premium = payload.is_premium;
            if (payload.balance) {
                state.balance = payload.balance;
            }
            state.friend_code = payload.friend_code;
            state.auth_token = payload.token;
            if (payload.available_daily_rewards) {
                state.available_daily_rewards.status = payload.available_daily_rewards.status;
                if (payload.available_daily_rewards.amount) {
                    state.available_daily_rewards.amount = payload.available_daily_rewards.amount;
                }
            }
            if (payload.current_farm) {
                if (payload.current_farm.unique) {
                    state.current_farm.unique = payload.current_farm.unique;
                }
                if (payload.current_farm.wait_time) {
                    state.current_farm.wait_time = payload.current_farm.wait_time;
                }
                if (payload.current_farm.earn_per_second) {
                    state.current_farm.earn_per_second = payload.current_farm.earn_per_second;
                }
                if (payload.current_farm.end_timer) {
                    state.current_farm.end_timer = payload.current_farm.end_timer;
                }
            }
            if (payload.league) {
                state.league.type = payload.league.type;
                state.league.place = payload.league.place;
            }
        },
        SET_USER_BALANCE_TONOMO(state, payload) {
            state.balance.tonomo = payload
        },
        SET_USER_BALANCE_VTONO(state, payload) {
            state.balance.vTono = payload
        },
        SET_USER_AVAILABLE_DAILY_REWARDS(state, payload) {
            if (payload.status) {
                state.available_daily_rewards.status = payload.status
            }
            if (payload.amount) {
                state.available_daily_rewards.amount = payload.amount
            }
        },
        SET_USER_LEAGUE(state, payload) {
            if (payload.type) {
                state.league.type = payload.type
            }
            if (payload.place) {
                state.league.place = payload.place
            }
        },
        SET_USER_CURRENT_FARM(state, payload) {
            if (payload.unique) {
                state.current_farm.unique = payload.unique;
            }
            if (payload.wait_time) {
                state.current_farm.wait_time = payload.wait_time;
            }
            if (payload.earn_per_second) {
                state.current_farm.earn_per_second = payload.earn_per_second;
            }
            if (payload.end_timer) {
                state.current_farm.end_timer = payload.end_timer;
            }
        },
        CLEAR_USER_CURRENT_FARM(state) {
            state.current_farm = {
                unique: null,
                wait_time: 0,
                end_timer: 0,
                earn_per_second: 0
            }
        }
    },
    actions: {
        setUser({ commit }, payload) {
            commit('SET_USER', payload);
        },
        setUserBalance_Tonomo({ commit }, payload) {
            commit('SET_USER_BALANCE_TONOMO', payload);
        },
        setUserBalance_vTono({ commit }, payload) {
            commit('SET_USER_BALANCE_VTONO', payload);
        },
        setUserAvailableDailyRewards({ commit }, payload) {
            commit('SET_USER_AVAILABLE_DAILY_REWARDS', payload)
        },
        setUserLeague({ commit }, payload) {
            commit('SET_USER_LEAGUE', payload)
        },
        setUserCurrentFarm({ commit }, payload) {
            commit('SET_USER_CURRENT_FARM', payload)
        },
        clearUserCurrentFarm({ commit }) {
            commit('CLEAR_USER_CURRENT_FARM')
        }
    }
}
