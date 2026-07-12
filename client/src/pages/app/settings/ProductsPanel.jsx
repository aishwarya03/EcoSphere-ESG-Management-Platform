import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Leaf, Pencil, Plus } from 'lucide-react';
import { createProduct, listProducts, updateProduct } from '../../../api/products';
import { listCategories } from '../../../api/categories';
import { createProductSchema, updateProductSchema } from '../../../lib/validation';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Field from '../../../components/Field';
import SelectField from '../../../components/SelectField';
import Modal from '../../../components/Modal';
import Spinner from '../../../components/Spinner';
import ProductEsgProfilesModal from './ProductEsgProfilesModal';

const typeLabels = {
  PHYSICAL_GOOD: 'Physical good',
  SERVICE: 'Service',
};

const statusStyles = {
  ACTIVE: 'bg-primary-500/15 text-primary-400',
  INACTIVE: 'bg-white/5 text-ink-400',
};

const ProductsPanel = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [profilesFor, setProfilesFor] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [productData, categoryData] = await Promise.all([listProducts(), listCategories('PRODUCT')]);
      setProducts(Array.isArray(productData) ? productData : []);
      setCategories(Array.isArray(categoryData) ? categoryData : []);
    } catch {
      toast.error('Could not load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    Promise.all([listProducts(), listCategories('PRODUCT')])
      .then(([productData, categoryData]) => {
        if (cancelled) return;
        setProducts(Array.isArray(productData) ? productData : []);
        setCategories(Array.isArray(categoryData) ? categoryData : []);
      })
      .catch(() => {
        if (!cancelled) toast.error('Could not load products');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const isEditing = Boolean(editing);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(isEditing ? updateProductSchema : createProductSchema) });

  const openCreate = () => {
    setEditing(null);
    reset({ name: '', code: '', type: 'PHYSICAL_GOOD', categoryId: '', description: '' });
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    reset({
      name: product.name,
      code: product.code,
      type: product.type,
      categoryId: product.categoryId ?? '',
      description: product.description ?? '',
      status: product.status,
    });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (isEditing) {
        await updateProduct(editing.id, data);
        toast.success('Product updated');
      } else {
        await createProduct(data);
        toast.success('Product created');
      }
      setModalOpen(false);
      fetchAll();
    } catch (error) {
      toast.error(error?.response?.data?.message ?? 'Could not save product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-ink-400">Products and their ESG profile history.</p>
        <Button size="sm" variant="primary" onClick={openCreate}>
          <Plus size={16} /> New Product
        </Button>
      </div>

      <Card className="!p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : products.length === 0 ? (
          <p className="p-6 text-sm text-ink-400">No products yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-ink-600">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Code</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-border-subtle">
                  <td className="px-6 py-3 text-ink-50">{p.name}</td>
                  <td className="px-6 py-3 text-ink-300">{p.code}</td>
                  <td className="px-6 py-3 text-ink-300">{typeLabels[p.type] ?? p.type}</td>
                  <td className="px-6 py-3 text-ink-300">{p.category?.name ?? '—'}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[p.status] ?? statusStyles.INACTIVE}`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => setProfilesFor(p)}
                        title="ESG profiles"
                        className="cursor-pointer rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-white/5 hover:text-primary-400"
                      >
                        <Leaf size={15} />
                      </button>
                      <button
                        onClick={() => openEdit(p)}
                        title="Edit"
                        className="cursor-pointer rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-white/5 hover:text-ink-50"
                      >
                        <Pencil size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? 'Edit product' : 'New product'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Field
            label="Name"
            type="text"
            placeholder="Recycled Paper Ream"
            error={errors.name?.message}
            {...register('name')}
          />
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Code"
              type="text"
              placeholder="PROD-001"
              error={errors.code?.message}
              {...register('code')}
            />
            <SelectField label="Type" error={errors.type?.message} {...register('type')}>
              <option value="PHYSICAL_GOOD">Physical good</option>
              <option value="SERVICE">Service</option>
            </SelectField>
          </div>
          <SelectField label="Category (optional)" error={errors.categoryId?.message} {...register('categoryId')}>
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </SelectField>
          <Field
            label="Description (optional)"
            type="text"
            placeholder="Short description"
            error={errors.description?.message}
            {...register('description')}
          />
          {isEditing && (
            <SelectField label="Status" error={errors.status?.message} {...register('status')}>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </SelectField>
          )}

          <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
            {submitting ? 'Saving...' : isEditing ? 'Save changes' : 'Create product'}
          </Button>
        </form>
      </Modal>

      <ProductEsgProfilesModal
        key={profilesFor?.id}
        product={profilesFor}
        open={Boolean(profilesFor)}
        onClose={() => setProfilesFor(null)}
      />
    </div>
  );
};

export default ProductsPanel;
