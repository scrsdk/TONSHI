<script setup>
import { useStore } from 'vuex'
import {
	computed,
	onBeforeMount,
	onUnmounted,
	provide,
	reactive,
	ref,
	watch,
} from 'vue'
import Layout from './layout.vue'
import Loading from './frames/Loading/Main/main.vue'
import OverError from './components/OverError/over-error.vue'
import Notification from '~/components/Notification/notification.vue'
import Sprite from '~/components/sprite.vue'
import Modal from '~/modal/Main/main.vue'
import Window from '~/window/Main/main.vue'
import {
	useWebApp,
	useWebAppBackButton,
	useWebAppTheme,
	useWebAppViewport,
} from 'vue-tg'
import LandscapeError from '~/components/LandscapeError/landscape-error.vue'
import { useRoute, useRouter } from 'vue-router'
import DonationHelper from './components/DonationHelper/donation-helper.vue'
import QRCodeVue3 from 'qrcode-vue3'
import detectMobilePhone from './functions/detectMobilePhone.js'
import GlobalLoading from './components/GlobalLoading/global-loading.vue'

/* Images */
import BagMoneyIcon from '~/assets/images/bag-money-icon.svg'
import CartIcon from '~/assets/images/cart-icon.svg'
import CrownIcon from '~/assets/images/crown-icon.svg'
import DailyRewardsIcon from '~/assets/images/daily-rewards-icon.svg'
import ErrorQuestion from '~/assets/images/error-question.svg'
import FlyingMoney from '~/assets/images/flying-money.svg'
import FriendsIcon from '~/assets/images/friends-icon.svg'
import MessagingIcon from '~/assets/images/messaging-icon.svg'
import StatueIcon from '~/assets/images/statue-icon.svg'
import SuccessIcon from '~/assets/images/success-icon.svg'
import TasksIcon from '~/assets/images/tasks-icon.svg'
import WalletIcon from '~/assets/images/wallet-icon.svg'
import AvatarChipStars from '~/assets/images/avatar-chip-stars.png'
import NoImage from '~/assets/images/no-image.png'
import BitgetWallet from '~/assets/images/wallets/bitget-wallet.png'
import BybitWallet from '~/assets/images/wallets/bybit.png'
import DeWallet from '~/assets/images/wallets/dewallet.png'
import HotWallet from '~/assets/images/wallets/hot.png'
import MyTonWallet from '~/assets/images/wallets/mytonwallet.png'
import OkxWallet from '~/assets/images/wallets/okx.png'
import OkxTrWallet from '~/assets/images/wallets/okx-tr.png'
import OpenmaskWallet from '~/assets/images/wallets/openmask.png'
import SafepalWallet from '~/assets/images/wallets/safepal.png'
import TelegramWallet from '~/assets/images/wallets/telegram-wallet.png'
import TonHubWallet from '~/assets/images/wallets/tonhub.png'
import TonkeeperWallet from '~/assets/images/wallets/tonkeeper.png'
import BinanceWallet from '~/assets/images/wallets/binance.png'
import TonWallet from '~/assets/images/wallets/tonwallet.png'
import XTonWallet from '~/assets/images/wallets/xtonwallet.png'
import GateWallet from '~/assets/images/wallets/gatewallet.png'
import DoubleErrorWarning from '~/assets/images/double-error-warning.png'
import CloseIcon from '~/assets/images/close-icon.png'
import MegafonIcon from '~/assets/images/megafon-icon.png'
import LeaguesBronzeIcon from '~/assets/images/leagues/bronze.png'
import LeaguesCopperIcon from '~/assets/images/leagues/copper.png'
import LeaguesGoldIcon from '~/assets/images/leagues/gold.png'
import LeaguesMasterIcon from '~/assets/images/leagues/master.png'
import LeaguesPlatinumIcon from '~/assets/images/leagues/platinum.png'
import LeaguesSilverIcon from '~/assets/images/leagues/silver.png'
import HalloweenCheckinBackground from './assets/images/halloween/checkin-background.jpg'
import HalloweenScaryIcon from './assets/images/halloween/scary.png'
import CleverIcon from '~/assets/images/clever-icon.svg'

