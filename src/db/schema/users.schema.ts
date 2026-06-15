import { relations } from 'drizzle-orm';
import { integer, primaryKey, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { ROLES } from './enums';
import { pk, timestamps } from './helpers';

export const users = sqliteTable(
  'users',
  {
    id: pk(),
    email: text().notNull(),
    passwordHash: text().notNull(),
    firstName: text().notNull(),
    lastName: text().notNull(),
    telephone: text(),
    adresse: text(),
    city: text(),
    zipCode: text(),
    birthDate: integer({ mode: 'timestamp' }),
    ...timestamps(),
  },
  (t) => [uniqueIndex('users_email_uq').on(t.email)],
);

export const roles = sqliteTable(
  'roles',
  {
    id: pk(),
    name: text({ enum: ROLES }).notNull(),
  },
  (t) => [uniqueIndex('roles_name_uq').on(t.name)],
);

export const userRoles = sqliteTable(
  'user_roles',
  {
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    roleId: text()
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.userId, t.roleId] })],
);

export const usersRelations = relations(users, ({ many }) => ({
  userRoles: many(userRoles),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  userRoles: many(userRoles),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, { fields: [userRoles.userId], references: [users.id] }),
  role: one(roles, { fields: [userRoles.roleId], references: [roles.id] }),
}));
