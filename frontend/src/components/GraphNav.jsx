import { Link, useLocation } from "react-router-dom";
import { siteGraph, getPageLabel } from "../Graph.js";

// หา node ของหน้าปัจจุบันจาก URL (ถ้าไม่รู้จัก path ให้ถือว่าอยู่ Home)
function useCurrentPage() {
    const { pathname } = useLocation();
    return siteGraph.findByPath(pathname) ?? siteGraph.getNode("home");
}

// เมนู nav: สร้างจาก edge ของหน้าปัจจุบันใน Graph ไม่ได้เขียนรายการเมนูตายตัว
// props: language ("en" | "th"), className (ปรับให้ตรงกับ CSS เดิมของเมนู)
export default function GraphNav({ language = "en", className = "main-nav" }) {
    const current = useCurrentPage();
    const menu = siteGraph.getNeighbors(current.id);

    return (
        <nav className={className} aria-label="Main navigation">
            {menu.map((page) => (
                <Link key={page.id} to={page.path}>
                    {getPageLabel(page, language)}
                </Link>
            ))}
        </nav>
    );
}

// Breadcrumb: ใช้ BFS (shortestPath) หาเส้นทางจาก Home ไปหน้าปัจจุบัน
export function Breadcrumb({ language = "en", className = "breadcrumb" }) {
    const current = useCurrentPage();
    if (current.id === "home") return null;

    const trail = siteGraph.shortestPath("home", current.id) ?? [current.id];

    return (
        <nav className={className} aria-label="Breadcrumb">
            <ol>
                {trail.map((id, index) => {
                    const page = siteGraph.getNode(id);
                    const isLast = index === trail.length - 1;
                    return (
                        <li key={id} aria-current={isLast ? "page" : undefined}>
                            {isLast ? (
                                getPageLabel(page, language)
                            ) : (
                                <Link to={page.path}>{getPageLabel(page, language)}</Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
