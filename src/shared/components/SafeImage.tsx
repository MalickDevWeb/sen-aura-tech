import React, { useState, useEffect } from "react";

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackType?: "avatar" | "product" | "course" | "tech";
}

const DEFAULT_FALLBACKS = {
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
  product: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80",
  course: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
  tech: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80",
};

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  fallbackType = "product",
  className,
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState<string>(src || DEFAULT_FALLBACKS[fallbackType]);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    if (src) {
      setImgSrc(src);
      setHasError(false);
    } else {
      setImgSrc(DEFAULT_FALLBACKS[fallbackType]);
    }
  }, [src, fallbackType]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(DEFAULT_FALLBACKS[fallbackType]);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt || "Image SEN AURA TECH"}
      onError={handleError}
      referrerPolicy="no-referrer"
      className={className}
      {...props}
    />
  );
};
