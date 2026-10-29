import {sqliteTable,text,integer} from 'drizzle-orm/sqlite-core';
export const shopSettings=sqliteTable('shop_settings',{id:text('id').primaryKey(),payload:text('payload').notNull(),revision:integer('revision').notNull().default(0)});

export const galleryPhotos=sqliteTable('gallery_photos',{id:text('id').primaryKey(),objectKey:text('object_key').notNull(),caption:text('caption').notNull(),createdAt:integer('created_at').notNull()});
export const appointments=sqliteTable('appointments',{id:text('id').primaryKey(),requestPayload:text('request_payload').notNull(),details:text('details').notNull(),createdAt:integer('created_at').notNull()});
