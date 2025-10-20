export type NavItem = {
  label: string;
  href: string;
  children?: NavItem[];
};

export const navLinks: NavItem[] = [
  {
    label: "Deals",
    href: "/deals",
    children: [
      { label: "New Arrivals", href: "/deals/new-arrivals" },
      { label: "Clearance", href: "/deals/clearance" },
      { label: "Flash Sale", href: "/deals/flash-sale" },
      { label: "Buy 1 Get 1", href: "/deals/bogo" },
      { label: "Limited Time Offers", href: "/deals/limited-time" },
      { label: "Under $25", href: "/deals/under-25" },
      { label: "Seasonal Discounts", href: "/deals/seasonal" },
      { label: "Trending Now", href: "/deals/trending" },
      { label: "Last Chance", href: "/deals/last-chance" },
      { label: "Exclusive Online Deals", href: "/deals/online-exclusive" },
    ],
  },
  {
    label: "Men",
    href: "/men",
    children: [
      {
        label: "Tops",
        href: "/men/tops",
        children: [
          { label: "T-Shirts", href: "/men/tops/t-shirts" },
          { label: "Shirts", href: "/men/tops/shirts" },
          { label: "Polos", href: "/men/tops/polos" },
          { label: "Hoodies & Sweatshirts", href: "/men/tops/hoodies" },
          { label: "Jackets & Coats", href: "/men/tops/jackets" },
        ],
      },
      {
        label: "Bottoms",
        href: "/men/bottoms",
        children: [
          { label: "Jeans", href: "/men/bottoms/jeans" },
          { label: "Trousers & Chinos", href: "/men/bottoms/trousers" },
          { label: "Shorts", href: "/men/bottoms/shorts" },
          { label: "Joggers", href: "/men/bottoms/joggers" },
        ],
      },
      {
        label: "Footwear",
        href: "/men/footwear",
        children: [
          { label: "Sneakers", href: "/men/footwear/sneakers" },
          { label: "Loafers", href: "/men/footwear/loafers" },
          { label: "Boots", href: "/men/footwear/boots" },
          { label: "Sandals", href: "/men/footwear/sandals" },
        ],
      },
      {
        label: "Accessories",
        href: "/men/accessories",
        children: [
          { label: "Belts", href: "/men/accessories/belts" },
          { label: "Watches", href: "/men/accessories/watches" },
          { label: "Caps & Hats", href: "/men/accessories/hats" },
          { label: "Wallets", href: "/men/accessories/wallets" },
          { label: "Bags & Backpacks", href: "/men/accessories/bags" },
        ],
      },
      {
        label: "Activewear",
        href: "/men/activewear",
        children: [
          { label: "Gym Tops", href: "/men/activewear/tops" },
          { label: "Training Shorts", href: "/men/activewear/shorts" },
          { label: "Performance Jackets", href: "/men/activewear/jackets" },
        ],
      },
      {
        label: "Innerwear",
        href: "/men/innerwear",
        children: [
          { label: "Boxers", href: "/men/innerwear/boxers" },
          { label: "Briefs", href: "/men/innerwear/briefs" },
          { label: "Socks", href: "/men/innerwear/socks" },
        ],
      },
    ],
  },
  {
    label: "Women",
    href: "/women",
    children: [
      {
        label: "Tops",
        href: "/women/tops",
        children: [
          { label: "T-Shirts", href: "/women/tops/t-shirts" },
          { label: "Blouses & Shirts", href: "/women/tops/blouses" },
          { label: "Crop Tops", href: "/women/tops/crop-tops" },
          { label: "Knitwear & Sweaters", href: "/women/tops/knitwear" },
          { label: "Jackets & Blazers", href: "/women/tops/jackets" },
        ],
      },
      {
        label: "Dresses",
        href: "/women/dresses",
        children: [
          { label: "Casual Dresses", href: "/women/dresses/casual" },
          { label: "Party Dresses", href: "/women/dresses/party" },
          { label: "Maxi & Midi Dresses", href: "/women/dresses/maxi-midi" },
          { label: "Workwear Dresses", href: "/women/dresses/workwear" },
        ],
      },
      {
        label: "Bottoms",
        href: "/women/bottoms",
        children: [
          { label: "Jeans", href: "/women/bottoms/jeans" },
          { label: "Skirts", href: "/women/bottoms/skirts" },
          { label: "Pants & Trousers", href: "/women/bottoms/pants" },
          { label: "Leggings & Shorts", href: "/women/bottoms/leggings" },
        ],
      },
      {
        label: "Footwear",
        href: "/women/footwear",
        children: [
          { label: "Heels", href: "/women/footwear/heels" },
          { label: "Flats", href: "/women/footwear/flats" },
          { label: "Boots", href: "/women/footwear/boots" },
          { label: "Sneakers", href: "/women/footwear/sneakers" },
        ],
      },
      {
        label: "Accessories",
        href: "/women/accessories",
        children: [
          { label: "Handbags", href: "/women/accessories/handbags" },
          { label: "Jewelry", href: "/women/accessories/jewelry" },
          { label: "Scarves", href: "/women/accessories/scarves" },
          { label: "Sunglasses", href: "/women/accessories/sunglasses" },
          { label: "Hats", href: "/women/accessories/hats" },
        ],
      },
      {
        label: "Activewear",
        href: "/women/activewear",
        children: [
          { label: "Sports Bras", href: "/women/activewear/sports-bras" },
          { label: "Leggings", href: "/women/activewear/leggings" },
          { label: "Gym Tops", href: "/women/activewear/tops" },
        ],
      },
      {
        label: "Innerwear",
        href: "/women/innerwear",
        children: [
          { label: "Lingerie", href: "/women/innerwear/lingerie" },
          { label: "Sleepwear", href: "/women/innerwear/sleepwear" },
          { label: "Socks", href: "/women/innerwear/socks" },
        ],
      },
    ],
  },
  {
    label: "Kids",
    href: "/kids",
    children: [
      {
        label: "Boys",
        href: "/kids/boys",
        children: [
          { label: "Tops", href: "/kids/boys/tops" },
          { label: "Bottoms", href: "/kids/boys/bottoms" },
          { label: "Jackets", href: "/kids/boys/jackets" },
          { label: "Shoes", href: "/kids/boys/shoes" },
        ],
      },
      {
        label: "Girls",
        href: "/kids/girls",
        children: [
          { label: "Dresses", href: "/kids/girls/dresses" },
          { label: "Tops", href: "/kids/girls/tops" },
          { label: "Skirts & Pants", href: "/kids/girls/skirts-pants" },
          { label: "Shoes", href: "/kids/girls/shoes" },
        ],
      },
      {
        label: "Baby (0–2 Years)",
        href: "/kids/baby",
        children: [
          { label: "Bodysuits", href: "/kids/baby/bodysuits" },
          { label: "Rompers", href: "/kids/baby/rompers" },
          { label: "Sets", href: "/kids/baby/sets" },
          { label: "Booties", href: "/kids/baby/booties" },
        ],
      },
      {
        label: "Accessories",
        href: "/kids/accessories",
        children: [
          { label: "Hats", href: "/kids/accessories/hats" },
          { label: "Socks", href: "/kids/accessories/socks" },
          { label: "Backpacks", href: "/kids/accessories/backpacks" },
        ],
      },
      {
        label: "Schoolwear",
        href: "/kids/schoolwear",
        children: [
          { label: "Uniforms", href: "/kids/schoolwear/uniforms" },
          { label: "Sportswear", href: "/kids/schoolwear/sportswear" },
        ],
      },
    ],
  },
];
