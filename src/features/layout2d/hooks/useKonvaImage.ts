import { useEffect, useState } from "react";
import { loadImageElement } from "../../../utils/image";

export const useKonvaImage = (source: string) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadImageElement(source)
      .then((element) => {
        if (!cancelled) {
          setImage(element);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setImage(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [source]);

  return image;
};
