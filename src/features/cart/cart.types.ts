/** Cart view types — safe to import from client and server. */

export type SimpleLine = { productId: string; quantity: number };

export type CartViewLine = {
  productId: string;
  slug: string;
  title: string;
  thumbnail: string | null;
  unitPriceCents: number;
  currency: string;
  quantity: number;
  stock: number;
  lineTotalCents: number;
};

export type CartView = {
  lines: CartViewLine[];
  subtotalCents: number;
  itemCount: number;
  currency: string;
};
