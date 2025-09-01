<script setup>
import { useStore } from 'vuex'
import { onMounted, onUnmounted, ref, computed, watch } from 'vue'
import MainStyle from './main.module.css'
import Icon from '../../../../components/Icon/icon.vue'
import CircleLoader from '../../../../components/CircleLoader/circle-loader.vue'
import { useLazyQuery, useMutation } from '@vue/apollo-composable'
import {
	CHECK_TRANSACTION,
	GET_MODAL_DONATION_INFO,
	GET_MY_BALANCE,
	PREPARE_DONATION_STARS,
	START_TRANSACTION,
} from '../../../../queries.js'
import showPopup from '../../../../functions/showPopup.js'
import AnimationsStyle from './animations.module.css'
import Animation from '../../../../components/animation.vue'
import toggleModal from '../../../../functions/toggleModal.js'
import { useWebApp, useWebAppNavigation } from 'vue-tg'
import { beginCell } from 'ton-core'
import { useTonConnectModal, useTonConnectUI, useTonWallet } from 'ton-ui-vue'
import getUserOS from '../../../../functions/getUserOS.js'

const props = defineProps({
	donation_id: Number,
})

const {
	mutate: mutateGetModalDonationInfo,
	onError: onErrorGetModalDonationInfo,
} = useMutation(
	GET_MODAL_DONATION_INFO,
	() => {
		return {
			variables: {
				donation_id: props.donation_id,
			},
		}
	},
	{
		fetchPolicy: 'no-cache',
	}
)

const {
	mutate: mutatePrepareDonationStars,
	onError: onErrorPrepareDonationStars,
} = useMutation(
	PREPARE_DONATION_STARS,
	() => {
		return {
			variables: {
				donation_id: props.donation_id,
			},
		}
	},
	{
		fetchPolicy: 'no-cache',
	}
)

const { load: getMyBalance, onError: onErrorGetMyBalance } = useLazyQuery(
	GET_MY_BALANCE,
	{},
	{
		fetchPolicy: 'no-cache',
	}
)

const { mutate: mutateStartTransaction, onError: onErrorStartTransaction } =
	useMutation(
		START_TRANSACTION,
		() => {
			return {}
		},
		{
			fetchPolicy: 'no-cache',
		}
	)

const { mutate: mutateCheckTransaction, onError: onErrorCheckTransaction } =
	useMutation(
		CHECK_TRANSACTION,
		{},
		{
			fetchPolicy: 'no-cache',
		}
	)

const store = useStore()
const webApp = useWebApp()
const webAppNavigation = useWebAppNavigation()
const wallet = useTonWallet()
const { tonConnectUI } = useTonConnectUI()
const { open: openTonModal } = useTonConnectModal()

const loading = ref(true)
const buttonLoading = ref(false)
const vTono = ref(0)
const price = ref({
	usdt: null,
	stars: null,
})
const isNewConnection = ref(false)

const isTONAvailable = computed(() => {
	const os = getUserOS()
	if (os === 'windows' || ['web', 'weba'].includes(webApp.platform)) return true
	return false
})

const loadInfo = async () => {
	if (buttonLoading.value) return
	const req = await mutateGetModalDonationInfo()
	if (!req || !req.data || !req.data.getModalDonationInfo) return
	const data = req.data.getModalDonationInfo
	price.value = data.price
	vTono.value = data.vTono
	loading.value = false
}

const loadBalance = async () => {
	const req = await getMyBalance()
	if (!req || !req.balance) return
	const data = req.balance
	await store.dispatch('user/setUserBalance_Tonomo', data.tonomo)
	await store.dispatch('user/setUserBalance_vTono', data.vTono)
}

const buy = async type => {
	switch (type) {
		case 'stars':
			buttonLoading.value = true
			showPopup('info', 'Creating an invoice for payment...', null, 1500)
			const req = await mutatePrepareDonationStars()
			if (!req || !req.data || !req.data.prepareDonationStars) return
			const data = req.data.prepareDonationStars
			if (data.invoice_link) {
				webAppNavigation.openInvoice(data.invoice_link, async status => {
					toggleModal()
					if (status === 'paid') {
						await loadBalance()
						return await showPopup(
							'success',
							'Successful donation. You got +' + vTono.value + ' $vTono!'
						)
					} else if (status === 'failed')
						await showPopup(
							'error',
							'There was an error paying your bill through Stars.'
						)
				})
			} else buttonLoading.value = false
			break
		case 'ton':
			if (!wallet.value) {
				isNewConnection.value = true
				return openTonModal()
			}
			return makeTonPayment()
		default:
			return showPopup('error', 'Invalid payment method sent')
	}
}