const listOfAppImages = [
	{ tag: 'avatar-chip-stars', component: AvatarChipStars },
	{ tag: 'no-image', component: NoImage },
	{ tag: 'double-error-warning', component: DoubleErrorWarning },
	{ tag: 'close', component: CloseIcon },
	{ tag: 'megafon', component: MegafonIcon },
	{
		tag: 'halloween-checkin-background',
		component: HalloweenCheckinBackground,
	},
	{ tag: 'halloween-scary-icon', component: HalloweenScaryIcon },
	/* SVG */
	{ tag: 'bag-money-icon', component: BagMoneyIcon },
	{ tag: 'cart-icon', component: CartIcon },
	{ tag: 'crown-icon', component: CrownIcon },
	{ tag: 'daily-rewards-icon', component: DailyRewardsIcon },
	{ tag: 'error-question', component: ErrorQuestion },
	{ tag: 'flying-money', component: FlyingMoney },
	{ tag: 'friends-icon', component: FriendsIcon },
	{ tag: 'messaging-icon', component: MessagingIcon },
	{ tag: 'statue-icon', component: StatueIcon },
	{ tag: 'success-icon', component: SuccessIcon },
	{ tag: 'tasks-icon', component: TasksIcon },
	{ tag: 'wallet-icon', component: WalletIcon },
	{ tag: 'clever-icon', component: CleverIcon },
	/* Leagues */
	{ tag: 'bronze-league', component: LeaguesBronzeIcon },
	{ tag: 'copper-league', component: LeaguesCopperIcon },
	{ tag: 'gold-league', component: LeaguesGoldIcon },
	{ tag: 'master-league', component: LeaguesMasterIcon },
	{ tag: 'platinum-league', component: LeaguesPlatinumIcon },
	{ tag: 'silver-league', component: LeaguesSilverIcon },
	/* Wallets */
	{ tag: 'bitget-wallet', component: BitgetWallet },
	{ tag: 'bybit', component: BybitWallet },
	{ tag: 'dewallet', component: DeWallet },
	{ tag: 'hot', component: HotWallet },
	{ tag: 'mytonwallet', component: MyTonWallet },
	{ tag: 'okx', component: OkxWallet },
	{ tag: 'okx-tr', component: OkxTrWallet },
	{ tag: 'openmask', component: OpenmaskWallet },
	{ tag: 'safepal', component: SafepalWallet },
	{ tag: 'telegram-wallet', component: TelegramWallet },
	{ tag: 'tonhub', component: TonHubWallet },
	{ tag: 'tonkeeper', component: TonkeeperWallet },
	{ tag: 'tonwallet', component: TonWallet },
	{ tag: 'xtonwallet', component: XTonWallet },
	{ tag: 'binance', component: BinanceWallet },
	{ tag: 'gatewallet', component: GateWallet },
]

const route = useRoute()
const router = useRouter()

const webApp = useWebApp()
const webAppTheme = useWebAppTheme()
const webAppBackButton = useWebAppBackButton()
const webAppViewport = useWebAppViewport()

const store = useStore()

const isOKDevice = ref(
	['web', 'weba', 'tdesktop', 'android_x', 'ios', 'android'].indexOf(
		webApp.platform
	) !== -1 || detectMobilePhone()
)
const errorAvailable = computed(() => store.state.error.status)
const status = computed(() => store.state.preloader.status)
const notifications = computed(() => store.state.notifications)
const modal = computed(() => store.state.modal)
const windowContent = computed(() => store.state.window)
const preloaderStatus = computed(() => store.state.preloader.status)
const donationHelper = computed(() => store.state.donation_helper)
const globalLoading = computed(() => store.state.global_loading)

watch(
	() => ({
		preloaderStatus: preloaderStatus.value,
		errorAvailable: errorAvailable.value,
		isOKDevice: isOKDevice.value,
		currentPath: route.path,
		modalActive: modal.value.active,
		windowActive: windowContent.value.active,
		donationHelperActive: donationHelper.value.active,
		globalLoadingActive: globalLoading.value.active,
	}),
	newObj => {
		/* Header color */
		if (
			newObj.donationHelperActive ||
			newObj.globalLoadingActive ||
			newObj.modalActive
		) {
			webAppTheme.setHeaderColor('#010101')
			// Telegram.WebApp.setBottomBarColor("#010101");
		} else {
			webAppTheme.setHeaderColor('#0B0B0E')
			// Telegram.WebApp.setBottomBarColor("#0B0B0E");
		}
		/* Back button */
		if (
			!newObj.globalLoadingActive &&
			!newObj.errorAvailable &&
			newObj.isOKDevice &&
			(newObj.modalActive || newObj.windowActive || newObj.currentPath !== '/')
		) {
			webAppBackButton.showBackButton()
		} else webAppBackButton.hideBackButton()
	}
)

webAppBackButton.onBackButtonClicked(async () => {
	if (modal.value.active) {
		await store.dispatch('modal/setModalCloseAnimation', true)
		setTimeout(async () => {
			await store.dispatch('modal/setModalCloseAnimation', false)
			await store.dispatch('modal/setModalActive')
		}, 200)
	} else if (windowContent.value.active) {
		await store.dispatch('window/setWindowActive')
	} else if (route.path !== '/') return router.back()
})

