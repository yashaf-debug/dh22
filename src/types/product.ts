export type ProductVariant = {
  id?: number;
  color: string;
  size: string;
  sku?: string | null;
  stock: number;
};

export type Product = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  main_image: string | null;
  gallery?: string[];
  variants?: ProductVariant[];
};
