import { forwardRef, type ComponentProps } from "react";

export type FooterProps = Omit<ComponentProps<"footer">, "ref">;

const Footer = forwardRef<HTMLElement, FooterProps>(function Footer(
  { className, ...props },
  ref,
) {
  const classes = [
    "flex items-center justify-between border-t border-zinc-200 bg-white px-6 py-4",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const linkClasses =
    "text-black underline underline-offset-2 hover:text-zinc-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";

  return (
    <footer {...props} ref={ref} className={classes}>
      <p className="text-sm text-zinc-600">© 2026 Pokedachi</p>
      <nav aria-label="Footer" className="flex gap-4">
        <a href="#" className={linkClasses}>
          Terms
        </a>
        <a href="#" className={linkClasses}>
          Privacy
        </a>
      </nav>
    </footer>
  );
});

export { Footer };
export default Footer;
