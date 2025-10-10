// client/components/LanguageSwitcher.jsx
import { useDispatch, useSelector } from "react-redux";
import { setLanguage } from "@/state/i18nSlice";

export default function LanguageSwitcher() {
  const dispatch = useDispatch();
  const { current, available } = useSelector((s) => s.i18n);
  return (
    <select
      value={current}
      onChange={(e) => dispatch(setLanguage(e.target.value))}
    >
      {available.map((l) => <option key={l} value={l}>{l.toUpperCase()}</option>)}
    </select>
  );
}
