export default (num) => {
    let suffix = '';
    if (num % 10 === 1 && num % 100 !== 11) {
        suffix = '';
    } else if (num % 10 === 2 && num % 100 !== 12) {
        suffix = '';
    } else if (num % 10 === 3 && num % 100 !== 13) {
        suffix = '';
    } else {
        suffix = '';
    }
    return num + suffix;
}