import React from "react";
import Image from "next/image";
import Link from "next/link";
import appConfig from "@/appConfig";

function CategorySection({ sectionTitle, categories }) {
  return (
    <div data-aos="fade-up" className="category-section-wrapper w-full">
      <div className="container-x mx-auto pb-[60px]">
        <div>
          <div className="w-full grid xl:grid-cols-8 md:grid-cols-4 grid-cols-2 gap-[30px]">
            {categories &&
              categories.length > 0 &&
              categories
                .slice(0, categories.length > 8 ? 8 : categories.length)
                .map((item, i) => (
                  <div
                    data-aos="fade-left"
                    data-aos-delay={i + "00"}
                    key={i}
                    className="item w-full cursor-pointer group"
                  >
                    <Link
                      href={{
                        pathname: "/products",
                        query: { category: item.slug },
                      }}
                    >
                      <div className="w-full h-[120px] relative rounded bg-white flex justify-center items-center">
                        <div className="w-full h-full flex justify-center items-center relative transform scale-100 group-hover:scale-110 transition duration-300 ease-in-out">
                          {item.image && (
                            <Image
                              width={57}
                              height={57}
                              className="object-contain"
                              src={appConfig.BASE_URL + item.image}
                              alt={item.name}
                            />
                          )}
                        </div>
                      </div>
                      <p className="text-base text-qgray text-center mt-5 group-hover:text-qgreen transition duration-300 ease-in-out">
                        {item.name}
                      </p>
                    </Link>
                  </div>
                ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CategorySection;
