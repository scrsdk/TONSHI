export default (friend_code, for_share = true) => {
    const url = import.meta.env.VITE_TELEGRAM_BOT + "/" + import.meta.env.VITE_TELEGRAM_WEBAPP_URI + "?startapp=" + friend_code,
        text = "🌟Совершите путешествие с Tonomo! 🌟\nПрисоединяйтесь к нам в захватывающем приключении, когда мы объединяемся с Binance, Bybit, OKX, Bitget и будем готовы к мощному AirDrop! Давайте вместе заработаем $Tonomo, используйте мою ссылку-приглашение, чтобы погрузиться!";
    return for_share ? ('https://t.me/share/url?url=' + encodeURIComponent(url) + '&text=' + encodeURIComponent(text)) : url;
}