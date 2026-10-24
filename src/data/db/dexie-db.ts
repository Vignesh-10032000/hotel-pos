import Dexie, { type EntityTable } from 'dexie';
import { Product, Invoice, DayCloseSession, UserAccount } from '../../types';

export interface SettingEntity {
  key: string;
  value: unknown;
}

export class BiryaniPOSDatabase extends Dexie {
  products!: EntityTable<Product, 'id'>;
  invoices!: EntityTable<Invoice, 'id'>;
  dayCloses!: EntityTable<DayCloseSession, 'id'>;
  settings!: EntityTable<SettingEntity, 'key'>;
  users!: EntityTable<UserAccount, 'id'>;

  constructor() {
    super('BiryaniPOSDB');
    this.version(1).stores({
      products: 'id, name, category, pricePaise, gstRate, isActive',
      invoices: 'id, invoiceNumber, createdAt, orderType, paymentMethod, status, totalPaise',
      dayCloses: 'id, businessDate, closedAt, isClosed',
      settings: 'key',
      users: 'id, username, role, isActive',
    });
  }
}

export const db = new BiryaniPOSDatabase();
