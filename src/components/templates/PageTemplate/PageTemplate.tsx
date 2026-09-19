import { forwardRef, type ComponentProps, type ReactNode } from "react";
import { Footer } from "@/components/organisms/Footer/Footer";
import { Header } from "@/components/organisms/Header/Header";

export type PageTemplateProps = Omit<ComponentProps<"div">, "ref"> & {
  children: ReactNode;
};

const PageTemplate = forwardRef<HTMLDivElement, PageTemplateProps>(
  function PageTemplate({ children, className, ...props }, ref) {
    const classes = ["flex min-h-screen flex-col bg-zinc-50 h-full", className]
      .filter(Boolean)
      .join(" ");

    return (
      <div {...props} ref={ref} className={classes}>
        <Header />
        <main className="flex-1 px-6 py-8 h-full">{children}</main>
        <Footer />
      </div>
    );
  },
);

export { PageTemplate };
export default PageTemplate;
