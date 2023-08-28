const ITEMS_PER_PAGE = 12;

const pageGenerator = function (query, currentCount, count) {
    const totalCount = (query.length === 0) ? count : currentCount;
    const pageCount = Math.ceil(totalCount / ITEMS_PER_PAGE);

    return Array.from({ length: pageCount }, (_, index) => ({ page: index + 1 }));
}


export { pageGenerator }
