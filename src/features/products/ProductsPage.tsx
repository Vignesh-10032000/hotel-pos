import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Plus,
  Upload,
  Check,
  Save,
  AlertCircle,
} from 'lucide-react';
import { Product, ProductCategory } from '../../types';
import { posRepository } from '../../data/repositories/pos-repository';
import { useSettingsStore } from '../../stores/settings-store';
import { useTranslationHelper } from '../../i18n/translations';
import { rupeesToPaise } from '../../domain/money/money';
import { FOOD_IMAGES } from '../../data/food-assets';

export const ProductsPage: React.FC = () => {
  const { language } = useSettingsStore();
  const t = useTranslationHelper(language);

  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Items');

  // Form state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [name, setName] = useState('');
  const [priceRupees, setPriceRupees] = useState('');
  const [category, setCategory] = useState<Exclude<ProductCategory, 'All'>>('Biryani');
  const [gstRate, setGstRate] = useState<number>(5);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const loadProducts = async () => {
    const list = await posRepository.getProducts();
    setProducts(list);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleEdit = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setPriceRupees((prod.pricePaise / 100).toFixed(2));
    setCategory(prod.category);
    setGstRate(prod.gstRate);
    setImageUrl(prod.image || '');
    setFormError('');
    setFormSuccess('');
  };

  const handleResetForm = () => {
    setEditingProduct(null);
    setName('');
    setPriceRupees('');
    setCategory('Biryani');
    setGstRate(5);
    setImageUrl('');
    setFormError('');
    setFormSuccess('');
  };

  const handleToggleStatus = async (prod: Product) => {
    const updated = { ...prod, isActive: !prod.isActive, updatedAt: new Date().toISOString() };
    await posRepository.saveProduct(updated);
    await loadProducts();
  };

  const handleDelete = async (prodId: string) => {
    if (confirm('Are you sure you want to delete this food item?')) {
      await posRepository.deleteProduct(prodId);
      await loadProducts();
      if (editingProduct?.id === prodId) {
        handleResetForm();
      }
    }
  };

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setFormError('Image must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!name.trim()) {
      setFormError('Product Name is required.');
      return;
    }

    const priceNum = parseFloat(priceRupees);
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError('Please enter a valid price greater than 0.');
      return;
    }

    const now = new Date().toISOString();
    const product: Product = {
      id: editingProduct ? editingProduct.id : `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      category,
      pricePaise: rupeesToPaise(priceNum),
      gstRate,
      isActive: editingProduct ? editingProduct.isActive : true,
      image: imageUrl || FOOD_IMAGES.chickenBiryani,
      createdAt: editingProduct ? editingProduct.createdAt : now,
      updatedAt: now,
    };

    try {
      await posRepository.saveProduct(product);
      setFormSuccess(editingProduct ? 'Product updated successfully!' : 'New product added successfully!');
      await loadProducts();
      handleResetForm();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save product';
      setFormError(msg);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const matchesCategory =
        selectedCategory === 'All Items' || prod.category === selectedCategory;
      const matchesSearch =
        prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (prod.nameTa && prod.nameTa.includes(searchQuery));
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left / Main Section: Products Table */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm overflow-hidden flex flex-col">
        {/* Table Search & Category Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product name... (e.g. Chicken Biryani)"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="All Items">All Items</option>
            <option value="Biryani">Biryani</option>
            <option value="Starters">Starters</option>
            <option value="Rice">Rice</option>
            <option value="Combos">Combos</option>
            <option value="Drinks">Drinks</option>
            <option value="Extras">Extras</option>
            <option value="Others">Others</option>
          </select>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto flex-1 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-3">#</th>
                <th className="py-3 px-3">IMAGE</th>
                <th className="py-3 px-3">PRODUCT NAME</th>
                <th className="py-3 px-3">PRICE (₹)</th>
                <th className="py-3 px-3">GST</th>
                <th className="py-3 px-3">STATUS</th>
                <th className="py-3 px-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredProducts.map((prod, index) => (
                <tr
                  key={prod.id}
                  className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                    editingProduct?.id === prod.id ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                  }`}
                >
                  <td className="py-3 px-3 text-slate-400 font-mono">{index + 1}</td>
                  <td className="py-3 px-3">
                    <img
                      src={prod.image || FOOD_IMAGES.chickenBiryani}
                      alt={prod.name}
                      className="w-10 h-10 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-100">
                    {prod.name}
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                    {(prod.pricePaise / 100).toFixed(2)}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        prod.gstRate === 0
                          ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          : prod.gstRate === 18
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      }`}
                    >
                      {prod.gstRate}%
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(prod)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        prod.isActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          prod.isActive ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="py-3 px-3 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(prod)}
                      className="px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-50 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(prod.id)}
                      className="px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 font-bold hover:bg-rose-50 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Section: Add / Edit Product Form Panel */}
      <div className="w-full lg:w-[380px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm shrink-0 flex flex-col justify-between overflow-y-auto max-h-[calc(100vh-6.5rem)]">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              {editingProduct ? t.editProduct : t.addNewProduct}
            </h3>
            <button
              type="button"
              onClick={handleResetForm}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center space-x-1 shadow-sm transition-transform active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.addNewProduct}</span>
            </button>
          </div>

          {formError && (
            <div className="mb-4 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div className="mb-4 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 text-emerald-700 dark:text-emerald-300 text-xs flex items-center space-x-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{formSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSaveProduct} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.productName} *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Chicken Biryani"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.price} *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={priceRupees}
                onChange={(e) => setPriceRupees(e.target.value)}
                placeholder="0.00"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Exclude<ProductCategory, 'All'>)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none"
              >
                <option value="Biryani">Biryani</option>
                <option value="Starters">Starters</option>
                <option value="Rice">Rice</option>
                <option value="Combos">Combos</option>
                <option value="Drinks">Drinks</option>
                <option value="Extras">Extras</option>
                <option value="Others">Others</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.gstRate}
              </label>
              <select
                value={gstRate}
                onChange={(e) => setGstRate(parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none"
              >
                <option value={0}>0% (No GST)</option>
                <option value={5}>5% (Default)</option>
                <option value={12}>12%</option>
                <option value={18}>18%</option>
                <option value={28}>28%</option>
              </select>
            </div>

            {/* Upload Image Box */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Food Image (Optional)
              </label>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                {imageUrl ? (
                  <div className="flex flex-col items-center">
                    <img src={imageUrl} alt="Preview" className="w-16 h-16 object-cover rounded-xl mb-1 shadow-sm" />
                    <span className="text-[10px] text-blue-600 font-bold">Change Image</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-blue-600 mb-1" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Upload Image (Optional)
                    </span>
                    <span className="text-[10px] text-slate-400">PNG, JPG (Max 2MB)</span>
                  </>
                )}
                <input type="file" accept="image/*" onChange={handleImageFile} className="hidden" />
              </label>
            </div>

            <button
              type="submit"
              className="w-full mt-4 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 transition-transform active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{t.saveProduct}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
