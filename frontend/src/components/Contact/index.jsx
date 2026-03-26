"use client";
import PageTitle from "../Helpers/PageTitle";
import ServeLangItem from "../Helpers/ServeLangItem";
import ContactPhoneIco from "../Helpers/icons/ContactPhoneIco";
import ContactEmailIco from "../Helpers/icons/ContactEmailIco";
import ContactLocationIco from "../Helpers/icons/ContactLocationIco";
import ContactForm from "./ContactForm";

// Main Contact component
export default function Contact({ datas }) {
  // Contact info cards (phone, email)
  const contactInfo = [
    {
      icon: <ContactPhoneIco />,
      title: ServeLangItem()?.phone,
      value: datas.contact?.phone,
      bgColor: "bg-[#FFEAE5]",
    },
    {
      icon: <ContactEmailIco />,
      title: ServeLangItem()?.Email,
      value: datas.contact?.email,
      bgColor: "bg-[#D3EFFF]",
    },
  ];
  // Render component
  return (
    <>
      {/* Page title and breadcrumb */}
      <div className="page-title mb-10">
        <PageTitle
          title="Contact"
          breadcrumb={[
            { name: "home", path: "/" },
            { name: "contact", path: "/contact" },
          ]}
        />
      </div>

      {/* Main contact wrapper */}
      <div className="contact-wrapper w-full mb-10">
        <div className="container-x mx-auto">
          <div className="main-wrapper w-full lg:flex lg:space-x-[30px] rtl:space-x-reverse">
            {/* Contact Info Section (left) */}
            <div className="lg:w-1/2 w-full">
              {datas.contact && (
                <div>
                  {/* Contact title and description */}
                  <h1 className="text-[22px] font-semibold text-qblack leading-[30px] mb-1">
                    {datas.contact.title}
                  </h1>
                  <p className="text-[15px] text-qgraytwo leading-[30px] mb-5">
                    {datas.contact.description}
                  </p>

                  {/* Phone & Email Cards */}
                  <div className="xl:flex xl:space-x-[30px] rtl:space-x-reverse mb-[30px]">
                    {contactInfo.map((info, index) => (
                      <div
                        key={index}
                        className={`xl:w-1/2 w-full h-[196px] flex flex-col justify-center ${info.bgColor} p-5`}
                      >
                        <div className="flex justify-center mb-3">
                          {info.icon}
                        </div>
                        <p className="text-[22px] text-black leading-[30px] text-center font-semibold">
                          {info.title}
                        </p>
                        <p className="text-[15px] text-black leading-[30px] text-center">
                          {info.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Address & Map */}
                  <div className="p-5 flex flex-col justify-between w-full bg-[#E7F2EC]">
                    <div className="flex space-x-5 rtl:space-x-reverse">
                      <span>
                        <ContactLocationIco />
                      </span>
                      <div>
                        <h1 className="text-[22px] font-semibold text-qblack leading-[30px] mb-2">
                          {ServeLangItem()?.Address}
                        </h1>
                        <p className="text-[15px] text-qblack leading-[30px]">
                          {datas.contact.address}
                        </p>
                      </div>
                    </div>
                    <div className="w-full h-[206px] mt-5">
                      {/* Embedded map iframe */}
                      <iframe
                        title="newWork"
                        src={datas.contact.map}
                        style={{ border: "0", width: "100%", height: "100%" }}
                        allowFullScreen=""
                        loading="lazy"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Contact Form Section (right) */}
            <div className="flex-1 bg-white sm:p-10 p-3">
              <div className="title flex flex-col items-center">
                <h1 className="text-[34px] font-bold text-qblack">
                  {ServeLangItem()?.Get_In_Touch}
                </h1>
                <span className="-mt-5 block">
                  {/* Decorative SVG underline */}
                  <svg
                    width="354"
                    height="30"
                    viewBox="0 0 354 30"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1 28.8027C17.6508 20.3626 63.9476 8.17089 113.509 17.8802C166.729 28.3062 341.329 42.704 353 1"
                      stroke="#FCBF49"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </div>
              {/* Contact Form */}
              <ContactForm />
            </div>
            {/* End Contact Form Section */}
          </div>
        </div>
      </div>
    </>
  );
}
