import GlobalSearchInput from "@/components/common/GlobalSearchInput";

const ShopPage = () => {
  return (
    <div className="my-4 flex flex-col items-center gap-6 px-4">
      <div className="w-full md:hidden">
        <GlobalSearchInput />
      </div>
      <div className="">Latest Deal Banner</div>
      <div className="">Trending Products Banner</div>
      <div className="">4 Popular Categories</div>
      <div className="">Featured Collections Carousel</div>
      <div className="">Featured Products Carousel</div>
      <div className="">Video Section</div>
      <div className="">New Arrivals</div>
      <div className="">Become Member</div>
    </div>
  );
};

export default ShopPage;
