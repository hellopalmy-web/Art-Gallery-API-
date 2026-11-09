export class Stack {
    #items;
    #head = 0;
    #count = 0;
    #limit;

    // O(n) to restore the initial values.
    constructor(initialValues = [], limit = Infinity) {
        if (!Array.isArray(initialValues)) {
            throw new TypeError("Stack initial values must be an array");
        }
        if (limit !== Infinity && (!Number.isSafeInteger(limit) || limit < 0)) {
            throw new RangeError("Stack limit must be a non-negative safe integer or Infinity");
        }

        this.#limit = limit;
        const capacity = Math.max(1, Number.isFinite(limit) ? limit : initialValues.length);
        this.#items = new Array(capacity);
        for (const value of initialValues.slice(0, limit).reverse()) {
            this.push(value);
        }
    }

    // O(1) when bounded; amortized O(1) when an unbounded stack grows.
    push(value) {
        if (this.#limit === 0) return this.#count;

        if (this.#count === this.#items.length && this.#limit === Infinity) {
            const expanded = new Array(this.#items.length * 2);
            for (let index = 0; index < this.#count; index += 1) {
                expanded[index] = this.#items[(this.#head + index) % this.#items.length];
            }
            this.#items = expanded;
            this.#head = 0;
        }

        if (this.#count === this.#limit) {
            this.#items[this.#head] = value;
            this.#head = (this.#head + 1) % this.#items.length;
            return this.#count;
        }

        const top = (this.#head + this.#count) % this.#items.length;
        this.#items[top] = value;
        this.#count += 1;
        return this.#count;
    }

    // O(1).
    pop() {
        if (this.#count === 0) return null;

        const top = (this.#head + this.#count - 1) % this.#items.length;
        const value = this.#items[top];
        this.#items[top] = undefined;
        this.#count -= 1;
        if (this.#count === 0) this.#head = 0;
        return value;
    }

    // O(1).
    peek() {
        if (this.#count === 0) return null;
        return this.#items[(this.#head + this.#count - 1) % this.#items.length];
    }

    // O(1).
    isEmpty() {
        return this.#count === 0;
    }

    // O(1).
    size() {
        return this.#count;
    }

    // O(capacity).
    clear() {
        this.#items.fill(undefined);
        this.#head = 0;
        this.#count = 0;
    }

    // O(n); returns newest item first for Recently Viewed.
    toArray() {
        const values = new Array(this.#count);
        for (let index = 0; index < this.#count; index += 1) {
            values[index] = this.#items[
                (this.#head + this.#count - 1 - index + this.#items.length) % this.#items.length
            ];
        }
        return values;
    }
}

export default Stack;
