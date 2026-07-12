import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Check, HandHeart, Pencil, Plus, X } from 'lucide-react';
import { createCsrActivity, listCsrActivities, updateCsrActivity } from '../../api/csrActivities';
import {
  createParticipation,
  listParticipations,
  reviewParticipation,
} from '../../api/employeeParticipations';
import { listDepartments } from '../../api/departments';
import { listCategories } from '../../api/categories';
import {
  createCsrActivitySchema,
  createParticipationSchema,
  updateCsrActivitySchema,
} from '../../lib/validation';
import { toDateInputValue } from '../../lib/date';
import { useAuth } from '../../context/useAuth';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Field from '../../components/Field';
import SelectField from '../../components/SelectField';
import Modal from '../../components/Modal';
import Spinner from '../../components/Spinner';

const statusStyles = {
  ACTIVE: 'bg-primary-500/15 text-primary-400',
  INACTIVE: 'bg-white/5 text-ink-400',
  PENDING: 'bg-accent-500/15 text-accent-400',
  APPROVED: 'bg-primary-500/15 text-primary-400',
  REJECTED: 'bg-danger-500/15 text-danger-400',
};

const ActivitiesTab = ({ isAdmin, myParticipations, onParticipated }) => {
  const [activities, setActivities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [joinTarget, setJoinTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const data = await listCsrActivities();
      setActivities(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Could not load CSR activities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    listCsrActivities()
      .then((actData) => {
        if (!cancelled) setActivities(Array.isArray(actData) ? actData : []);
      })
      .catch(() => {
        if (!cancelled) toast.error('Could not load CSR activities');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    Promise.all([listDepartments(), listCategories('CSR_ACTIVITY')])
      .then(([deptData, catData]) => {
        if (cancelled) return;
        setDepartments(Array.isArray(deptData) ? deptData : []);
        setCategories(Array.isArray(catData) ? catData : []);
      })
      .catch(() => {
        if (!cancelled) toast.error('Could not load departments/categories');
      });
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const isEditing = Boolean(editing);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(isEditing ? updateCsrActivitySchema : createCsrActivitySchema) });

  const openCreate = () => {
    setEditing(null);
    reset({ title: '', description: '', categoryId: '', departmentId: '', pointsValue: '', startDate: '', endDate: '' });
    setModalOpen(true);
  };

  const openEdit = (activity) => {
    setEditing(activity);
    reset({
      title: activity.title,
      description: activity.description ?? '',
      categoryId: activity.categoryId ?? '',
      departmentId: activity.departmentId ?? '',
      pointsValue: activity.pointsValue,
      startDate: toDateInputValue(activity.startDate),
      endDate: toDateInputValue(activity.endDate),
      status: activity.status,
    });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (isEditing) {
        await updateCsrActivity(editing.id, data);
        toast.success('CSR activity updated');
      } else {
        await createCsrActivity(data);
        toast.success('CSR activity created');
      }
      setModalOpen(false);
      fetchActivities();
    } catch (error) {
      toast.error(error?.response?.data?.message ?? 'Could not save CSR activity');
    } finally {
      setSubmitting(false);
    }
  };

  const {
    register: registerJoin,
    handleSubmit: handleJoinSubmit,
    reset: resetJoin,
    formState: { errors: joinErrors },
  } = useForm({ resolver: zodResolver(createParticipationSchema) });

  const openJoin = (activity) => {
    setJoinTarget(activity);
    resetJoin({ csrActivityId: activity.id, proof: '', completionDate: '' });
  };

  const onJoinSubmit = async (data) => {
    setSubmitting(true);
    try {
      await createParticipation(data);
      toast.success('Participation submitted');
      setJoinTarget(null);
      onParticipated();
    } catch (error) {
      toast.error(error?.response?.data?.message ?? 'Could not submit participation');
    } finally {
      setSubmitting(false);
    }
  };

  const participatedIds = new Set(myParticipations.map((p) => p.csrActivityId ?? p.csrActivity?.id));

  return (
    <div>
      {isAdmin && (
        <div className="mb-4 flex justify-end">
          <Button size="sm" variant="primary" onClick={openCreate}>
            <Plus size={16} /> New Activity
          </Button>
        </div>
      )}

      <Card className="!p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : activities.length === 0 ? (
          <p className="p-6 text-sm text-ink-400">No CSR activities yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-ink-600">
                <th className="px-6 py-3 font-medium">Title</th>
                <th className="px-6 py-3 font-medium">Points</th>
                <th className="px-6 py-3 font-medium">Dates</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {activities.map((a) => (
                <tr key={a.id} className="border-t border-border-subtle">
                  <td className="px-6 py-3 text-ink-50">{a.title}</td>
                  <td className="px-6 py-3 text-ink-300">{a.pointsValue}</td>
                  <td className="px-6 py-3 text-ink-300">
                    {toDateInputValue(a.startDate)} &rarr; {a.endDate ? toDateInputValue(a.endDate) : 'Ongoing'}
                  </td>
                  <td className="px-6 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[a.status]}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      {a.status === 'ACTIVE' && !participatedIds.has(a.id) && (
                        <button
                          onClick={() => openJoin(a)}
                          title="Submit participation"
                          className="cursor-pointer rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-white/5 hover:text-primary-400"
                        >
                          <HandHeart size={15} />
                        </button>
                      )}
                      {isAdmin && (
                        <button
                          onClick={() => openEdit(a)}
                          title="Edit"
                          className="cursor-pointer rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-white/5 hover:text-ink-50"
                        >
                          <Pencil size={15} />
                        </button>
                      )}
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
        title={isEditing ? 'Edit CSR activity' : 'New CSR activity'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Field label="Title" type="text" placeholder="Beach Cleanup" error={errors.title?.message} {...register('title')} />
          <Field
            label="Description (optional)"
            type="text"
            placeholder="Short description"
            error={errors.description?.message}
            {...register('description')}
          />
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Category (optional)" error={errors.categoryId?.message} {...register('categoryId')}>
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </SelectField>
            <SelectField label="Department (optional)" error={errors.departmentId?.message} {...register('departmentId')}>
              <option value="">Organization-wide</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </SelectField>
          </div>
          <Field
            label="Points value"
            type="number"
            error={errors.pointsValue?.message}
            {...register('pointsValue')}
          />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Start date" type="date" error={errors.startDate?.message} {...register('startDate')} />
            <Field
              label="End date (optional)"
              type="date"
              error={errors.endDate?.message}
              {...register('endDate')}
            />
          </div>
          {isEditing && (
            <SelectField label="Status" error={errors.status?.message} {...register('status')}>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </SelectField>
          )}

          <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
            {submitting ? 'Saving...' : isEditing ? 'Save changes' : 'Create activity'}
          </Button>
        </form>
      </Modal>

      <Modal open={Boolean(joinTarget)} onClose={() => setJoinTarget(null)} title={`Participate — ${joinTarget?.title}`}>
        <form onSubmit={handleJoinSubmit(onJoinSubmit)} className="space-y-4" noValidate>
          <Field
            label="Proof (optional link or note)"
            type="text"
            placeholder="Link to photo/document"
            error={joinErrors.proof?.message}
            {...registerJoin('proof')}
          />
          <Field
            label="Completion date"
            type="date"
            error={joinErrors.completionDate?.message}
            {...registerJoin('completionDate')}
          />
          <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit participation'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

const MyParticipationsTab = ({ participations, loading }) => (
  <Card className="!p-0 overflow-hidden">
    {loading ? (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    ) : participations.length === 0 ? (
      <p className="p-6 text-sm text-ink-400">You haven&apos;t submitted any participations yet.</p>
    ) : (
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-xs uppercase tracking-wide text-ink-600">
            <th className="px-6 py-3 font-medium">Activity</th>
            <th className="px-6 py-3 font-medium">Completed</th>
            <th className="px-6 py-3 font-medium">Points earned</th>
            <th className="px-6 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {participations.map((p) => (
            <tr key={p.id} className="border-t border-border-subtle">
              <td className="px-6 py-3 text-ink-50">{p.csrActivity?.title}</td>
              <td className="px-6 py-3 text-ink-300">{toDateInputValue(p.completionDate)}</td>
              <td className="px-6 py-3 text-ink-300">{p.pointsEarned ?? '—'}</td>
              <td className="px-6 py-3">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[p.approvalStatus]}`}>
                  {p.approvalStatus}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </Card>
);

const ReviewQueueTab = ({ onReviewed }) => {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const fetchPending = () => {
    setLoading(true);
    listParticipations({ approvalStatus: 'PENDING' })
      .then((data) => setPending(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Could not load review queue'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let cancelled = false;
    listParticipations({ approvalStatus: 'PENDING' })
      .then((data) => {
        if (!cancelled) setPending(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) toast.error('Could not load review queue');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleReview = async (id, approvalStatus) => {
    setBusyId(id);
    try {
      await reviewParticipation(id, { approvalStatus });
      toast.success(approvalStatus === 'APPROVED' ? 'Participation approved' : 'Participation rejected');
      fetchPending();
      onReviewed();
    } catch (error) {
      toast.error(error?.response?.data?.message ?? 'Could not review participation');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Card className="!p-0 overflow-hidden">
      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : pending.length === 0 ? (
        <p className="p-6 text-sm text-ink-400">Nothing pending review.</p>
      ) : (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-ink-600">
              <th className="px-6 py-3 font-medium">Employee</th>
              <th className="px-6 py-3 font-medium">Activity</th>
              <th className="px-6 py-3 font-medium">Proof</th>
              <th className="px-6 py-3 font-medium">Completed</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody>
            {pending.map((p) => (
              <tr key={p.id} className="border-t border-border-subtle">
                <td className="px-6 py-3 text-ink-50">{p.employee?.username ?? p.employee?.email}</td>
                <td className="px-6 py-3 text-ink-300">{p.csrActivity?.title}</td>
                <td className="px-6 py-3 text-ink-300">{p.proof || '—'}</td>
                <td className="px-6 py-3 text-ink-300">{toDateInputValue(p.completionDate)}</td>
                <td className="px-6 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <button
                      disabled={busyId === p.id}
                      onClick={() => handleReview(p.id, 'APPROVED')}
                      className="cursor-pointer rounded-lg p-1.5 text-primary-400 transition-colors hover:bg-primary-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      disabled={busyId === p.id}
                      onClick={() => handleReview(p.id, 'REJECTED')}
                      className="cursor-pointer rounded-lg p-1.5 text-danger-400 transition-colors hover:bg-danger-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
};

const Social = () => {
  const { isAdmin } = useAuth();
  const [tab, setTab] = useState('activities');
  const [myParticipations, setMyParticipations] = useState([]);
  const [myLoading, setMyLoading] = useState(true);

  const fetchMine = () => {
    setMyLoading(true);
    listParticipations()
      .then((data) => setMyParticipations(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Could not load your participations'))
      .finally(() => setMyLoading(false));
  };

  useEffect(() => {
    let cancelled = false;
    listParticipations()
      .then((data) => {
        if (!cancelled) setMyParticipations(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) toast.error('Could not load your participations');
      })
      .finally(() => {
        if (!cancelled) setMyLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const tabs = [
    { id: 'activities', label: 'Activities' },
    { id: 'my-participation', label: 'My Participation' },
    ...(isAdmin ? [{ id: 'review', label: 'Review Queue' }] : []),
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-ink-50">Social</h1>
        <p className="text-sm text-ink-400">CSR activities and employee participation.</p>
      </div>

      <div className="mb-6 flex gap-1 border-b border-border-subtle">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`cursor-pointer border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t.id ? 'border-primary-500 text-primary-400' : 'border-transparent text-ink-400 hover:text-ink-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'activities' && (
        <ActivitiesTab isAdmin={isAdmin} myParticipations={myParticipations} onParticipated={fetchMine} />
      )}
      {tab === 'my-participation' && <MyParticipationsTab participations={myParticipations} loading={myLoading} />}
      {tab === 'review' && isAdmin && <ReviewQueueTab onReviewed={fetchMine} />}
    </div>
  );
};

export default Social;
