const { performance } = require("node:perf_hooks");

function averageMilliseconds(setup, operation, { warmups = 1, rounds = 3 } = {}) {
    for (let index = 0; index < warmups; index += 1) {
        operation(setup());
    }

    let total = 0;
    for (let index = 0; index < rounds; index += 1) {
        const input = setup();
        const startedAt = performance.now();
        operation(input);
        total += performance.now() - startedAt;
    }
    return total / rounds;
}

function printTable(title, headers, rows) {
    console.log(`\n${title}`);
    const allRows = [headers, ...rows].map((row) => row.map(String));
    const widths = headers.map((_, column) => Math.max(...allRows.map((row) => row[column].length)));
    for (const [index, row] of allRows.entries()) {
        console.log(row.map((cell, column) => cell.padEnd(widths[column])).join(" | "));
        if (index === 0) console.log(widths.map((width) => "-".repeat(width)).join("-+-"));
    }
}

function seededValues(length) {
    let state = 0x6d2b79f5;
    return Array.from({ length }, () => {
        state = (state + 0x6d2b79f5) | 0;
        let value = state;
        value = Math.imul(value ^ (value >>> 15), value | 1);
        value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
        return ((value ^ (value >>> 14)) >>> 0) % (length * 2);
    });
}

function selectionSort(items, compare) {
    const sorted = items.slice();
    for (let index = 0; index < sorted.length - 1; index += 1) {
        let smallest = index;
        for (let candidate = index + 1; candidate < sorted.length; candidate += 1) {
            if (compare(sorted[candidate], sorted[smallest]) < 0) smallest = candidate;
        }
        if (smallest !== index) [sorted[index], sorted[smallest]] = [sorted[smallest], sorted[index]];
    }
    return sorted;
}

async function main() {
    const { Queue } = await import("../src/dsa/Queue.js");
    const { mergeSort } = await import("../src/dsa/sort.js");
    const rounds = 3;
    const warmups = 1;
    console.log(`Node ${process.version}; warm-up ${warmups} รอบ; เฉลี่ย ${rounds} รอบ; เวลาต่อแถวเป็น ms`);

    const queueRows = [];
    for (const length of [1000, 10000, 100000]) {
        const shifted = averageMilliseconds(
            () => Array.from({ length }, (_, index) => index),
            (items) => {
                let checksum = 0;
                while (items.length) checksum += items.shift();
                return checksum;
            },
            { warmups, rounds }
        );
        const dequeued = averageMilliseconds(
            () => {
                const queue = new Queue();
                for (let value = 0; value < length; value += 1) queue.enqueue(value);
                return queue;
            },
            (queue) => {
                let checksum = 0;
                while (!queue.isEmpty()) checksum += queue.dequeue();
                return checksum;
            },
            { warmups, rounds }
        );
        queueRows.push([length, shifted.toFixed(3), dequeued.toFixed(3), (shifted / dequeued).toFixed(2)]);
    }
    printTable("Queue removal: Array.shift() vs custom Queue.dequeue()", ["n", "Array.shift() ms", "Queue.dequeue() ms", "shift / Queue"], queueRows);

    const sortRows = [];
    const numericCompare = (first, second) => first - second;
    for (const length of [100, 1000, 5000]) {
        const values = seededValues(length);
        const selection = averageMilliseconds(
            () => values.slice(),
            (input) => selectionSort(input, numericCompare),
            { warmups, rounds }
        );
        const merged = averageMilliseconds(
            () => values.slice(),
            (input) => mergeSort(input, numericCompare),
            { warmups, rounds }
        );
        const native = averageMilliseconds(
            () => values.slice(),
            (input) => input.sort(numericCompare),
            { warmups, rounds }
        );
        sortRows.push([length, selection.toFixed(3), merged.toFixed(3), native.toFixed(3)]);
    }
    printTable("Sorting: selection sort vs merge sort vs Array.prototype.sort()", ["n", "Selection sort ms", "mergeSort ms", "Array.sort() ms"], sortRows);

    const favoriteRows = [];
    for (const length of [1000, 10000, 100000]) {
        const values = Array.from({ length }, (_, id) => id);
        const set = new Set(values);
        const target = length - 1;
        const lookups = Math.max(100, Math.floor(1_000_000 / length));
        const linear = averageMilliseconds(
            () => values,
            (items) => {
                let matches = 0;
                for (let index = 0; index < lookups; index += 1) {
                    if (items.some((id) => id === target)) matches += 1;
                }
                return matches;
            },
            { warmups, rounds }
        );
        const hashed = averageMilliseconds(
            () => set,
            (ids) => {
                let matches = 0;
                for (let index = 0; index < lookups; index += 1) {
                    if (ids.has(target)) matches += 1;
                }
                return matches;
            },
            { warmups, rounds }
        );
        favoriteRows.push([length, lookups, linear.toFixed(3), hashed.toFixed(3), (linear / hashed).toFixed(2)]);
    }
    printTable("Favorite membership (last item hit): Array.some() vs Set.has()", ["favorites n", "lookups/round", "Array.some() ms", "Set.has() ms", "some / Set"], favoriteRows);
}

main().catch((error) => {
    console.error("DSA benchmark failed:", error);
    process.exitCode = 1;
});
