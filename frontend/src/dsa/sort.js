// O(n log n) time and O(n) auxiliary space; equal items retain input order.
export function mergeSort(items, compare) {
    if (!Array.isArray(items)) {
        throw new TypeError("mergeSort input must be an array");
    }
    if (typeof compare !== "function") {
        throw new TypeError("mergeSort requires a comparator");
    }

    const length = items.length;
    if (length < 2) return items.slice();

    let source = items.slice();
    let target = new Array(length);

    for (let width = 1; width < length; width *= 2) {
        for (let start = 0; start < length; start += width * 2) {
            const middle = Math.min(start + width, length);
            const end = Math.min(start + width * 2, length);
            let left = start;
            let right = middle;
            let output = start;

            while (left < middle && right < end) {
                if (compare(source[left], source[right]) <= 0) {
                    target[output] = source[left];
                    left += 1;
                } else {
                    target[output] = source[right];
                    right += 1;
                }
                output += 1;
            }
            while (left < middle) target[output++] = source[left++];
            while (right < end) target[output++] = source[right++];
        }
        [source, target] = [target, source];
    }

    return source;
}

// O(n log n) time and O(n) space; ranks emulate the old selection-sort swaps.
export function getLegacyTieRanks(items, compare) {
    if (!Array.isArray(items)) {
        throw new TypeError("Tie-rank input must be an array");
    }
    if (typeof compare !== "function") {
        throw new TypeError("Tie-rank calculation requires a comparator");
    }

    const length = items.length;
    const ranks = new Map();
    if (length === 0) return ranks;

    const values = items.map((value, originalIndex) => ({ value, originalIndex }));
    let leafCount = 1;
    while (leafCount < length) leafCount *= 2;
    const tree = new Array(leafCount * 2).fill(-1);
    for (let index = 0; index < length; index += 1) {
        tree[leafCount + index] = index;
    }

    const betterIndex = (first, second) => {
        if (first === -1) return second;
        if (second === -1) return first;
        const order = compare(values[first].value, values[second].value);
        if (order < 0) return first;
        if (order > 0) return second;
        return Math.min(first, second);
    };

    for (let node = leafCount - 1; node > 0; node -= 1) {
        tree[node] = betterIndex(tree[node * 2], tree[node * 2 + 1]);
    }

    const update = (index) => {
        let node = leafCount + index;
        tree[node] = index;
        while (node > 1) {
            node = Math.floor(node / 2);
            tree[node] = betterIndex(tree[node * 2], tree[node * 2 + 1]);
        }
    };

    const queryMinimum = (start) => {
        let left = leafCount + start;
        let right = leafCount + length;
        let best = -1;
        while (left < right) {
            if (left % 2 === 1) best = betterIndex(best, tree[left++]);
            if (right % 2 === 1) best = betterIndex(best, tree[--right]);
            left = Math.floor(left / 2);
            right = Math.floor(right / 2);
        }
        return best;
    };

    for (let index = 0; index < length - 1; index += 1) {
        const minimumIndex = queryMinimum(index);
        if (minimumIndex !== index) {
            [values[index], values[minimumIndex]] = [values[minimumIndex], values[index]];
            update(index);
            update(minimumIndex);
        }
    }

    values.forEach((item, rank) => ranks.set(item.originalIndex, rank));
    return ranks;
}
