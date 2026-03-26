import appConfig from "@/appConfig";
import ProductCard from "./Cards/ProductCard";
import DataIteration from "./DataIteration";
import ViewMoreTitle from "./ViewMoreTitle";

export default function SectionStyleThree({
  className,
  sectionTitle,
  seeMoreUrl,
  products = [],
}) {
  const rs = products.map((item) => {
    return {
      id: item.id,
      title: item.name,
      slug: item.slug,
      image: appConfig.BASE_URL + item.thumb_image,
      price: item.price,
      offer_price: item.offer_price,
      campaingn_product: null,
      vendor_id: Number(item.vendor_id),
      review: parseInt(item.averageRating),
      variants: item.active_variants,
    };
  });
  return (
    <div className={`section-style-one ${className || ""}`}>
      <ViewMoreTitle categoryTitle={sectionTitle} seeMoreUrl={seeMoreUrl}>
        <div className="products-section w-full">
          <div className="grid xl:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 xl:gap-[30px] gap-5">
            <DataIteration datas={rs} startLength={0} endLength={rs.length}>
              {({ datas }) => (
                <div data-aos="fade-up" key={datas.id} className="item">
                  <ProductCard datas={datas} />
                </div>
              )}
            </DataIteration>
          </div>
        </div>
      </ViewMoreTitle>
    </div>
  );
}
