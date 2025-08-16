import Link from "next/link";

const NAV = [
  { href: "/new", label: "Новинки" },
  { href: "/catalog/clothes", label: "Одежда" },
  { href: "/catalog/accessories", label: "Аксессуары" },
  { href: "/info", label: "Информация" },
  { href: "/about", label: "О бренде" },
];

export default function Nav() {
  return (
    <nav className="hidden gap-6 md:flex">
      {NAV.map((item) => (
        <Link key={item.href} href={item.href} className="hover:opacity-70">
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
