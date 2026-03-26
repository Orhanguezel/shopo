import Maintain from "../Maintain";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";

function MaintenanceWrapper({ children }) {
  const { websiteSetup } = useSelector((state) => state.websiteSetup);
  const [mode, setMode] = useState(null);
  useEffect(() => {
    if (websiteSetup) {
      if (websiteSetup.payload) {
        if (websiteSetup.payload.maintainance) {
          setMode(Number(websiteSetup.payload.maintainance.status));
        }
      }
    }
  }, [websiteSetup]);
  if (mode === 0) {
    return children;
  } else if (mode === 1) {
    return <Maintain />;
  } else {
    return false;
  }
}

export default MaintenanceWrapper;
