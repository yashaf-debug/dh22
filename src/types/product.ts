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
  title?: string;
  description: string | null;
  care_text?: string | null;
  price: number;
  main_image: string | null;
  is_bestseller?: number;
  gallery?: string[];
  variants?: ProductVariant[];
};
