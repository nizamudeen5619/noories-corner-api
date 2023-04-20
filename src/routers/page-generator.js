const pageGenerator = function (query, currentCOunt, count) {
    let pages = []
    if (query.length === 0) {
        count = Math.ceil(count / 10)
        for (let itr = 1; itr <= count; itr++) {
            pages.push({ page: itr })
        }
    }
    else {
        currentCOunt = Math.ceil(currentCOunt / 10)
        for (let itr = 1; itr <= currentCOunt; itr++) {
            pages.push({ page: itr })
        }
    }
    return pages
}

export { pageGenerator }
