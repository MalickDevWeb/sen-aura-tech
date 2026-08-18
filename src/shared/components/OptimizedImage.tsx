import React, { useState } from "react";
import { ImageOff } from "lucide-react";

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  aspectRatio?: "1/1" | "16/9" | "4/3" | "3/2" | "auto";
  priority?: boolean;
  containerClassName?: string;
  fallbackIconClassName?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  aspectRatio = "16/9",
  priority = false,
  className = "",
  containerClassName = "",
  fallbackIconClassName = "w-6 h-6 text-slate-600",
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const getAspectClass = () => {
    switch (aspectRatio) {
      case "1/1": return "aspect-square";
      case "16/9": return "aspect-video";
      case "4/3": return "aspect-[4/3]";
      case "3/2": return "aspect-[3/2]";
      default: return "";
    }
  };

  return (
    <div
      className={`relative overflow-hidden bg-slate-900/80 ${getAspectClass()} ${containerClassName}`}
      style={{
        contain: "paint layout",
        contentVisibility: "auto",
      }}
    >
      {/* Zero CLS Shimmer Placeholder */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800/60 to-slate-900 animate-pulse" />
      )}

      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-slate-600 p-2 text-center">
          <ImageOff className={fallbackIconClassName} />
          <span className="text-[10px] mt-1 text-slate-500 font-mono">SEN AURA TECH</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          decoding="async"
          loading={priority ? "eager" : "lazy"}
          // @ts-ignore
          fetchPriority={priority ? "high" : "auto"}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? "opacity-100" : "opacity-0"
          } ${className}`}
          {...props}
        />
      )}
    </div>
  );
};
