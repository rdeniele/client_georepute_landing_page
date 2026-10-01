import Image from "next/image";
import Link from "next/link";
import logo from "@/public/brand/logo-g-mark.png";
import { footer as f } from "@/lib/content";

export function SiteFooter() {
  return (
    <footer className="foot">
      <div className="shell foot__row">
        <Link href="#top" className="foot__brand" aria-label={`${f.brand}, back to top`}>
          <Image src={logo} alt="" width={32} height={32} className="foot__logo" />
          <span className="foot__name">{f.brand}</span>
        </Link>
        <span className="foot__copy">&copy; {new Date().getFullYear()} {f.brand}</span>
      </div>
    </footer>
  );
}
