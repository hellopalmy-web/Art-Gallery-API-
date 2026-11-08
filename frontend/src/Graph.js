// Graph.js
// โครงสร้างข้อมูล Graph (adjacency list) ที่เขียนเอง ไม่ใช้ไลบรารี
//   node = หน้าเว็บ (Home, Collection, Your Visit)
//   edge = เมนู/ลิงก์ที่พาจากหน้าหนึ่งไปอีกหน้าหนึ่ง (มีทิศทาง)

export class Graph {
    constructor() {
        // id -> ข้อมูลของหน้า { id, path, label, labelTh }
        this.nodes = new Map();
        // id -> [id ของหน้าที่ไปต่อได้]  (adjacency list)
        this.adjacency = new Map();
    }

    // เพิ่ม node: O(1)
    addNode(id, data = {}) {
        if (!this.nodes.has(id)) {
            this.nodes.set(id, { id, ...data });
            this.adjacency.set(id, []);
        }
        return this; // คืน this เพื่อเขียนต่อกันเป็นสายได้
    }

    // เพิ่ม edge from -> to: O(deg(from)) เพราะเช็คไม่ให้ซ้ำ
    addEdge(from, to) {
        if (!this.nodes.has(from) || !this.nodes.has(to)) {
            throw new Error(`Graph.addEdge: ไม่พบ node "${from}" หรือ "${to}"`);
        }
        const list = this.adjacency.get(from);
        if (!list.includes(to)) list.push(to);
        return this;
    }

    hasNode(id) {
        return this.nodes.has(id);
    }

    getNode(id) {
        return this.nodes.get(id) ?? null;
    }

    getNodes() {
        return [...this.nodes.values()];
    }

    // หน้าที่ไปต่อได้จากหน้านี้ (ใช้สร้างเมนู): O(deg(id))
    getNeighbors(id) {
        const ids = this.adjacency.get(id) ?? [];
        return ids.map((neighborId) => this.nodes.get(neighborId));
    }

    // หา node จาก path ของ URL เช่น "/collection" -> node collection
    findByPath(path) {
        const clean = path.length > 1 ? path.replace(/\/+$/, "") : path;
        for (const node of this.nodes.values()) {
            if (node.path === clean) return node;
        }
        return null;
    }

    // เส้นทางสั้นสุดจาก start ไป goal ด้วย BFS: O(V + E)
    // คืนค่าเป็น array ของ id เช่น ["home", "collection"] หรือ null ถ้าไปไม่ถึง
    shortestPath(start, goal) {
        if (!this.nodes.has(start) || !this.nodes.has(goal)) return null;
        if (start === goal) return [start];

        const parent = new Map([[start, null]]); // ใช้เป็น visited ด้วย
        const queue = [start];
        let head = 0; // ใช้ตัวชี้แทน shift() เพื่อให้ dequeue เป็น O(1)

        while (head < queue.length) {
            const current = queue[head++];
            for (const next of this.adjacency.get(current)) {
                if (parent.has(next)) continue;
                parent.set(next, current);
                if (next === goal) {
                    const path = [];
                    for (let id = goal; id !== null; id = parent.get(id)) path.push(id);
                    return path.reverse();
                }
                queue.push(next);
            }
        }
        return null;
    }
}

// ---------- กราฟของเว็บ Art Gallery ----------
export const siteGraph = new Graph()
    .addNode("home", { path: "/", label: "Home", labelTh: "หน้าแรก" })
    .addNode("collection", { path: "/collection", label: "Collection", labelTh: "คอลเลกชัน" })
    .addNode("yourVisit", { path: "/your-visit", label: "Your Visit", labelTh: "การเข้าชม" })
    // edge = เมนูที่แต่ละหน้าพาไปได้
    .addEdge("home", "collection")
    .addEdge("home", "yourVisit")
    .addEdge("collection", "home")
    .addEdge("collection", "yourVisit")
    .addEdge("yourVisit", "home")
    .addEdge("yourVisit", "collection");

// ชื่อหน้าตามภาษา
export function getPageLabel(node, language = "en") {
    return language === "th" ? node.labelTh : node.label;
}

// path ของหน้าจาก id (ใช้ใน <Route path=...> เพื่อไม่ต้องเขียน path ซ้ำ)
export function pagePath(id) {
    return siteGraph.getNode(id).path;
}

export default siteGraph;
