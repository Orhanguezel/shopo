import Image from "next/image";
import Link from "next/link";
import DataIteration from "../Helpers/DataIteration";
import appConfig from "@/appConfig";
export default function BrandSection({ className, sectionTitle, brands = [] }) {
  return (
    <div data-aos="fade-up" className={`w-full ${className || ""}`}>
      <div className="container-x mx-auto">
        <div className="section-title flex justify-between items-center mb-10">
          <div className="relative">
            <h2 className="sm:text-3xl text-2xl font-bold text-qblacktext leading-none relative z-10">
              {sectionTitle}
            </h2>
            <div className="absolute -bottom-2 left-0 w-1/2 h-1 bg-qyellow rounded-full"></div>
          </div>
        </div>
        <div className="grid lg:grid-cols-6 sm:grid-cols-4 grid-cols-2 gap-4">
          <DataIteration
            datas={brands}
            startLength={0}
            endLength={brands.length}
          >
            {({ datas }) => (
              <div key={datas.id} className="item group">
                <Link
                  href={{
                    pathname: "/products",
                    query: { brand: datas.slug },
                  }}
                >
                  <div className="w-full h-[120px] p-6 bg-white border border-gray-100 rounded-xl flex justify-center items-center transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1 cursor-pointer">
                    <div className="w-full h-full relative">
                      <Image
                        fill
                        className="object-contain transition-opacity duration-300 opacity-80 group-hover:opacity-100"
                        src={`${appConfig.BASE_URL + datas.logo}`}
                        alt={`${datas.name} marka logosu`}
                        loading="lazy"
                        sizes="(max-width: 768px) 50vw, 16vw"
                      />
                    </div>
                  </div>
                </Link>
              </div>
            )}
          </DataIteration>
        </div>
      </div>
    </div>
  );
}
