/** Shared enum value lists + inferred TS unions (mirrors the legacy app's enums). */

export const ROLES = ['user', 'moderator', 'admin'] as const;
export type Role = (typeof ROLES)[number];

export const ORDER_STATUSES = [
  'PendingApproval',
  'Approved',
  'ShippingInProgress',
  'Delivered',
  'Cancelled',
  'Failed',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_METHODS = ['CashOnDelivery', 'OnlinePayment'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const ONLINE_PAYMENT_STATUSES = ['Pending', 'Success', 'Failed', 'Refunded'] as const;
export type OnlinePaymentStatus = (typeof ONLINE_PAYMENT_STATUSES)[number];

export const MEDIA_TYPES = ['Image', 'Video', '3D'] as const;
export type MediaType = (typeof MEDIA_TYPES)[number];
