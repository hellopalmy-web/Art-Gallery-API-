const assert = require("node:assert/strict");
const test = require("node:test");

test("Stack supports empty, LIFO, newest-first snapshots, and a fixed size limit", async () => {
    const { Stack } = await import("../src/dsa/Stack.js");
    const stack = new Stack([], 3);

    assert.equal(stack.isEmpty(), true);
    assert.equal(stack.peek(), null);
    assert.equal(stack.pop(), null);

    stack.push("oldest");
    stack.push("middle");
    stack.push("newest");
    assert.deepEqual(stack.toArray(), ["newest", "middle", "oldest"]);
    assert.equal(stack.push("latest"), 3);
    assert.deepEqual(stack.toArray(), ["latest", "newest", "middle"]);
    assert.equal(stack.peek(), "latest");
    assert.equal(stack.pop(), "latest");
    assert.equal(stack.size(), 2);
    assert.deepEqual(stack.toArray(), ["newest", "middle"]);
    stack.clear();
    assert.equal(stack.isEmpty(), true);
    assert.deepEqual(stack.toArray(), []);
});

test("Stack restores persisted newest-first arrays and grows when unbounded", async () => {
    const { Stack } = await import("../src/dsa/Stack.js");
    const restored = new Stack(["newest", "older", "oldest"], 40);
    assert.equal(restored.peek(), "newest");
    assert.equal(restored.pop(), "newest");

    const growing = new Stack();
    for (let value = 0; value < 100; value += 1) growing.push(value);
    assert.equal(growing.size(), 100);
    assert.equal(growing.peek(), 99);
    assert.equal(growing.toArray()[99], 0);
});

test("Queue preserves FIFO order, removes matching values, and handles empty operations", async () => {
    const { Queue } = await import("../src/dsa/Queue.js");
    const queue = new Queue();
    assert.equal(queue.isEmpty(), true);
    assert.equal(queue.peek(), null);
    assert.equal(queue.dequeue(), null);

    queue.enqueue({ id: 1 });
    queue.enqueue({ id: 2 });
    queue.enqueue({ id: 3 });
    assert.equal(queue.peek().id, 1);
    assert.equal(queue.removeWhere((item) => item.id === 2), 1);
    assert.deepEqual(queue.toArray().map((item) => item.id), [1, 3]);
    assert.equal(queue.dequeue().id, 1);
    assert.equal(queue.size(), 1);
    assert.equal(queue.dequeue().id, 3);
    assert.equal(queue.isEmpty(), true);
    queue.enqueue({ id: 4 });
    queue.enqueue({ id: 4 });
    assert.equal(queue.removeWhere((item) => item.id === 4), 2);
    assert.equal(queue.size(), 0);
    queue.enqueue({ id: 5 });
    queue.clear();
    assert.equal(queue.isEmpty(), true);
    assert.deepEqual(queue.toArray(), []);
    assert.throws(() => queue.removeWhere(null), TypeError);
});

test("Queue compacts its consumed prefix and keeps order after subsequent enqueues", async () => {
    const { Queue } = await import("../src/dsa/Queue.js");
    const queue = new Queue();
    for (let value = 0; value < 200; value += 1) queue.enqueue(value);
    for (let value = 0; value < 150; value += 1) assert.equal(queue.dequeue(), value);

    assert.equal(queue.size(), 50);
    assert.deepEqual(queue.toArray(), Array.from({ length: 50 }, (_, index) => index + 150));
    for (let value = 200; value < 210; value += 1) queue.enqueue(value);
    assert.deepEqual(queue.toArray(), Array.from({ length: 60 }, (_, index) => index + 150));
});

test("mergeSort handles empty/singleton inputs, duplicates, and stable ties", async () => {
    const { mergeSort } = await import("../src/dsa/sort.js");
    assert.deepEqual(mergeSort([], (a, b) => a - b), []);
    assert.deepEqual(mergeSort([1], (a, b) => a - b), [1]);

    const values = [
        { key: 2, order: "a" },
        { key: 1, order: "b" },
        { key: 2, order: "c" },
        { key: 1, order: "d" },
    ];
    const sorted = mergeSort(values, (first, second) => first.key - second.key);
    assert.deepEqual(sorted.map((item) => item.order), ["b", "d", "a", "c"]);
    assert.deepEqual(values.map((item) => item.order), ["a", "b", "c", "d"]);
});

test("legacy tie ranks preserve the former selection-sort order with duplicate and empty years", async () => {
    const { getLegacyTieRanks, mergeSort } = await import("../src/dsa/sort.js");
    const titleItems = [
        { id: "a", title: "Painting", year: 4 },
        { id: "b", title: "Painting", year: null },
        { id: "c", title: "Drawing", year: "" },
        { id: "d", title: "Painting", year: 0 },
    ];
    const yearItems = [
        { id: "a", title: "A", year: 4 },
        { id: "b", title: "B", year: null },
        { id: "c", title: "C", year: "" },
        { id: "d", title: "D", year: 0 },
        { id: "e", title: "E", year: 4 },
    ];
    const cases = [
        {
            items: titleItems,
            compare: (first, second) => String(first.title).localeCompare(String(second.title), undefined, { sensitivity: "base" }),
        },
        {
            items: titleItems,
            compare: (first, second) => -String(first.title).localeCompare(String(second.title), undefined, { sensitivity: "base" }),
        },
        {
            items: yearItems,
            compare: (first, second) => Number(first.year || 0) - Number(second.year || 0),
        },
        {
            items: yearItems,
            compare: (first, second) => Number(second.year || 0) - Number(first.year || 0),
        },
    ];

    for (const { items, compare } of cases) {
        const working = items.map((item) => ({ ...item }));
        for (let index = 0; index < working.length - 1; index += 1) {
            let smallest = index;
            for (let candidate = index + 1; candidate < working.length; candidate += 1) {
                if (compare(working[candidate], working[smallest]) < 0) smallest = candidate;
            }
            if (smallest !== index) [working[index], working[smallest]] = [working[smallest], working[index]];
        }

        const ranks = getLegacyTieRanks(items, compare);
        const actual = mergeSort(
            items.map((item, index) => ({ item, index })),
            (first, second) => compare(first.item, second.item)
                || ranks.get(first.index) - ranks.get(second.index)
        ).map(({ item }) => item.id);
        assert.deepEqual(actual, working.map((item) => item.id));
    }
});

test("Graph BFS uses the custom queue and returns the same shortest directed paths", async () => {
    const { Graph, siteGraph } = await import("../src/Graph.js");
    assert.deepEqual(siteGraph.shortestPath("home", "yourVisit"), ["home", "yourVisit"]);
    assert.deepEqual(siteGraph.shortestPath("collection", "yourVisit"), ["collection", "yourVisit"]);
    assert.deepEqual(siteGraph.shortestPath("home", "home"), ["home"]);
    assert.equal(siteGraph.shortestPath("missing", "home"), null);

    const graph = new Graph()
        .addNode("start")
        .addNode("near")
        .addNode("middle")
        .addNode("goal")
        .addEdge("start", "near")
        .addEdge("start", "middle")
        .addEdge("middle", "goal")
        .addEdge("near", "goal");
    assert.deepEqual(graph.shortestPath("start", "goal"), ["start", "near", "goal"]);
});
