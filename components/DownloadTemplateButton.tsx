import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

interface DownloadTemplateButtonProps {
  endpoint: string;
  filename: string;
  buttonText?: string;
}

export default function DownloadTemplateButton({
  endpoint,
  filename,
  buttonText = "Download",
}: DownloadTemplateButtonProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error("Failed to download template");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      alert("Something went wrong while downloading the template.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
      <Button
        onClick={handleDownload}
        disabled={downloading}
        className="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white flex items-center gap-2 px-4 py-2 rounded-md shadow-md transition-all duration-300"
      >
        <Download className="h-5 w-5" />
        {downloading ? "Downloading..." : buttonText}
      </Button>
    </motion.div>
  );
}
