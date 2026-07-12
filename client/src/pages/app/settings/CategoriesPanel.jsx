import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Pencil, Plus } from 'lucide-react';
import { createCategory, listCategories, updateCategory } from '../../../api/categories';
import { createCategorySchema, updateCategorySchema } from '../../../lib/validation';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Field from '../../../components/Field';
import SelectField from '../../../components/SelectField';
import Modal from '../../../components/Modal';
import Spinner from '../../../components/Spinner';

const typeLabels = {
  CSR_ACTIVITY: 'CSR Activity',
  CHALLENGE: 'Challenge',
  PRODUCT: 'Product',
};

const statusStyles = {
  ACTIVE: 'bg-primary-500/15 text-primary-400',
  INACTIVE: 'bg-white/5 text-ink-400',
};

const filters = [
  { value: undefined, label: 'All' },
  { value: 'CSR_ACTIVITY', label: 'CSR Activity' },
  { value: 'CHALLENGE', label: 'Challenge' },
  { value: 'PRODUCT', label: 'Product' },
];

const CategoriesPanel = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async (type) => {
    setLoading(true);
    try {
      const data = await listCategories(type);
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Could not load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    listCategories(typeFilter)
      .then((data) => {
        if (!cancelled) setCategories(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) toast.error('Could not load categories');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [typeFilter]);

  const isEditing = Boolean(editing);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(isEditing ? updateCategorySchema : createCategorySchema),
  });

  const openCreate = () => {
    setEditing(null);
    reset({ name: '', type: 'CSR_ACTIVITY' });
    setModalOpen(true);
  };

  const openEdit = (category) => {
    setEditing(category);
    reset({ name: category.name, status: category.status });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (isEditing) {
        await updateCategory(editing.id, data);
        toast.success('Category updated');
      } else {
        await createCategory(data);
        toast.success('Category created');
      }
      setModalOpen(false);
      fetchCategories(typeFilter);
    } catch (error) {
      toast.error(error?.response?.data?.message ?? 'Could not save category');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f.label}
              onClick={() => setTypeFilter(f.value)}
              className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                typeFilter === f.value
                  ? 'bg-primary-500/15 text-primary-400'
                  : 'text-ink-400 hover:bg-white/5 hover:text-ink-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <Button size="sm" variant="primary" onClick={openCreate}>
          <Plus size={16} /> New Category
        </Button>
      </div>

      <Card className="!p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : categories.length === 0 ? (
          <p className="p-6 text-sm text-ink-400">No categories yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-ink-600">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="border-t border-border-subtle">
                  <td className="px-6 py-3 text-ink-50">{c.name}</td>
                  <td className="px-6 py-3 text-ink-300">{typeLabels[c.type] ?? c.type}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[c.status] ?? statusStyles.INACTIVE}`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => openEdit(c)}
                      className="cursor-pointer rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-white/5 hover:text-ink-50"
                    >
                      <Pencil size={15} />
                    </button>
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
        title={isEditing ? 'Edit category' : 'New category'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Field
            label="Name"
            type="text"
            placeholder="Tree Plantation Drive"
            error={errors.name?.message}
            {...register('name')}
          />
          {isEditing ? (
            <SelectField label="Status" error={errors.status?.message} {...register('status')}>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </SelectField>
          ) : (
            <SelectField label="Type" error={errors.type?.message} {...register('type')}>
              <option value="CSR_ACTIVITY">CSR Activity</option>
              <option value="CHALLENGE">Challenge</option>
              <option value="PRODUCT">Product</option>
            </SelectField>
          )}

          <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
            {submitting ? 'Saving...' : isEditing ? 'Save changes' : 'Create category'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default CategoriesPanel;
