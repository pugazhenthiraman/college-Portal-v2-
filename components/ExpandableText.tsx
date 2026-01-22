import React, { useState } from "react";

interface ExpandableTextProps {
  value: string;
  previewLength?: number;
  className?: string;
}

const ExpandableText: React.FC<ExpandableTextProps> = ({ value, previewLength = 120, className = "" }) => {
  const [expanded, setExpanded] = useState(false);
  if (!value) return null;
  const isLong = value.length > previewLength;
  return (
    <span className={`break-all ${className}`}>
      {isLong ? (
        expanded ? (
          <>
            {value} <button className="text-blue-600 underline ml-2" onClick={() => setExpanded(false)}>Show less</button>
          </>
        ) : (
          <>
            {value.slice(0, previewLength)}... <button className="text-blue-600 underline ml-2" onClick={() => setExpanded(true)}>Show more</button>
          </>
        )
      ) : (
        value
      )}
    </span>
  );
};

export default ExpandableText; 