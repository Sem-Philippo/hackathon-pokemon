import { forwardRef, type ComponentProps } from "react";

export type HeaderProps = Omit<ComponentProps<"header">, "ref">;

const Header = forwardRef<HTMLElement, HeaderProps>(function Header(
  { className, ...props },
  ref,
) {
  const classes = ["border-b border-zinc-200 bg-white px-6 py-4", className]
    .filter(Boolean)
    .join(" ");

  return (
    <header {...props} ref={ref} className={classes}>
      <h1 className="text-xl font-semibold text-black">Pokedachi</h1>
    </header>
  );
});

export { Header };
export default Header;
