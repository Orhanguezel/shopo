import Link from "next/link";
import ServeLangItem from "../ServeLangItem";
import ShopNowIco from "../icons/ShopNowIco";

export default function CategoryCard({
  background,
  title,
  categories = [],
  changeIdHandler,
  productsInCategoryIds,
  moreUrl = "#",
}) {
  // Filter categories to only include those with products
  const filterCategory =
    categories && categories.length > 0
      ? categories.filter((category) => {
          const id = parseInt(category.category_id);
          return productsInCategoryIds.includes(id);
        })
      : [];

  return (
    <div
      className="category-card-wrappwer w-full h-full p-[30px]"
      style={{
        background: `url(${
          background || `/assets/images/section-category-1.jpg`
        }) no-repeat`,
        backgroundSize: "cover",
      }}
    >
      <div>
        {/* Card Title */}
        <h1 className="text-base font-600 tracking-wide mb-2">{title}</h1>
        {/* List of filtered categories */}
        <div className="brands-list mb-[7px]">
          <ul>
            {filterCategory.map((category) => (
              <li key={category.id}>
                <span
                  onClick={() => changeIdHandler(category.category_id)}
                  className="text-sm text-qgray hober:text-qBlack border-b border-transparent hover:border-qblack hover:text-qblack capitalize cursor-pointer"
                >
                  {/* Display category name */}
                  {category && category.category.name}
                </span>
              </li>
            ))}
          </ul>
        </div>
        {/* 'Shop Now' link with icon */}
        <Link href={`${moreUrl}`}>
          <div className="flex space-x-2 rtl:space-x-reverse items-center cursor-pointer">
            <span className="text-qblack font-600 text-sm">
              {ServeLangItem()?.Shop_Now}
            </span>
            <span>
              <ShopNowIco />
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}
