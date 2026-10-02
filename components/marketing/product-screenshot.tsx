import Image from "next/image";
import styles from "@/app/landing.module.css";

type ProductScreenshotProps = {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
  sizes?: string;
};

export function ProductScreenshot({
  src,
  alt,
  priority = false,
  className = "",
  sizes = "(max-width: 760px) 92vw, (max-width: 1280px) 88vw, 1200px",
}: ProductScreenshotProps) {
  return (
    <div className={`${styles.screenshot} ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={2940}
        height={1912}
        sizes={sizes}
        priority={priority}
        quality={85}
        className={styles.screenshotImage}
      />
    </div>
  );
}
