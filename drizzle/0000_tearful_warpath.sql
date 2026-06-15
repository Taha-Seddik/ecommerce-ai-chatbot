CREATE TABLE `roles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `roles_name_uq` ON `roles` (`name`);--> statement-breakpoint
CREATE TABLE `user_roles` (
	`user_id` text NOT NULL,
	`role_id` text NOT NULL,
	PRIMARY KEY(`user_id`, `role_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`telephone` text,
	`adresse` text,
	`city` text,
	`zip_code` text,
	`birth_date` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_uq` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`image` text,
	`icon` text,
	`show` integer DEFAULT true NOT NULL,
	`parent_category_id` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`parent_category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_slug_uq` ON `categories` (`slug`);--> statement-breakpoint
CREATE INDEX `categories_parent_idx` ON `categories` (`parent_category_id`);--> statement-breakpoint
CREATE TABLE `product_images` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`type` text DEFAULT 'Image' NOT NULL,
	`url` text NOT NULL,
	`thumbnail_url` text,
	`alt` text,
	`width` integer,
	`height` integer,
	`blur_data_url` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `product_images_product_idx` ON `product_images` (`product_id`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`reference` text NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`description_html` text,
	`thumbnail` text,
	`price_cents` integer NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`shipping_cost_cents` integer DEFAULT 0 NOT NULL,
	`discount_percentage` integer DEFAULT 0 NOT NULL,
	`stock` integer DEFAULT 0 NOT NULL,
	`low_stock_threshold` integer DEFAULT 5 NOT NULL,
	`dimensions` text,
	`add_to_packs` integer DEFAULT false NOT NULL,
	`rating_avg` real DEFAULT 0 NOT NULL,
	`rating_count` integer DEFAULT 0 NOT NULL,
	`is_published` integer DEFAULT true NOT NULL,
	`is_featured` integer DEFAULT false NOT NULL,
	`category_id` text,
	`created_by_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_slug_uq` ON `products` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `products_reference_uq` ON `products` (`reference`);--> statement-breakpoint
CREATE INDEX `products_category_idx` ON `products` (`category_id`);--> statement-breakpoint
CREATE INDEX `products_price_idx` ON `products` (`price_cents`);--> statement-breakpoint
CREATE INDEX `products_published_idx` ON `products` (`is_published`);--> statement-breakpoint
CREATE INDEX `products_featured_idx` ON `products` (`is_featured`);--> statement-breakpoint
CREATE INDEX `products_created_idx` ON `products` (`created_at`);--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`user_id` text NOT NULL,
	`rating` integer NOT NULL,
	`title` text,
	`body` text,
	`is_verified_purchase` integer DEFAULT false NOT NULL,
	`is_approved` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `reviews_product_idx` ON `reviews` (`product_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `reviews_one_per_user_uq` ON `reviews` (`product_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `cart_items` (
	`id` text PRIMARY KEY NOT NULL,
	`cart_id` text NOT NULL,
	`product_id` text NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`cart_id`) REFERENCES `carts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cart_items_uq` ON `cart_items` (`cart_id`,`product_id`);--> statement-breakpoint
CREATE TABLE `carts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`anon_token` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `carts_user_idx` ON `carts` (`user_id`);--> statement-breakpoint
CREATE INDEX `carts_anon_idx` ON `carts` (`anon_token`);--> statement-breakpoint
CREATE TABLE `wishlist_items` (
	`id` text PRIMARY KEY NOT NULL,
	`wishlist_id` text NOT NULL,
	`product_id` text NOT NULL,
	FOREIGN KEY (`wishlist_id`) REFERENCES `wishlists`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `wishlist_items_uq` ON `wishlist_items` (`wishlist_id`,`product_id`);--> statement-breakpoint
CREATE TABLE `wishlists` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `wishlists_user_uq` ON `wishlists` (`user_id`);--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`product_id` text,
	`title_snapshot` text NOT NULL,
	`unit_price_cents` integer NOT NULL,
	`quantity` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `order_items_order_idx` ON `order_items` (`order_id`);--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`reference` text NOT NULL,
	`user_id` text,
	`email` text,
	`amount_cents` integer NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`status` text DEFAULT 'PendingApproval' NOT NULL,
	`payment_method` text NOT NULL,
	`online_payment_status` text,
	`address_details` text,
	`invoice_path` text,
	`stripe_session_id` text,
	`stripe_payment_intent_id` text,
	`gateway_response` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_reference_uq` ON `orders` (`reference`);--> statement-breakpoint
CREATE INDEX `orders_user_idx` ON `orders` (`user_id`);--> statement-breakpoint
CREATE INDEX `orders_status_idx` ON `orders` (`status`);--> statement-breakpoint
CREATE TABLE `currencies` (
	`code` text PRIMARY KEY NOT NULL,
	`symbol` text NOT NULL,
	`rate_to_base` integer NOT NULL,
	`is_default` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`settings_data` text NOT NULL,
	`updated_at` integer NOT NULL
);