const appImages = reactive(
	listOfAppImages.map(image => ({
		tag: image.tag,
		component: image.component,
		loaded: false,
		cdn: false,
	}))
)

const isRefPortrait = ref(null)

provide('app-images', appImages)

const offsetMainBottom = computed(() => {
	if (webApp.platform === 'ios') return '34px'
	return '15px'
})
const offsetModalBottom = computed(() => {
	if (webApp.platform === 'ios') return '34px'
	return '20px'
})
const offsetMoreBottom = computed(() => {
	if (webApp.platform === 'ios') return '34px'
	return '25px'
})

const telegramWebAppLink = computed(
	() =>
		import.meta.env.VITE_TELEGRAM_BOT +
		'/' +
		import.meta.env.VITE_TELEGRAM_WEBAPP_URI
)

onBeforeMount(() => {
	webAppViewport.expand()
	webAppViewport.disableVerticalSwipes()
})
</script>

<template>
	<div
		:class="{
			[$style['main-container']]: true,
			[$style['main-is-landscape']]: !isRefPortrait?.isPortrait,
			[$style['main-is-full-width']]: !isOKDevice || !isRefPortrait?.isPortrait,
		}"
		:style="{
			'--main-offset-bottom': offsetMainBottom,
			'--modal-offset-bottom': offsetModalBottom,
			'--more-offset-bottom': offsetMoreBottom,
		}"
	>
		<div v-if="!isOKDevice" :class="{ [$style['not-mobile-device']]: true }">
			<div :class="{ [$style['qrcode']]: true }">
				<QRCodeVue3
					:width="280"
					:height="280"
					:qrOptions="{
						typeNumber: 0,
						mode: 'Byte',
						errorCorrectionLevel: 'H',
					}"
					:dotsOptions="{
						type: 'square',
					}"
					:cornersSquareOptions="{
						type: 'square',
					}"
					:value="telegramWebAppLink"
				/>
			</div>
			<span :class="{ [$style['text']]: true }"
				>Login is not allowed from your device</span
			>
			<span :class="{ [$style['platform']]: true }">{{ webApp.platform }}</span>
		</div>
		<template v-else>
			<Sprite />
			<template v-if="!errorAvailable">
				<GlobalLoading v-if="globalLoading.active" />
				<DonationHelper v-if="donationHelper.active" />
				<Layout v-if="!status" />
				<Loading v-else-if="status" />
			</template>
			<OverError v-if="errorAvailable" />
			<div :class="{ [$style['game-notification']]: true }">
				<Notification
					v-for="item of notifications.popup"
					:key="item.id"
					:id="item.id"
					:type="item.type"
					:title="item.title"
					:message="item.message"
					:timeout="item.timeout"
				/>
			</div>
			<Modal />
			<Window />
			<LandscapeError ref="isRefPortrait" />
		</template>
	</div>
</template>

<style module>
:root {
	--main-offset-bottom: 0px;
	--more-offset-bottom: 0px;
	--modal-offset-bottom: 0px;
}
.main-container {
	width: 100%;
	height: 100%;
	overflow: hidden;
	z-index: 0;
	background-color: #0b0b0e;
	margin: 0 auto;
	position: relative;
}
.main-container.main-is-landscape {
	pointer-events: none;
}
.main-container .not-mobile-device {
	display: flex;
	align-items: center;
	height: 100%;
	width: calc(100% - 60px);
	padding: 30px;
	justify-content: center;
	flex-direction: column;
	margin: 0 auto;
}
.main-container .not-mobile-device .qrcode {
	border-radius: 14px;
	width: 260px;
	height: 260px;
	background-color: #fff;
	padding: 6px;
	margin-bottom: 25px;
}
.main-container .not-mobile-device .qrcode img {
	width: 100%;
	height: 100%;
}
.main-container .not-mobile-device .text {
	font-weight: 600;
	font-size: 28px;
	text-align: center;
	color: #fff;
}
.main-container .not-mobile-device .platform {
	font-weight: 600;
	font-size: 22px;
	text-align: center;
	padding-top: 10px;
	color: #d2d2d2;
}
.main-container.main-is-full-width {
	max-width: 100%;
}
.main-container:not(.main-is-full-width) {
	max-width: var(--max-width-main);
}
.game-notification {
	width: calc(100% - 20px);
	position: absolute;
	left: 10px;
	top: 10px;
	display: flex;
	flex-direction: column;
	justify-content: center;
	row-gap: 6px;
	z-index: 999;
	max-width: var(--max-width-main);
	transition: top 200ms ease-in-out;
}
</style>
