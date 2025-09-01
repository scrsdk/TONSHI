import BitgetWallet from "~/assets/images/wallets/bitget-wallet.png";
import BybitWallet from "~/assets/images/wallets/bybit.png";
import DeWallet from "~/assets/images/wallets/dewallet.png";
import HotWallet from "~/assets/images/wallets/hot.png";
import MyTonWallet from "~/assets/images/wallets/mytonwallet.png";
import OkxWallet from "~/assets/images/wallets/okx.png";
import OkxTrWallet from "~/assets/images/wallets/okx-tr.png";
import OpenmaskWallet from "~/assets/images/wallets/openmask.png";
import SafepalWallet from "~/assets/images/wallets/safepal.png";
import TelegramWallet from "~/assets/images/wallets/telegram-wallet.png";
import TonHubWallet from "~/assets/images/wallets/tonhub.png";
import TonkeeperWallet from "~/assets/images/wallets/tonkeeper.png";
import TonWallet from "~/assets/images/wallets/tonwallet.png";
import XTonWallet from "~/assets/images/wallets/xtonwallet.png";
import BinanceWallet from "~/assets/images/wallets/binance.png";
import GateWallet from "~/assets/images/wallets/gatewallet.png";

export default (appName) => {
    let walletInfo = {
        icon: TelegramWallet,
        name: "Wallet"
    };
    switch (appName) {
        case "GateWallet":
            walletInfo.icon = GateWallet;
            walletInfo.name = "GateWallet";
            break;
        case "binanceWeb3TonWallet":
            walletInfo.icon = BinanceWallet;
            walletInfo.name = "Binance";
            break;
        case "bybitTonWallet":
            walletInfo.icon = BybitWallet;
            walletInfo.name = "Bybit";
            break;
        case "hot":
            walletInfo.icon = HotWallet;
            walletInfo.name = "Hot";
            break;
        case "okxTonWalletTr":
            walletInfo.icon = OkxTrWallet;
            walletInfo.name = "OKX Tr";
            break;
        case "okxTonWallet":
            walletInfo.icon = OkxWallet;
            walletInfo.name = "OKX";
            break;
        case "safepalwallet":
            walletInfo.icon = SafepalWallet;
            walletInfo.name = "SafePal";
            break;
        case "bitgetTonWallet":
            walletInfo.icon = BitgetWallet;
            walletInfo.name = "Bitget";
            break;
        case "tonwallet":
            walletInfo.icon = TonWallet;
            walletInfo.name = "TonWallet";
            break;
        case "xtonwallet":
            walletInfo.icon = XTonWallet;
            walletInfo.name = "XTonWallet";
            break;
        case "dewallet":
            walletInfo.icon = DeWallet;
            walletInfo.name = "DeWallet";
            break;
        case "tonhub":
            walletInfo.icon = TonHubWallet;
            walletInfo.name = "TonHub";
            break;
        case "openmask":
            walletInfo.icon = OpenmaskWallet;
            walletInfo.name = "OpenMask";
            break;
        case "mytonwallet":
            walletInfo.icon = MyTonWallet;
            walletInfo.name = "MyTonWallet";
            break;
        case "tonkeeper":
            walletInfo.icon = TonkeeperWallet;
            walletInfo.name = "Tonkeeper";
            break;
        default:
            return walletInfo
    }
    return walletInfo;
}