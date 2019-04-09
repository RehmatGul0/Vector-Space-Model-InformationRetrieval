module.exports = {
    mergeSort: function (array) {
        function mergeSort(array) {
            if (array.length === 1) {
                return array;
            }
            let middle = Math.floor(array.length / 2) // get the middle item of the array rounded down
            let left = array.slice(0, middle) // items on the left side
            let right = array.slice(middle) // items on the right side

            return merge(
                mergeSort(left),
                mergeSort(right)
            )
        }
        return mergeSort(array);
    }
}
// compare the arrays item by item and return the concatenated result
function merge(left, right) {
    let result = []
    let indexLeft = 0
    let indexRight = 0

    while (indexLeft < left.length && indexRight < right.length) {
        if (left[indexLeft].rank > right[indexRight].rank) {
            result.push(left[indexLeft])
            indexLeft++
        } else {
            result.push(right[indexRight])
            indexRight++
        }
    }
    return result.concat(left.slice(indexLeft)).concat(right.slice(indexRight))
}