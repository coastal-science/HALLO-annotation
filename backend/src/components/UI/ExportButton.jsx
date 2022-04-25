import { Button } from "@material-ui/core";
import { useState } from "react";

const ExportButton = ({ onExport, children }) => {
  const [exporting, setExporting] = useState(false);
  return (
    <Button
      variant="contained"
      color="primary"
      disabled={exporting}
      onClick={async () => {
        setExporting(true);
        await onExport();
        setExporting(false);
      }}
    >
      {exporting ? "Exporting" : children}
    </Button>
  );
};

export default ExportButton;
