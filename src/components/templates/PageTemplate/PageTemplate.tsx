import { forwardRef, type ComponentProps, type ReactNode } from "react";
import { Footer } from "@/components/organisms/Footer/Footer";
import { Header } from "@/components/organisms/Header/Header";

export type PageTemplateProps = Omit<ComponentProps<"div">, "ref"> & {
  children: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
};

const PageTemplate = forwardRef<HTMLDivElement, PageTemplateProps>(
  function PageTemplate({
    children,
    className,
    showHeader = true,
    showFooter = true,
    ...props
  }, ref) {
    const classes = ["flex min-h-screen flex-col bg-zinc-50 h-full", className]
      .filter(Boolean)
      .join(" ");

    const mainClasses = [
      "flex-1 h-full",
      showHeader || showFooter ? "px-6 py-8" : "p-0",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div {...props} ref={ref} className={classes}>
        {showHeader ? <Header /> : null}
        <main className={mainClasses}>{children}</main>
        {showFooter ? <Footer /> : null}
      </div>
    );
  },
);

export { PageTemplate };
export default PageTemplate;
