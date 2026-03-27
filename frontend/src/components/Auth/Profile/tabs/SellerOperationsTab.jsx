"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import apiRoutes from "@/appConfig/apiRoutes";
import {
  useDeleteSellerKycDocumentApiMutation,
  useSellerBulkImportsApiQuery,
  useSellerKycDocumentsApiQuery,
  useSellerKycStatusApiQuery,
  useUploadSellerBulkImportApiMutation,
  useUploadSellerKycDocumentApiMutation,
} from "@/redux/features/auth/apiSlice";

const DOCUMENT_TYPE_OPTIONS = [
  { value: "identity_front", label: "Identity Front" },
  { value: "identity_back", label: "Identity Back" },
  { value: "tax_certificate", label: "Tax Certificate" },
  { value: "address_proof", label: "Address Proof" },
  { value: "bank_statement", label: "Bank Statement" },
  { value: "iban_document", label: "IBAN Document" },
];

const STATUS_STYLES = {
  not_submitted: "bg-gray-100 text-gray-700",
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

const DOCUMENT_STATUS_STYLES = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  try {
    return new Intl.DateTimeFormat("tr-TR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch (error) {
    return value;
  }
}

function formatBytes(size) {
  if (!size) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  let value = size;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function ErrorList({ errors = [] }) {
  if (!errors.length) {
    return null;
  }

  return (
    <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
      {errors.slice(0, 3).map((error, index) => (
        <p key={`${error.row || index}-${error.message}`}>
          Row {error.row || "?"}: {error.message}
        </p>
      ))}
      {errors.length > 3 ? <p>+{errors.length - 3} more errors</p> : null}
    </div>
  );
}

export default function SellerOperationsTab({ token, isActive, isSeller }) {
  const [kycForm, setKycForm] = useState({
    documentType: DOCUMENT_TYPE_OPTIONS[0].value,
    document: null,
    iban: "",
    taxNumber: "",
  });
  const [bulkFile, setBulkFile] = useState(null);

  const {
    data: sellerKycDocumentsApi,
    isFetching: isKycFetching,
    refetch: refetchKycDocuments,
  } = useSellerKycDocumentsApiQuery(
    { token },
    {
      skip: !token || !isActive || !isSeller,
    }
  );

  const {
    data: sellerKycStatusApi,
    isFetching: isKycStatusFetching,
    refetch: refetchKycStatus,
  } = useSellerKycStatusApiQuery(
    { token },
    {
      skip: !token || !isActive || !isSeller,
    }
  );

  const {
    data: sellerBulkImportsApi,
    isFetching: isBulkImportsFetching,
    refetch: refetchBulkImports,
  } = useSellerBulkImportsApiQuery(
    { token },
    {
      skip: !token || !isActive || !isSeller,
    }
  );

  const [uploadSellerKycDocumentApi, { isLoading: isKycUploading }] =
    useUploadSellerKycDocumentApiMutation();
  const [deleteSellerKycDocumentApi, { isLoading: isKycDeleting }] =
    useDeleteSellerKycDocumentApiMutation();
  const [uploadSellerBulkImportApi, { isLoading: isBulkUploading }] =
    useUploadSellerBulkImportApiMutation();

  useEffect(() => {
    if (sellerKycStatusApi?.status) {
      setKycForm((prev) => ({
        ...prev,
        iban: sellerKycStatusApi.status.iban || "",
        taxNumber: sellerKycStatusApi.status.tax_number || "",
      }));
    }
  }, [sellerKycStatusApi]);

  if (!isSeller) {
    return (
      <div className="rounded-lg border border-qgray-border p-6">
        <h2 className="text-xl font-semibold text-qblack">Seller Tools</h2>
        <p className="mt-3 text-sm text-qgray">
          This section is available only for seller accounts.
        </p>
      </div>
    );
  }

  const handleKycUpload = async (event) => {
    event.preventDefault();

    if (!kycForm.document) {
      toast.error("Please choose a document file.");
      return;
    }

    await uploadSellerKycDocumentApi({
      token,
      data: {
        document_type: kycForm.documentType,
        document: kycForm.document,
        iban: kycForm.iban.trim() || null,
        tax_number: kycForm.taxNumber.trim() || null,
      },
      success: async (data) => {
        toast.success(data?.message || "KYC document uploaded.");
        setKycForm((prev) => ({
          ...prev,
          document: null,
        }));
        const fileInput = document.getElementById("seller-kyc-document");
        if (fileInput) {
          fileInput.value = "";
        }
        await Promise.all([refetchKycDocuments(), refetchKycStatus()]);
      },
      error: (error) => {
        toast.error(error?.data?.message || "KYC upload failed.");
      },
    });
  };

  const handleDeleteDocument = async (id) => {
    await deleteSellerKycDocumentApi({
      token,
      id,
      success: async (data) => {
        toast.success(data?.message || "KYC document deleted.");
        await Promise.all([refetchKycDocuments(), refetchKycStatus()]);
      },
      error: (error) => {
        toast.error(error?.data?.message || "Document could not be deleted.");
      },
    });
  };

  const handleBulkUpload = async (event) => {
    event.preventDefault();

    if (!bulkFile) {
      toast.error("Please choose a CSV or XLSX file.");
      return;
    }

    await uploadSellerBulkImportApi({
      token,
      file: bulkFile,
      success: async (data) => {
        toast.success(data?.message || "Bulk import processed.");
        setBulkFile(null);
        const fileInput = document.getElementById("seller-bulk-import-file");
        if (fileInput) {
          fileInput.value = "";
        }
        await refetchBulkImports();
      },
      error: (error) => {
        toast.error(error?.data?.message || "Bulk import failed.");
      },
    });
  };

  const kycStatus = sellerKycStatusApi?.status?.kyc_status || "not_submitted";
  const documents = sellerKycDocumentsApi?.documents || [];
  const imports = sellerBulkImportsApi?.imports?.data || [];
  const templateUrl = `${apiRoutes.sellerBulkImportTemplate}?token=${token}`;

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-qgray-border p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-qblack">Seller KYC</h2>
            <p className="mt-1 text-sm text-qgray">
              Upload the required documents to keep your seller account active.
            </p>
          </div>
          <span
            className={`inline-flex w-fit rounded-full px-3 py-1 text-sm font-semibold capitalize ${
              STATUS_STYLES[kycStatus] || STATUS_STYLES.not_submitted
            }`}
          >
            {kycStatus.replace("_", " ")}
          </span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-sm text-qgray">Submitted</p>
            <p className="mt-2 text-sm font-semibold text-qblack">
              {formatDateTime(sellerKycStatusApi?.status?.submitted_at)}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-sm text-qgray">Approved</p>
            <p className="mt-2 text-sm font-semibold text-qblack">
              {formatDateTime(sellerKycStatusApi?.status?.approved_at)}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-sm text-qgray">Documents</p>
            <p className="mt-2 text-sm font-semibold text-qblack">
              {sellerKycStatusApi?.status?.document_count || 0}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-sm text-qgray">Rejected Types</p>
            <p className="mt-2 text-sm font-semibold text-qblack">
              {sellerKycStatusApi?.status?.rejected_document_types?.length || 0}
            </p>
          </div>
        </div>

        <form className="mt-6 grid gap-4 lg:grid-cols-2" onSubmit={handleKycUpload}>
          <div>
            <label className="mb-2 block text-sm text-qgray">Document Type</label>
            <select
              value={kycForm.documentType}
              onChange={(event) =>
                setKycForm((prev) => ({
                  ...prev,
                  documentType: event.target.value,
                }))
              }
              className="h-[50px] w-full border border-qgray-border px-4 text-sm focus:outline-none"
            >
              {DOCUMENT_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-qgray">Document File</label>
            <input
              id="seller-kyc-document"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(event) =>
                setKycForm((prev) => ({
                  ...prev,
                  document: event.target.files?.[0] || null,
                }))
              }
              className="flex h-[50px] w-full items-center border border-qgray-border px-4 py-3 text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-qgray">IBAN</label>
            <input
              type="text"
              value={kycForm.iban}
              onChange={(event) =>
                setKycForm((prev) => ({
                  ...prev,
                  iban: event.target.value,
                }))
              }
              placeholder="TR..."
              className="h-[50px] w-full border border-qgray-border px-4 text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-qgray">Tax Number</label>
            <input
              type="text"
              value={kycForm.taxNumber}
              onChange={(event) =>
                setKycForm((prev) => ({
                  ...prev,
                  taxNumber: event.target.value,
                }))
              }
              className="h-[50px] w-full border border-qgray-border px-4 text-sm focus:outline-none"
            />
          </div>

          <div className="lg:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={isKycUploading}
              className="h-[46px] px-6 bg-qyellow text-qblack text-sm font-semibold disabled:opacity-60"
            >
              {isKycUploading ? "Uploading..." : "Upload KYC Document"}
            </button>
          </div>
        </form>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead>
              <tr className="border-b border-qgray-border text-qgray">
                <th className="py-3 pr-4 font-medium">Document</th>
                <th className="py-3 pr-4 font-medium">File</th>
                <th className="py-3 pr-4 font-medium">Size</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                <th className="py-3 pr-4 font-medium">Reviewed</th>
                <th className="py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {documents.length > 0 ? (
                documents.map((documentItem) => (
                  <tr key={documentItem.id} className="border-b border-qgray-border/60">
                    <td className="py-4 pr-4 font-medium text-qblack">
                      {DOCUMENT_TYPE_OPTIONS.find(
                        (option) => option.value === documentItem.document_type
                      )?.label || documentItem.document_type}
                    </td>
                    <td className="py-4 pr-4">{documentItem.original_name}</td>
                    <td className="py-4 pr-4">{formatBytes(documentItem.file_size)}</td>
                    <td className="py-4 pr-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                          DOCUMENT_STATUS_STYLES[documentItem.status] ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {documentItem.status}
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      {formatDateTime(documentItem.reviewed_at)}
                    </td>
                    <td className="py-4 text-right">
                      {documentItem.status === "pending" ? (
                        <button
                          type="button"
                          disabled={isKycDeleting}
                          onClick={() => handleDeleteDocument(documentItem.id)}
                          className="text-sm font-medium text-red-600 disabled:opacity-60"
                        >
                          Delete
                        </button>
                      ) : (
                        <span className="text-xs text-qgray">Locked</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-qgray">
                    {isKycFetching || isKycStatusFetching
                      ? "Loading seller KYC data..."
                      : "No KYC documents uploaded yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-qgray-border p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-qblack">Bulk Product Import</h2>
            <p className="mt-1 text-sm text-qgray">
              Download the template and upload product rows in a single file.
            </p>
          </div>
          <a
            href={templateUrl}
            className="inline-flex h-[42px] items-center justify-center bg-qblack px-5 text-sm font-semibold text-white"
          >
            Download Template
          </a>
        </div>

        <form className="mt-6 flex flex-col gap-4 md:flex-row" onSubmit={handleBulkUpload}>
          <input
            id="seller-bulk-import-file"
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(event) => setBulkFile(event.target.files?.[0] || null)}
            className="flex-1 border border-qgray-border px-4 py-3 text-sm focus:outline-none"
          />
          <button
            type="submit"
            disabled={isBulkUploading}
            className="h-[46px] px-6 bg-qyellow text-qblack text-sm font-semibold disabled:opacity-60"
          >
            {isBulkUploading ? "Processing..." : "Upload Import File"}
          </button>
        </form>

        <div className="mt-6 space-y-4">
          {imports.length > 0 ? (
            imports.map((item) => (
              <div key={item.id} className="rounded-lg border border-qgray-border p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-qblack">
                      {item.original_name || `Import #${item.id}`}
                    </p>
                    <p className="mt-1 text-xs text-qgray">
                      Started: {formatDateTime(item.started_at || item.created_at)}
                    </p>
                  </div>
                  <span
                    className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                      STATUS_STYLES[item.status] || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-4">
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs text-qgray">Rows</p>
                    <p className="mt-1 font-semibold text-qblack">{item.total_rows || 0}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs text-qgray">Processed</p>
                    <p className="mt-1 font-semibold text-qblack">
                      {item.processed_rows || 0}
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs text-qgray">Success</p>
                    <p className="mt-1 font-semibold text-green-700">
                      {item.success_count || 0}
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs text-qgray">Errors</p>
                    <p className="mt-1 font-semibold text-red-700">
                      {item.error_count || 0}
                    </p>
                  </div>
                </div>

                <ErrorList errors={item.error_log || []} />
              </div>
            ))
          ) : (
            <div className="rounded-lg bg-gray-50 p-4 text-sm text-qgray">
              {isBulkImportsFetching
                ? "Loading import history..."
                : "No import history found for this seller account."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
