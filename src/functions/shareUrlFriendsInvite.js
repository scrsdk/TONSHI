export default (friend_code, for_share = true) => {
    const url = import.meta.env.VITE_TELEGRAM_BOT + "/" + import.meta.env.VITE_TELEGRAM_WEBAPP_URI + "?startapp=" + friend_code,
        text = "🌟Take a trip with Tonomo!🌟\nJoin us in an exciting adventure as we team up with Binance, Bybit, OKX, Bitget and ready for a powerful airdrop! Let’s earn $Tonomo together, use my invite link to dive into the fun!";
    return for_share ? ('https://t.me/share/url?url=' + encodeURIComponent(url) + '&text=' + encodeURIComponent(text)) : url;
}