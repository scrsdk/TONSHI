import { gql } from '@apollo/client/core'

export const GET_MY_BALANCE = gql`
	query getBalance {
		balance {
			tonomo
			vTono
		}
	}
`

export const GET_HOME_INFO = gql`
	query getHome {
		home {
			league {
				type
				place
			}
		}
	}
`

export const INIT_GAME = gql`
	mutation ($initData: String, $friendCode: String) {
		initGame(initData: $initData, friendCode: $friendCode) {
			user {
				id
				telegram_id
				avatar
				name
				is_premium
				balance {
					tonomo
					vTono
				}
				friend_code
				token
				available_daily_rewards {
					status
					amount {
						tonomo
						vTono
					}
				}
				current_farm {
					unique
					wait_time
					earn_per_second
					end_timer
				}
				league {
					type
					place
				}
			}
			cdn_images
			leagues {
				type
				progress {
					from
					to
				}
			}
			language
		}
	}
`

export const CLAIM_DAILY_REWARDS = gql`
	mutation ($is_vtono_boost: Boolean, $ton_transaction_unique_boost: String) {
		claimDailyRewards(
			is_vtono_boost: $is_vtono_boost
			ton_transaction_unique_boost: $ton_transaction_unique_boost
		) {
			amount {
				tonomo
				vTono
			}
			current_balance {
				tonomo
				vTono
			}
		}
	}
`

export const GET_FRIENDS = gql`
	mutation getFriends {
		loadFriends {
			leagues {
				type
				amount {
					default
					premium
				}
			}
		}
	}
`

export const GET_TASKS = gql`
	mutation getTasks {
		loadTasks {
			tasks {
				type
				list {
					id
					type
					title
					reward
					info {
						type
						link
						amount
						count
						sum
						end_timer
					}
					claim
					period
				}
			}
			checkin {
				id
				type
				title
				reward
				info {
					type
					platform
					app_name
					end_timer
					holiday
				}
				claim
				period
			}
			categories {
				type
				name
			}
			ads {
				watched
				reward
				ad_reward
				seconds
				need_for_daily_raffle
				limit
			}
			nickname {
				seconds
				claimed
				reward
			}
			daily_raffle {
				last_winner {
					name
					avatar
					amount
				}
				limit
				max_win
				is_participating
				need_for_daily_raffle
				total_users
				timer
			}
		}
	}
`

export const CLAIM_TASKS = gql`
	mutation ($tasks_id: ID) {
		claimTasks(tasks_id: $tasks_id) {
			amount
			tonomo
		}
	}
`

export const GET_FRIENDS_USERS = gql`
	mutation ($page: Int) {
		friendsUsers(page: $page) {
			items {
				avatar
				name
				amount
				league {
					type
					place
				}
			}
			page {
				current
				total
			}
			count
		}
	}
`

export const GET_TOP_INVITERS = gql`
	query getTopInviters {
		topInviters {
			user {
				id
				name
				avatar
			}
			friends
			earned
		}
	}
`

export const GET_TOP_PLAYERS = gql`
	mutation ($league: String, $startup: Boolean) {
		loadTopPlayers(league: $league, startup: $startup) {
			list {
				user {
					id
					name
					avatar
				}
				balance
			}
			my_league {
				type
				place
			}
			my_place {
				table
				place
			}
			balance {
				tonomo
				vTono
			}
		}
	}
`

export const START_TRANSACTION = gql`
	mutation ($type: String, $item_id: Int) {
		startTransaction(type: $type, item_id: $item_id) {
			transaction_unique
			contract_address
			amount
		}
	}
`

export const CHECK_TRANSACTION = gql`
	mutation ($transaction_unique: String) {
		checkTransaction(transaction_unique: $transaction_unique) {
			status
			balance {
				tonomo
				vTono
			}
		}
	}
`

export const GET_DONATIONS = gql`
	query getDonations {
		donations {
			id
			image
			vTono
			price
			end_timer
			limit
			type
		}
	}
`

export const GET_MODAL_DONATION_INFO = gql`
	mutation ($donation_id: Int) {
		getModalDonationInfo(donation_id: $donation_id) {
			vTono
			price {
				stars
				usdt
				ton
			}
		}
	}
`

export const PREPARE_DONATION_STARS = gql`
	mutation ($donation_id: Int) {
		prepareDonationStars(donation_id: $donation_id) {
			invoice_link
		}
	}
`

export const START_FARMING = gql`
	mutation ($is_vtono_boost: Boolean, $ton_transaction_unique_boost: String) {
		startFarming(
			is_vtono_boost: $is_vtono_boost
			ton_transaction_unique_boost: $ton_transaction_unique_boost
		) {
			unique
			wait_time
			end_timer
			earn_per_second
			current_balance {
				tonomo
				vTono
			}
		}
	}
`

export const CLAIM_FARMING = gql`
	mutation ($is_vtono_boost: Boolean, $ton_transaction_unique_boost: String) {
		claimFarming(
			is_vtono_boost: $is_vtono_boost
			ton_transaction_unique_boost: $ton_transaction_unique_boost
		) {
			total_amount
			league {
				place
				type
			}
			current_balance {
				tonomo
				vTono
			}
		}
	}
`

export const GET_CURRENT_FARM = gql`
	query getCurrentFarm {
		currentFarm {
			unique
			wait_time
			earn_per_second
			end_timer
		}
	}
`

export const CLAIM_FREE_DONATION = gql`
	mutation ($donation_id: Int) {
		claimFreeDonation(donation_id: $donation_id) {
			balance {
				tonomo
				vTono
			}
		}
	}
`

export const GET_DAILY_RAFFLE = gql`
	mutation loadDailyRaffle {
		loadDailyRaffle {
			list {
				id
				name
				avatar
			}
			my_place {
				place
				table
			}
			timer
			max_win
			users
		}
	}
`

export const CLAIM_NICKNAME_BONUS = gql`
	mutation claimNicknameBonus($initData: String) {
		claimNicknameBonus(initData: $initData) {
			seconds
			balance {
				tonomo
				vTono
			}
		}
	}
`
