export class Queue {
    #items = [];
    #head = 0;
    #count = 0;

    // O(1) amortized.
    enqueue(value) {
        this.#items.push(value);
        this.#count += 1;
        return this.#count;
    }

    // O(1) amortized; occasional compaction is amortized across prior dequeues.
    dequeue() {
        if (this.#count === 0) return null;

        const value = this.#items[this.#head];
        this.#items[this.#head] = undefined;
        this.#head += 1;
        this.#count -= 1;

        if (this.#count === 0) {
            this.#items = [];
            this.#head = 0;
        } else if (this.#head >= 64 && this.#head * 2 >= this.#items.length) {
            this.#items = this.#items.slice(this.#head);
            this.#head = 0;
        }
        return value;
    }

    // O(1).
    peek() {
        return this.#count === 0 ? null : this.#items[this.#head];
    }

    // O(1).
    isEmpty() {
        return this.#count === 0;
    }

    // O(1).
    size() {
        return this.#count;
    }

    // O(1).
    clear() {
        this.#items = [];
        this.#head = 0;
        this.#count = 0;
    }

    // O(n); returns active items in FIFO order.
    toArray() {
        return this.#items.slice(this.#head);
    }

    // O(n); removes matching entries and keeps the remaining FIFO order.
    removeWhere(predicate) {
        if (typeof predicate !== "function") {
            throw new TypeError("Queue.removeWhere requires a predicate function");
        }

        const remaining = [];
        for (let index = this.#head; index < this.#items.length; index += 1) {
            const value = this.#items[index];
            if (!predicate(value)) remaining.push(value);
        }
        const removed = this.#count - remaining.length;
        this.#items = remaining;
        this.#head = 0;
        this.#count = remaining.length;
        return removed;
    }
}

export default Queue;
