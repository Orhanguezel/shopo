"use client";
import React, { useState } from "react";
import DateFormat from "../../../../utils/DateFormat";
import Link from "next/link";
import ServeLangItem from "../../../Helpers/ServeLangItem";
import CurrencyConvert from "../../../Shared/CurrencyConvert";

const STATUS_MAP = {
  0: { label: "Beklemede", color: "bg-yellow-100 text-yellow-800" },
  1: { label: "Satici Onayladi", color: "bg-blue-100 text-blue-800" },
  2: { label: "Admin Onayladi", color: "bg-indigo-100 text-indigo-800" },
  3: { label: "Urun Teslim Alindi", color: "bg-purple-100 text-purple-800" },
  4: { label: "Iade Edildi", color: "bg-green-100 text-green-800" },
  5: { label: "Satici Reddetti", color: "bg-red-100 text-red-800" },
  6: { label: "Admin Reddetti", color: "bg-red-100 text-red-800" },
  7: { label: "Iptal Edildi", color: "bg-gray-100 text-gray-800" },
};

export default function ReturnRequestsTab({ returns }) {
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredReturns =
    statusFilter === "all"
      ? returns
      : returns?.filter((item) => String(item.status) === statusFilter);

  const stats = {
    total: returns?.length || 0,
    pending: returns?.filter((r) => r.status === 0).length || 0,
    approved: returns?.filter((r) => [1, 2, 3].includes(r.status)).length || 0,
    refunded: returns?.filter((r) => r.status === 4).length || 0,
    rejected: returns?.filter((r) => [5, 6].includes(r.status)).length || 0,
  };

  return (
    <div className="return-requests-wrapper w-full">
      {/* Stats summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-qblack">{stats.total}</p>
          <p className="text-sm text-qgray">Toplam</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
          <p className="text-sm text-qgray">Beklemede</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{stats.refunded}</p>
          <p className="text-sm text-qgray">Iade Edildi</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-red-700">{stats.rejected}</p>
          <p className="text-sm text-qgray">Reddedildi</p>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <select
          className="border border-gray-200 rounded-lg px-4 py-2 text-sm text-qgray focus:outline-none focus:ring-2 focus:ring-qyellow"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Tum Talepler</option>
          <option value="0">Beklemede</option>
          <option value="1">Satici Onayladi</option>
          <option value="2">Admin Onayladi</option>
          <option value="3">Urun Teslim Alindi</option>
          <option value="4">Iade Edildi</option>
          <option value="5">Satici Reddetti</option>
          <option value="6">Admin Reddetti</option>
          <option value="7">Iptal Edildi</option>
        </select>
      </div>

      {/* Table */}
      <div className="relative w-full overflow-x-auto sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500">
          <tbody>
            <tr className="text-base text-qgray whitespace-nowrap px-2 border-b default-border-bottom">
              <td className="py-4 block whitespace-nowrap text-center">
                Siparis
              </td>
              <td className="py-4 whitespace-nowrap text-center">Urun</td>
              <td className="py-4 whitespace-nowrap text-center">Tarih</td>
              <td className="py-4 whitespace-nowrap text-center">Tutar</td>
              <td className="py-4 whitespace-nowrap text-center">Durum</td>
              <td className="py-4 whitespace-nowrap text-center">
                {ServeLangItem()?.Action}
              </td>
            </tr>
            {filteredReturns && filteredReturns.length > 0 ? (
              filteredReturns.map((item, i) => {
                const statusInfo = STATUS_MAP[item.status] || {
                  label: "Bilinmiyor",
                  color: "bg-gray-100 text-gray-800",
                };
                return (
                  <tr key={i} className="bg-white border-b hover:bg-gray-50">
                    <td className="text-center py-4">
                      <span className="text-lg text-qgray font-medium">
                        #{item.order?.order_id || item.order_id}
                      </span>
                    </td>
                    <td className="text-center py-4 px-2">
                      <span className="text-sm text-qblack whitespace-nowrap">
                        {item.order_product?.product?.name
                          ? item.order_product.product.name.length > 30
                            ? item.order_product.product.name.substring(0, 30) +
                              "..."
                            : item.order_product.product.name
                          : "-"}
                      </span>
                    </td>
                    <td className="text-center py-4 px-2">
                      <span className="text-base text-qgray whitespace-nowrap">
                        {DateFormat(item.created_at)}
                      </span>
                    </td>
                    <td className="text-center py-4 px-2">
                      <span className="text-base text-qblack whitespace-nowrap">
                        {item.refund_amount ? (
                          <CurrencyConvert price={item.refund_amount} />
                        ) : (
                          "-"
                        )}
                      </span>
                    </td>
                    <td className="text-center py-4 px-2">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}
                      >
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="py-4 flex justify-center">
                      <Link href={`/order/${item.order?.order_id || item.order_id}`}>
                        <div className="w-[116px] h-[46px] bg-qyellow text-qblack font-bold flex justify-center items-center cursor-pointer">
                          <span>{ServeLangItem()?.View_Details}</span>
                        </div>
                      </Link>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-10 text-qgray">
                  Iade talebi bulunamadi.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
