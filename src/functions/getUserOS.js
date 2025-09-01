export default () => {
	const userAgent = navigator.userAgent || navigator.vendor || window.opera

	if (/windows/i.test(userAgent)) return 'windows'
	if (/macintosh|mac os x/i.test(userAgent)) return 'macos'
	if (/linux/i.test(userAgent)) return 'linux'
	if (/android/i.test(userAgent)) return 'android'
	if (/iphone|ipad|ipod/i.test(userAgent)) return 'ios'

	return 'unknown'
}