const makeTonPayment = async () => {
	buttonLoading.value = true
	showPopup('info', 'Creating a transaction...', null, 1500)
	const tonReq = await mutateStartTransaction({
		type: 'donations-default',
		item_id: props.donation_id,
	})
	if (!tonReq || !tonReq.data || !tonReq.data.startTransaction) return
	const tonData = tonReq.data.startTransaction
	const bodyPayload = beginCell()
		.storeUint(0, 32)
		.storeStringTail(tonData.transaction_unique)
		.endCell()
	try {
		const tonTransaction = await tonConnectUI.value.sendTransaction(
			{
				validUntil: Math.floor(Date.now() / 1000) + 600,
				messages: [
					{
						amount: String(tonData.amount),
						address: tonData.contract_address,
						payload: bodyPayload.toBoc().toString('base64'),
						lock: true,
					},
				],
			},
			{
				modals: ['before'],
			}
		)
		if (tonTransaction.boc) {
			await store.dispatch(
				'setGlobalLoading',
				'Your transaction is being searched..'
			)
			const checkInterval = setInterval(async () => {
				const checkReq = await mutateCheckTransaction({
					transaction_unique: tonData.transaction_unique,
				})
				if (!checkReq || !checkReq.data || !checkReq.data.checkTransaction)
					return
				const checkData = checkReq.data.checkTransaction
				if (checkData.status) {
					clearInterval(checkInterval)
					await store.dispatch('setGlobalLoading', null)
					toggleModal()
					await store.dispatch(
						'user/setUserBalance_Tonomo',
						checkData.balance.tonomo
					)
					await store.dispatch(
						'user/setUserBalance_vTono',
						checkData.balance.vTono
					)
					return showPopup('success', 'You got +' + vTono.value + ' $vTono!')
				}
			}, 3000)
		}
	} catch (err) {
		toggleModal()
		buttonLoading.value = false
		if (err.message.includes('Shop declined the request')) {
			showPopup(
				'error',
				'An error occurred while creating a transaction. Try relinking your wallet.'
			)
		}
	}
}

watch(
	() => ({ wallet: wallet.value, isNewConnection: isNewConnection.value }),
	async newValues => {
		if (newValues.wallet && newValues.isNewConnection) {
			isNewConnection.value = false
			return await makeTonPayment()
		}
	}
)

onErrorGetModalDonationInfo(() => {
	toggleModal()
	return showPopup('error', 'An error occurred while loading donation info')
})

onErrorPrepareDonationStars(() => {
	toggleModal()
	return showPopup('error', 'An error occurred while creating invoice link')
})

onErrorStartTransaction(error => {
	toggleModal()
	return showPopup('error', error.message)
})

onErrorCheckTransaction(error => {
	toggleModal()
	return showPopup('error', error.message)
})

onErrorGetMyBalance(() =>
	showPopup('error', 'There was an error loading your current balance')
)

onUnmounted(() => store.dispatch('modal/setModalRender', false))
onMounted(async () => {
	await store.dispatch('modal/setModalRender', true)
	return await loadInfo()
})
</script>

<template>
	<div :class="{ [MainStyle['donation-content']]: true }">
		<div :class="{ [MainStyle['loading-content']]: true }" v-if="loading">
			<CircleLoader :border-size="5" :width="36" :height="36" />
		</div>
		<template v-else>
			<Animation
				name="info"
				:animation-style="AnimationsStyle"
				:start-animation="true"
			>
				<div :class="{ [MainStyle['info']]: true }">
					<div :class="{ [MainStyle['title']]: true }">
						<span :class="{ [MainStyle['text']]: true }">You will receive</span>
						<div :class="{ [MainStyle['amount-vtono']]: true }">
							<Icon
								:class="{ [MainStyle['styled-icon']]: true }"
								name="tonomo-gray-coin-text-white"
							/>
							<span :class="{ [MainStyle['value']]: true }"
								>{{ vTono }} $vTono</span
							>
						</div>
					</div>
					<div :class="{ [MainStyle['amount-usdt']]: true }">
						<span :class="{ [MainStyle['value']]: true }"
							>= ${{ price.usdt }}</span
						>
					</div>
				</div>
			</Animation>
			<div :class="{ [MainStyle['list-of-buttons']]: true }">
				<Animation
					name="button-stars"
					:animation-style="AnimationsStyle"
					:start-animation="true"
				>
					<button
						type="button"
						:class="{
							[MainStyle['button']]: true,
							[MainStyle['button-green']]: true,
						}"
						:disabled="buttonLoading"
						@click="() => buy('stars')"
					>
						<Icon
							:class="{ [MainStyle['styled-icon']]: true }"
							name="telegram-stars"
						/>
						<span :class="{ [MainStyle['name']]: true }"
							>{{ price.stars }} Star</span
						>
					</button>
				</Animation>
				<Animation
					name="button-ton"
					:animation-style="AnimationsStyle"
					:start-animation="true"
					v-if="isTONAvailable"
				>
					<button
						type="button"
						:class="{
							[MainStyle['button']]: true,
							[MainStyle['button-primary']]: true,
						}"
						:disabled="buttonLoading"
						@click="() => buy('ton')"
					>
						<Icon
							:class="{ [MainStyle['styled-icon']]: true }"
							name="crypto-ton"
						/>
						<span :class="{ [MainStyle['name']]: true }">
							{{ price.ton }} TON
						</span>
					</button>
				</Animation>
			</div>
		</template>
	</div>
</template>
