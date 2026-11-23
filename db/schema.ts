import { sqliteTable,text,integer } from "drizzle-orm/sqlite-core";
export const settings=sqliteTable("settings",{id:text("id").primaryKey(),data:text("data").notNull(),version:integer("version").notNull().default(1)});
export const products=sqliteTable("products",{id:integer("id").primaryKey({autoIncrement:true}),sku:text("sku").notNull().unique(),data:text("data").notNull(),version:integer("version").notNull().default(1)});
export const members=sqliteTable("members",{email:text("email").primaryKey(),role:text("role").notNull(),userId:text("user_id"),active:integer("active").notNull().default(1)});
export const quotes=sqliteTable("quotes",{id:text("id").primaryKey(),ownerId:text("owner_id"),tokenHash:text("token_hash").notNull(),data:text("data").notNull(),status:text("status").notNull().default("solicitud"),createdAt:text("created_at").notNull()});
export const audit=sqliteTable("audit",{id:integer("id").primaryKey({autoIncrement:true}),actor:text("actor").notNull(),action:text("action").notNull(),createdAt:text("created_at").notNull()});
