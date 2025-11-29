import * as React from "react";
import { cn } from "@/lib/utils";

type AppImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  fallbackText?: string;
};

export function AppImage({
  src,
  alt,
  className,
  fallbackText = "No Image",
  ...rest
}: AppImageProps) {
  const [error, setError] = React.useState(
    !src || (typeof src === "string" && src.trim() === "")
  );

  if (error) {
    return (
      <div
        className={cn(
          "flex items-center justify-center h-full w-full object-cover transition-transform duration-300 group-hover:scale-105",
          className
        )}
      >
        {fallbackText}
      </div>
    );
  }

  return (
    <img
      src={src as string}
      alt={alt}
      onError={() => setError(true)}
      className={cn("block", className)}
      {...rest}
    />
  );
}
