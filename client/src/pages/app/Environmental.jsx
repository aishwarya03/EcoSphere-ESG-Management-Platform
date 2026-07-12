import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Pencil, Play, Plus, Sparkles } from 'lucide-react';
import {
  createCarbonTransaction,
  getEmissionsSummaryByDepartment,
  listCarbonTransactions,
  updateCarbonTransaction,
} from '../../api/carbonTransactions';
import {
  listOperationalRecords,
  processPendingRecords,
  seedDemoData,
} from '../../api/operationalRecords';
import { listDepartments } from '../../api/departments';
import { listEmissionFactors } from '../../api/emissionFactors';
import { carbonTransactionSchema } from '../../lib/validation';
import { toDateInputValue } from '../../lib/date';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Field from '../../components/Field';
import SelectField from '../../components/SelectField';
import Modal from '../../components/Modal';
import Spinner from '../../components/Spinner';

const Environmental = () => {
  const [transactions, setTransactions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [factors, setFactors] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [pendingRecords, setPendingRecords] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [txData, deptData, factorData, summaryData, pendingData] = await Promise.all([
        listCarbonTransactions(),
        listDepartments(),
        listEmissionFactors({ status: 'ACTIVE' }),
        getEmissionsSummaryByDepartment(),
        listOperationalRecords({ processed: false }),
      ]);
      setTransactions(Array.isArray(txData) ? txData : []);
      setDepartments(Array.isArray(deptData) ? deptData : []);
      setFactors(Array.isArray(factorData) ? factorData : []);
      setSummary(Array.isArray(summaryData) ? summaryData : []);
      setPendingRecords(Array.isArray(pendingData) ? pendingData : []);
    } catch {
      toast.error('Could not load environmental data');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDemo = async () => {
    setSeeding(true);
    try {
      await seedDemoData();
      toast.success('Demo operational data seeded');
      fetchAll();
    } catch (error) {
      toast.error(error?.response?.data?.message ?? 'Could not seed demo data');
    } finally {
      setSeeding(false);
    }
  };

  const handleProcessPending = async () => {
    setProcessing(true);
    try {
      const result = await processPendingRecords();
      toast.success(`Processed ${result?.processed?.length ?? 0} record(s) into carbon transactions`);
      fetchAll();
    } catch (error) {
      toast.error(error?.response?.data?.message ?? 'Could not process pending records');
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      listCarbonTransactions(),
      listDepartments(),
      listEmissionFactors({ status: 'ACTIVE' }),
      getEmissionsSummaryByDepartment(),
      listOperationalRecords({ processed: false }),
    ])
      .then(([txData, deptData, factorData, summaryData, pendingData]) => {
        if (cancelled) return;
        setTransactions(Array.isArray(txData) ? txData : []);
        setDepartments(Array.isArray(deptData) ? deptData : []);
        setFactors(Array.isArray(factorData) ? factorData : []);
        setSummary(Array.isArray(summaryData) ? summaryData : []);
        setPendingRecords(Array.isArray(pendingData) ? pendingData : []);
      })
      .catch(() => {
        if (!cancelled) toast.error('Could not load environmental data');
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
  } = useForm({ resolver: zodResolver(carbonTransactionSchema) });

  const openCreate = () => {
    setEditing(null);
    reset({ departmentId: '', emissionFactorId: '', quantity: '', transactionDate: '', notes: '' });
    setModalOpen(true);
  };

  const openEdit = (tx) => {
    setEditing(tx);
    reset({
      departmentId: tx.departmentId ?? '',
      emissionFactorId: tx.emissionFactorId,
      quantity: tx.quantity,
      transactionDate: toDateInputValue(tx.transactionDate),
      notes: tx.notes ?? '',
    });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (isEditing) {
        await updateCarbonTransaction(editing.id, data);
        toast.success('Carbon transaction updated');
      } else {
        await createCarbonTransaction(data);
        toast.success('Carbon transaction logged');
      }
      setModalOpen(false);
      fetchAll();
    } catch (error) {
      toast.error(error?.response?.data?.message ?? 'Could not save carbon transaction');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink-50">Environmental</h1>
          <p className="text-sm text-ink-400">Carbon accounting from operational data.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={handleSeedDemo} disabled={seeding}>
            <Sparkles size={16} /> {seeding ? 'Seeding...' : 'Seed Demo Data'}
          </Button>
          <Button size="sm" variant="primary" onClick={handleProcessPending} disabled={processing || pendingRecords.length === 0}>
            <Play size={16} />
            {processing ? 'Processing...' : `Process Pending (${pendingRecords.length})`}
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <h2 className="mb-4 font-heading text-sm font-semibold text-ink-50">Emissions by department</h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(248,250,252,0.06)" />
                <XAxis dataKey="departmentCode" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: '#131f38', border: '1px solid rgba(248,250,252,0.08)' }}
                  labelStyle={{ color: '#f8fafc' }}
                />
                <Bar dataKey="totalEmissionsKgCo2e" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-sm font-semibold text-ink-50">Carbon transactions</h2>
        <Button size="sm" variant="primary" onClick={openCreate}>
          <Plus size={16} /> New Transaction
        </Button>
      </div>

      <Card className="!p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : transactions.length === 0 ? (
          <p className="p-6 text-sm text-ink-400">No carbon transactions yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-ink-600">
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Department</th>
                <th className="px-6 py-3 font-medium">Emission Factor</th>
                <th className="px-6 py-3 font-medium">Quantity</th>
                <th className="px-6 py-3 font-medium">CO&#8322;e (kg)</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-t border-border-subtle">
                  <td className="px-6 py-3 text-ink-300">{toDateInputValue(tx.transactionDate)}</td>
                  <td className="px-6 py-3 text-ink-300">{tx.department?.name ?? 'Org-wide'}</td>
                  <td className="px-6 py-3 text-ink-300">{tx.emissionFactor?.name}</td>
                  <td className="px-6 py-3 text-ink-300">
                    {tx.quantity} {tx.emissionFactor?.unit}
                  </td>
                  <td className="px-6 py-3 font-medium text-ink-50">
                    {tx.calculatedEmissionsKgCo2e?.toFixed(2)}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => openEdit(tx)}
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
        title={isEditing ? 'Edit carbon transaction' : 'Log carbon transaction'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <SelectField
            label="Emission factor"
            error={errors.emissionFactorId?.message}
            {...register('emissionFactorId')}
          >
            <option value="">Select an emission factor</option>
            {factors.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.unit})
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Department (optional)"
            error={errors.departmentId?.message}
            {...register('departmentId')}
          >
            <option value="">Organization-wide</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </SelectField>
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Quantity"
              type="number"
              step="any"
              error={errors.quantity?.message}
              {...register('quantity')}
            />
            <Field
              label="Transaction date"
              type="date"
              error={errors.transactionDate?.message}
              {...register('transactionDate')}
            />
          </div>
          <Field
            label="Notes (optional)"
            type="text"
            placeholder="Additional context"
            error={errors.notes?.message}
            {...register('notes')}
          />

          <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
            {submitting ? 'Saving...' : isEditing ? 'Save changes' : 'Log transaction'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default Environmental;
