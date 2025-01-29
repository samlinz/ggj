import { fatalError } from "./util";

export const loadImageElement = (document: Document) => (id: string) => {
  const img = document.getElementById(id) as HTMLImageElement;

  if (!img) {
    fatalError(`Image with id ${id} not found`);
  }

  return img;
};
