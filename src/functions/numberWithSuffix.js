export default (num) => {
    let suffix = '';
    if (num % 10 === 1 && num % 100 !== 11) {
        suffix = 'st';
    } else if (num % 10 === 2 && num % 100 !== 12) {
        suffix = 'nd';
    } else if (num % 10 === 3 && num % 100 !== 13) {
        suffix = 'rd';
    } else {
        suffix = 'th';
    }
    return num + suffix;
}