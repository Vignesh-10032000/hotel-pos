import { db } from '../db/dexie-db';
import {
  DayCloseSession,
  Invoice,
  Product,
  StoreSettings,
  UserAccount,
} from '../../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_SETTINGS,
  INITIAL_USERS,
  generateSeedInvoices,
} from '../seed';

export interface InvoiceFilters {
  startDate?: string;
  endDate?: string;
  orderType?: string;
  paymentMethod?: string;
  status?: string;
  search?: string;
}

export interface POSDataRepository {
  getProducts(): Promise<Product[]>;
  saveProduct(product: Product): Promise<void>;
  deleteProduct(id: string): Promise<void>;
  saveInvoice(invoice: Invoice): Promise<string>;
  getInvoices(filters?: InvoiceFilters): Promise<Invoice[]>;
  getInvoiceById(id: string): Promise<Invoice | undefined>;
  refundInvoice(id: string, reason: string, authorizedBy: string): Promise<void>;
  getSettings(): Promise<StoreSettings>;
  saveSettings(settings: Partial<StoreSettings>): Promise<void>;
  getUsers(): Promise<UserAccount[]>;
  saveUser(user: UserAccount): Promise<void>;
  getDayClose(businessDate: string): Promise<DayCloseSession | undefined>;
  saveDayClose(session: DayCloseSession): Promise<void>;
  initializeSeedData(force?: boolean): Promise<void>;
  clearCache(): Promise<void>;
  resetDemoData(): Promise<void>;
  exportBackup(): Promise<string>;
  importBackup(jsonString: string): Promise<void>;
}

export class DexiePOSRepository implements POSDataRepository {
  private initialized = false;

  async initializeSeedData(force = false): Promise<void> {
    if (this.initialized && !force) return;

    const productCount = await db.products.count();
    const settingsRecord = await db.settings.get('store_settings');

    if (productCount === 0 || force) {
      if (force) {
        await db.products.clear();
        await db.invoices.clear();
        await db.dayCloses.clear();
        await db.users.clear();
        await db.settings.clear();
      }

      await db.products.bulkAdd(INITIAL_PRODUCTS);
      await db.users.bulkAdd(INITIAL_USERS);
      await db.settings.put({
        key: 'store_settings',
        value: INITIAL_SETTINGS,
      });

      const seedInvoices = generateSeedInvoices();
      await db.invoices.bulkAdd(seedInvoices);
    } else if (!settingsRecord) {
      await db.settings.put({
        key: 'store_settings',
        value: INITIAL_SETTINGS,
      });
    }

    this.initialized = true;
  }

  async getProducts(): Promise<Product[]> {
    await this.initializeSeedData();
    return db.products.toArray();
  }

  async saveProduct(product: Product): Promise<void> {
    await this.initializeSeedData();
    await db.products.put(product);
  }

  async deleteProduct(id: string): Promise<void> {
    await this.initializeSeedData();
    await db.products.delete(id);
  }

  async saveInvoice(invoice: Invoice): Promise<string> {
    await this.initializeSeedData();
    // Use transaction to ensure safe write and update settings next invoice number
    await db.transaction('rw', [db.invoices, db.settings, db.products], async () => {
      await db.invoices.put(invoice);

      // Advance next invoice number
      const settingRec = await db.settings.get('store_settings');
      if (settingRec && typeof settingRec.value === 'object') {
        const cur = settingRec.value as StoreSettings;
        const currentNum = parseInt(invoice.invoiceNumber.replace(/\D/g, ''), 10) || cur.nextInvoiceNumber;
        cur.nextInvoiceNumber = Math.max(cur.nextInvoiceNumber, currentNum + 1);
        await db.settings.put({ key: 'store_settings', value: cur });
      }

      // Decrement product stock if tracked
      for (const item of invoice.items) {
        const prod = await db.products.get(item.productId);
        if (prod && typeof prod.stock === 'number') {
          prod.stock = Math.max(0, prod.stock - item.quantity);
          await db.products.put(prod);
        }
      }
    });

    return invoice.id;
  }

