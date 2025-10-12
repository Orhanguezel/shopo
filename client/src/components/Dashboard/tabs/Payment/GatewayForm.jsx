import { useState, useMemo } from "react";
import PropTypes from "prop-types";
import InputCom from "@/components/Helpers/InputCom";

const PROVIDERS = ["stripe","paypal","iyzico","paytr","papara","paycell","craftgate","manual"];

function ProviderCredFields({ provider, creds, setCreds }) {
  const on = (k) => (e) => setCreds((c) => ({ ...c, [k]: e.target.value }));

  switch (provider) {
    case "stripe":
      return (
        <div className="grid sm:grid-cols-3 gap-4">
          <InputCom label="Secret Key" name="secretKey" value={creds.secretKey || ""} onChange={on("secretKey")} placeholder="env:PAYMENTS_STRIPE_SECRET_KEY" />
          <InputCom label="Publishable Key" name="publicKey" value={creds.publicKey || ""} onChange={on("publicKey")} placeholder="env:PAYMENTS_STRIPE_PUBLISHABLE_KEY" />
          <InputCom label="Webhook Secret" name="webhookSecret" value={creds.webhookSecret || ""} onChange={on("webhookSecret")} placeholder="env:PAYMENTS_STRIPE_WEBHOOK_SECRET" />
        </div>
      );
    case "paypal":
      return (
        <div className="grid sm:grid-cols-2 gap-4">
          <InputCom label="Client ID" name="clientId" value={creds.clientId || ""} onChange={on("clientId")} placeholder="env:PAYPAL_CLIENT_ID" />
          <InputCom label="Client Secret" name="clientSecret" value={creds.clientSecret || ""} onChange={on("clientSecret")} placeholder="env:PAYPAL_CLIENT_SECRET" />
        </div>
      );
    case "iyzico":
      return (
        <div className="grid sm:grid-cols-2 gap-4">
          <InputCom label="API Key" name="apiKey" value={creds.apiKey || ""} onChange={on("apiKey")} />
          <InputCom label="Secret Key" name="secretKey" value={creds.secretKey || ""} onChange={on("secretKey")} />
        </div>
      );
    case "paytr":
      return (
        <div className="grid sm:grid-cols-3 gap-4">
          <InputCom label="Merchant ID" name="merchantId" value={creds.merchantId || ""} onChange={on("merchantId")} />
          <InputCom label="Merchant Key" name="merchantKey" value={creds.merchantKey || ""} onChange={on("merchantKey")} />
          <InputCom label="Merchant Salt" name="merchantSalt" value={creds.merchantSalt || ""} onChange={on("merchantSalt")} />
        </div>
      );
    case "craftgate":
      return (
        <div className="grid sm:grid-cols-2 gap-4">
          <InputCom label="API Key" name="apiKey" value={creds.apiKey || ""} onChange={on("apiKey")} />
          <InputCom label="Secret Key" name="secretKey" value={creds.secretKey || ""} onChange={on("secretKey")} />
        </div>
      );
    case "papara":
      return (
        <div className="grid sm:grid-cols-2 gap-4">
          <InputCom label="API Key" name="apiKey" value={creds.apiKey || ""} onChange={on("apiKey")} />
          <InputCom label="Client ID" name="clientId" value={creds.clientId || ""} onChange={on("clientId")} />
        </div>
      );
    case "paycell":
      return (
        <div className="grid sm:grid-cols-3 gap-4">
          <InputCom label="Merchant ID" name="merchantId" value={creds.merchantId || ""} onChange={on("merchantId")} />
          <InputCom label="API Key" name="apiKey" value={creds.apiKey || ""} onChange={on("apiKey")} />
          <InputCom label="Client ID" name="clientId" value={creds.clientId || ""} onChange={on("clientId")} />
        </div>
      );
    case "manual":
    default:
      return <p className="text-sm text-qgray">No credentials required.</p>;
  }
}
ProviderCredFields.propTypes = {
  provider: PropTypes.string.isRequired,
  creds: PropTypes.object.isRequired,
  setCreds: PropTypes.func.isRequired,
};

export default function GatewayForm({ initial = null, loading = false, onSubmit, onCancel }) {
  const [provider, setProvider] = useState(initial?.provider || "");
  const [isActive, setIsActive] = useState(Boolean(initial?.isActive ?? true));
  const [testMode, setTestMode] = useState(
    typeof initial?.mode === "string" ? initial.mode === "test" : true
  );
  const [credentials, setCredentials] = useState(initial?.credentials || {});
  const mode = useMemo(() => (testMode ? "test" : "live"), [testMode]);

  const submit = (e) => {
    e.preventDefault();
    if (!provider) return alert("Provider is required.");
    onSubmit({
      provider,
      isActive,
      testMode,
      credentials,
      mode,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm mb-1">Provider*</label>
          <select
            name="provider_select"
            className="border w-full h-[42px] rounded px-3"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
          >
            <option value="">Select…</option>
            {PROVIDERS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <input
            id="gw_active"
            name="gw_active"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          <label htmlFor="gw_active" className="select-none">
            Active
          </label>
        </div>

        <div className="flex items-center gap-3">
          <input
            id="gw_testmode"
            name="gw_testmode"
            type="checkbox"
            checked={testMode}
            onChange={(e) => setTestMode(e.target.checked)}
          />
          <label htmlFor="gw_testmode" className="select-none">
            Test Mode
          </label>
        </div>
      </div>

      <div className="border rounded p-4">
        <h4 className="font-semibold mb-3">Credentials</h4>
        <ProviderCredFields
          provider={provider || "manual"}
          creds={credentials}
          setCreds={setCredentials}
        />
        <p className="text-xs text-qgray mt-2">
          ENV kullanımı desteklenir: <code>env:VAR_ADI</code> veya <code>${"{VAR_ADI}"}</code>.
        </p>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="black-btn h-[42px] px-5 disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="border h-[42px] px-5 rounded"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

GatewayForm.propTypes = {
  initial: PropTypes.object,
  loading: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
