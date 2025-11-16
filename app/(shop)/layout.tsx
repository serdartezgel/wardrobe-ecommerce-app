import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/navigation/Navbar";

const ShopLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen w-full flex-col overflow-y-auto">
      <Navbar />

      <main className="container mx-auto flex-1">{children}</main>

      <Footer />
    </div>
  );
};
export default ShopLayout;
