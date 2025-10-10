// src/pages/Faq.jsx
import { useMemo, useState } from "react";
import Accodion from "@/components/Helpers/Accodion";
import PageTitle from "@/components/Helpers/PageTitle";
import Layout from "@/components/Partials/Layout";

/* i18n */
import { useT } from "@/i18n/I18nProvider";

/* PUBLIC – FAQ */
import { useListPublishedFaqsQuery } from "@/api-manage/api-call-functions/public/publicFaq.api";

/* Contact send (public) */
import { useSendContactMessageMutation } from "@/api-manage/api-call-functions/public/publicContact.api";

/* küçük i18n picker */
const pickI18n = (val, lang) => {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object") {
    return val?.[lang] || val?.en || Object.values(val).find(Boolean) || "";
  }
  return String(val);
};

export default function Faq() {
  const { lang } = useT();

  /* --------- Liste: Yayındaki FAQ'lar --------- */
  const {
    data: faqs = [],
    isLoading,
    isError,
  } = useListPublishedFaqsQuery(lang);

  const accItems = useMemo(() => {
    return (Array.isArray(faqs) ? faqs : []).map((it, idx) => ({
      id: it?._id || it?.id || idx,
      title: `${String(idx + 1).padStart(2, "0")}. ${pickI18n(it?.question, lang)}`,
      des: pickI18n(it?.answer, lang),
      init: idx === 0,
    }));
  }, [faqs, lang]);

  /* --------- Sağ form: Contact üzerinden soru gönder --------- */
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [question, setQuestion] = useState("");
  const [status, setStatus] = useState({ type: "", msg: "" });

  const [sendMessage, { isLoading: sending }] = useSendContactMessageMutation();

  const onSubmit = async (e) => {
    e?.preventDefault?.();
    setStatus({ type: "", msg: "" });

    const payload = {
      name: name.trim(),
      email: email.trim(),
      subject: "FAQ Question",
      message: question.trim(),
    };

    if (!payload.name) return setStatus({ type: "err", msg: "Please enter your name." });
    if (!payload.email) return setStatus({ type: "err", msg: "Please enter your email." });
    if (!/^\S+@\S+\.\S+$/.test(payload.email)) {
      return setStatus({ type: "err", msg: "Please enter a valid email." });
    }
    if (!payload.message) return setStatus({ type: "err", msg: "Please enter your question." });

    try {
      await sendMessage(payload).unwrap();
      setStatus({ type: "ok", msg: "Thanks! We received your question and will reply via email." });
      setName("");
      setEmail("");
      setQuestion("");
    } catch (err) {
      const msg =
        err?.data?.message ||
        err?.error ||
        (typeof err?.message === "string" ? err.message : "Could not send your question.");
      setStatus({ type: "err", msg });
    }
  };

  return (
    <Layout childrenClasses="pt-0 pb-0">
      <div className="faq-page-wrapper w-full mb-10">
        <div className="page-title w-full">
          <PageTitle
            title="Frequently Asked Questions"
            breadcrumb={[
              { name: "home", path: "/" },
              { name: "FAQ", path: "/faq" },
            ]}
          />
        </div>
      </div>

      <div className="contact-wrapper w-full mb-10">
        <div className="container-x mx-auto">
          <div className="main-wrapper w-full lg:flex lg:space-x-[30px]">
            {/* Sol: FAQ listesi */}
            <div className="lg:w-1/2 w-full mb-10 lg:mb-0">
              <h1 className="text-qblack font-bold text-[22px] mb-4">
                Frequently asked questions
              </h1>

              {isLoading && <div className="text-qgray">Loading FAQs…</div>}
              {isError && <div className="text-qgray">Couldn’t load FAQs.</div>}
              {!isLoading && !isError && accItems.length === 0 && (
                <div className="text-qgray">No FAQs published yet.</div>
              )}

              {!isLoading && !isError && accItems.length > 0 && (
                <div className="flex flex-col space-y-7 justify-between">
                  {accItems.map((it) => (
                    <Accodion key={it.id} title={it.title} des={it.des} init={it.init} />
                  ))}
                </div>
              )}
            </div>

            {/* Sağ: Contact formu ile soru gönder */}
            <div className="flex-1">
              <div className="bg-white sm:p-10 p-5">
                <div className="title flex flex-col items-center">
                  <h1 className="lg:text-[34px] text-xl font-bold text-qblack">
                    Have Any Question
                  </h1>
                  <span className="-mt-5 block">
                    <svg
                      width="354"
                      height="30"
                      viewBox="0 0 354 30"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 28.8027C17.6508 20.3626 63.9476 8.17089 113.509 17.8802C166.729 28.3062 341.329 42.704 353 1"
                        stroke="#FFBB38"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </div>

                <form className="inputs mt-5" onSubmit={onSubmit}>
                  <div className="mb-4">
                    <label className="input-label text-qgray text-[13px] mb-2 block">
                      Name*
                    </label>
                    <input
                      type="text"
                      placeholder="Your name"
                      className="w-full h-[50px] p-3 border border-qgray-border focus:outline-none"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="input-label text-qgray text-[13px] mb-2 block">
                      Email Address*
                    </label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      className="w-full h-[50px] p-3 border border-qgray-border focus:outline-none"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-5">
                    <h6 className="input-label text-qgray capitalize text-[13px] font-normal block mb-2">
                      Your Question*
                    </h6>
                    <textarea
                      placeholder="Type your question here"
                      className="w-full h-[140px] focus:ring-0 focus:outline-none p-3 border border-qgray-border placeholder:text-sm"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <button
                      type="submit"
                      className="black-btn text-sm font-semibold w-full h-[50px] flex justify-center items-center disabled:opacity-60"
                      disabled={sending}
                    >
                      <span>{sending ? "Sending…" : "Send Now"}</span>
                    </button>
                  </div>

                  {status.msg && (
                    <div
                      className={`mt-3 text-sm ${
                        status.type === "err" ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {status.msg}
                    </div>
                  )}
                </form>
              </div>

              <p className="text-sm text-qgray mt-3">
                Can’t find what you’re looking for? Send us your question — we’ll get back to you by email.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