  async getInvoices(filters?: InvoiceFilters): Promise<Invoice[]> {
    await this.initializeSeedData();
    let collection = await db.invoices.toArray();

    // Sort descending by invoice sequence number first, then createdAt
    collection.sort((a, b) => {
      const numA = parseInt(a.invoiceNumber.replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(b.invoiceNumber.replace(/\D/g, ''), 10) || 0;
      if (numA !== numB) {
        return numB - numA; // Higher invoice sequence (newest) always on top!
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    if (!filters) {
      return collection;
    }

    if (filters.startDate) {
      const start = new Date(filters.startDate).getTime();
      collection = collection.filter((inv) => new Date(inv.createdAt).getTime() >= start);
    }

    if (filters.endDate) {
      const end = new Date(filters.endDate).getTime();
      collection = collection.filter((inv) => new Date(inv.createdAt).getTime() <= end);
    }

    if (filters.orderType && filters.orderType !== 'All' && filters.orderType !== 'All Order Types') {
      collection = collection.filter((inv) => inv.orderType === filters.orderType);
    }

    if (filters.paymentMethod && filters.paymentMethod !== 'All' && filters.paymentMethod !== 'All Payments') {
      collection = collection.filter((inv) => inv.paymentMethod === filters.paymentMethod);
    }

    if (filters.status && filters.status !== 'All') {
      collection = collection.filter((inv) => inv.status === filters.status);
    }

    if (filters.search && filters.search.trim() !== '') {
      const q = filters.search.toLowerCase().trim();
      collection = collection.filter(
        (inv) =>
          inv.invoiceNumber.toLowerCase().includes(q) ||
          inv.items.some((it) => it.name.toLowerCase().includes(q)) ||
          inv.cashierName.toLowerCase().includes(q)
      );
    }

    return collection;
  }

  async getInvoiceById(id: string): Promise<Invoice | undefined> {
    await this.initializeSeedData();
    return db.invoices.get(id);
  }

  async refundInvoice(id: string, reason: string, authorizedBy: string): Promise<void> {
    await this.initializeSeedData();
    const inv = await db.invoices.get(id);
    if (!inv) throw new Error('Invoice not found');

    inv.status = 'Refunded';
    inv.refundDetails = {
      refundedAt: new Date().toISOString(),
      reason,
      authorizedBy,
      refundAmountPaise: inv.totalPaise,
    };

    await db.invoices.put(inv);
  }

  async getSettings(): Promise<StoreSettings> {
    await this.initializeSeedData();
    const rec = await db.settings.get('store_settings');
    if (!rec || !rec.value) {
      return INITIAL_SETTINGS;
    }
    return { ...INITIAL_SETTINGS, ...(rec.value as Partial<StoreSettings>) };
  }

  async saveSettings(settings: Partial<StoreSettings>): Promise<void> {
    await this.initializeSeedData();
    const current = await this.getSettings();
    const updated = { ...current, ...settings };
    await db.settings.put({
      key: 'store_settings',
      value: updated,
    });
  }

  async getUsers(): Promise<UserAccount[]> {
    await this.initializeSeedData();
    return db.users.toArray();
  }

  async saveUser(user: UserAccount): Promise<void> {
    await this.initializeSeedData();
    await db.users.put(user);
  }

  async getDayClose(businessDate: string): Promise<DayCloseSession | undefined> {
    await this.initializeSeedData();
    return db.dayCloses.where('businessDate').equals(businessDate).first();
  }

  async saveDayClose(session: DayCloseSession): Promise<void> {
    await this.initializeSeedData();
    await db.dayCloses.put(session);
  }

  /**
   * Safe Clear Cache: Clears temporary session/cache files without touching
   * products, historical invoices, store settings, or users.
   */
  async clearCache(): Promise<void> {
    // Clear browser sessionStorage and cache markers
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
      localStorage.removeItem('biryani_pos_temp_draft');
    }
    // Note: IndexedDB sales, products, and settings are deliberately preserved!
  }

  /**
   * Reset Demo Data: Re-seeds original clean demo state with products & invoices.
   */
  async resetDemoData(): Promise<void> {
    await this.initializeSeedData(true);
  }

  async exportBackup(): Promise<string> {
    await this.initializeSeedData();
    const products = await db.products.toArray();
    const invoices = await db.invoices.toArray();
    const settings = await this.getSettings();
    const dayCloses = await db.dayCloses.toArray();
    const users = await db.users.toArray();

    return JSON.stringify(
      {
        version: '0.1.0',
        exportedAt: new Date().toISOString(),
        products,
        invoices,
        settings,
        dayCloses,
        users,
      },
      null,
      2
    );
  }

  async importBackup(jsonString: string): Promise<void> {
    const data = JSON.parse(jsonString);
    if (!data.products || !data.invoices) {
      throw new Error('Invalid backup file format');
    }

    await db.transaction('rw', [db.products, db.invoices, db.settings, db.dayCloses, db.users], async () => {
      await db.products.clear();
      await db.invoices.clear();
      await db.dayCloses.clear();
      await db.users.clear();

      await db.products.bulkAdd(data.products);
      await db.invoices.bulkAdd(data.invoices);
      if (data.dayCloses) await db.dayCloses.bulkAdd(data.dayCloses);
      if (data.users) await db.users.bulkAdd(data.users);
      if (data.settings) {
        await db.settings.put({ key: 'store_settings', value: data.settings });
      }
    });
  }
}

export const posRepository: POSDataRepository = new DexiePOSRepository();
