import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Check, Pencil, Plus, Trophy, X } from 'lucide-react';
import { createChallenge, listChallenges, updateChallenge } from '../../api/challenges';
import {
  createChallengeParticipation,
  listChallengeParticipations,
  reviewChallengeParticipation,
  updateOwnChallengeParticipation,
} from '../../api/challengeParticipations';
import { listCategories } from '../../api/categories';
import {
  challengeSchema,
  createChallengeParticipationSchema,
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
  DRAFT: 'bg-white/5 text-ink-400',
  ACTIVE: 'bg-primary-500/15 text-primary-400',
  UNDER_REVIEW: 'bg-accent-500/15 text-accent-400',
  COMPLETED: 'bg-blue-400/15 text-blue-400',
  ARCHIVED: 'bg-white/5 text-ink-400',
  PENDING: 'bg-accent-500/15 text-accent-400',
  APPROVED: 'bg-primary-500/15 text-primary-400',
  REJECTED: 'bg-danger-500/15 text-danger-400',
};

const difficultyStyles = {
  EASY: 'text-primary-400',
  MEDIUM: 'text-accent-400',
  HARD: 'text-danger-400',
};

const ChallengesTab = ({ isAdmin, myParticipations, onParticipated }) => {
  const [challenges, setChallenges] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [joinTarget, setJoinTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const data = await listChallenges();
      setChallenges(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Could not load challenges');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    listChallenges()
      .then((chData) => {
        if (!cancelled) setChallenges(Array.isArray(chData) ? chData : []);
      })
      .catch(() => {
        if (!cancelled) toast.error('Could not load challenges');
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
    listCategories('CHALLENGE')
      .then((catData) => {
        if (!cancelled) setCategories(Array.isArray(catData) ? catData : []);
      })
      .catch(() => {
        if (!cancelled) toast.error('Could not load categories');
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
  } = useForm({ resolver: zodResolver(challengeSchema) });

  const openCreate = () => {
    setEditing(null);
    reset({
      title: '', description: '', categoryId: '', xp: '', difficulty: 'EASY',
      evidenceRequired: false, deadline: '', status: 'DRAFT',
    });
    setModalOpen(true);
  };

  const openEdit = (challenge) => {
    setEditing(challenge);
    reset({
      title: challenge.title,
      description: challenge.description ?? '',
      categoryId: challenge.categoryId ?? '',
      xp: challenge.xp,
      difficulty: challenge.difficulty,
      evidenceRequired: challenge.evidenceRequired,
      deadline: toDateInputValue(challenge.deadline),
      status: challenge.status,
    });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (isEditing) {
        await updateChallenge(editing.id, data);
        toast.success('Challenge updated');
      } else {
        await createChallenge(data);
        toast.success('Challenge created');
      }
      setModalOpen(false);
      fetchChallenges();
    } catch (error) {
      toast.error(error?.response?.data?.message ?? 'Could not save challenge');
    } finally {
      setSubmitting(false);
    }
  };

  const {
    register: registerJoin,
    handleSubmit: handleJoinSubmit,
    reset: resetJoin,
    formState: { errors: joinErrors },
  } = useForm({ resolver: zodResolver(createChallengeParticipationSchema) });

  const openJoin = (challenge) => {
    setJoinTarget(challenge);
    resetJoin({ challengeId: challenge.id, proof: '', progress: 0 });
  };

  const onJoinSubmit = async (data) => {
    setSubmitting(true);
    try {
      await createChallengeParticipation(data);
      toast.success('Joined challenge');
      setJoinTarget(null);
      onParticipated();
    } catch (error) {
      toast.error(error?.response?.data?.message ?? 'Could not join challenge');
    } finally {
      setSubmitting(false);
    }
  };

  const participatedIds = new Set(myParticipations.map((p) => p.challengeId ?? p.challenge?.id));

  return (
    <div>
      {isAdmin && (
        <div className="mb-4 flex justify-end">
          <Button size="sm" variant="primary" onClick={openCreate}>
            <Plus size={16} /> New Challenge
          </Button>
        </div>
      )}

      <Card className="!p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : challenges.length === 0 ? (
          <p className="p-6 text-sm text-ink-400">No challenges yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-ink-600">
                <th className="px-6 py-3 font-medium">Title</th>
                <th className="px-6 py-3 font-medium">XP</th>
                <th className="px-6 py-3 font-medium">Difficulty</th>
                <th className="px-6 py-3 font-medium">Deadline</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {challenges.map((c) => (
                <tr key={c.id} className="border-t border-border-subtle">
                  <td className="px-6 py-3 text-ink-50">{c.title}</td>
                  <td className="px-6 py-3 text-ink-300">{c.xp}</td>
                  <td className={`px-6 py-3 font-medium ${difficultyStyles[c.difficulty]}`}>{c.difficulty}</td>
                  <td className="px-6 py-3 text-ink-300">{toDateInputValue(c.deadline)}</td>
                  <td className="px-6 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[c.status]}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      {c.status === 'ACTIVE' && !participatedIds.has(c.id) && (
                        <button
                          onClick={() => openJoin(c)}
                          title="Join challenge"
                          className="cursor-pointer rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-white/5 hover:text-primary-400"
                        >
                          <Trophy size={15} />
                        </button>
                      )}
                      {isAdmin && (
                        <button
                          onClick={() => openEdit(c)}
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={isEditing ? 'Edit challenge' : 'New challenge'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Field label="Title" type="text" placeholder="Zero Waste Week" error={errors.title?.message} {...register('title')} />
          <Field
            label="Description (optional)"
            type="text"
            placeholder="Short description"
            error={errors.description?.message}
            {...register('description')}
          />
          <SelectField label="Category (optional)" error={errors.categoryId?.message} {...register('categoryId')}>
            <option value="">No category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </SelectField>
          <div className="grid grid-cols-2 gap-4">
            <Field label="XP" type="number" error={errors.xp?.message} {...register('xp')} />
            <SelectField label="Difficulty" error={errors.difficulty?.message} {...register('difficulty')}>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </SelectField>
          </div>
          <Field label="Deadline" type="date" error={errors.deadline?.message} {...register('deadline')} />
          <SelectField label="Status" error={errors.status?.message} {...register('status')}>
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="COMPLETED">Completed</option>
            <option value="ARCHIVED">Archived</option>
          </SelectField>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-200">
            <input type="checkbox" className="h-4 w-4 cursor-pointer rounded accent-primary-500" {...register('evidenceRequired')} />
            Evidence (proof) required for approval
          </label>

          <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
            {submitting ? 'Saving...' : isEditing ? 'Save changes' : 'Create challenge'}
          </Button>
        </form>
      </Modal>

      <Modal open={Boolean(joinTarget)} onClose={() => setJoinTarget(null)} title={`Join — ${joinTarget?.title}`}>
        <form onSubmit={handleJoinSubmit(onJoinSubmit)} className="space-y-4" noValidate>
          <Field
            label="Proof (optional link or note)"
            type="text"
            placeholder="Link to photo/document"
            error={joinErrors.proof?.message}
            {...registerJoin('proof')}
          />
          <Field
            label="Progress % (optional)"
            type="number"
            min={0}
            max={100}
            error={joinErrors.progress?.message}
            {...registerJoin('progress')}
          />
          <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
            {submitting ? 'Joining...' : 'Join challenge'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

const MyParticipationsTab = ({ participations, loading, onUpdated }) => {
  const [editTarget, setEditTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const openEdit = (p) => {
    setEditTarget(p);
    reset({ proof: p.proof ?? '', progress: p.progress ?? 0 });
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await updateOwnChallengeParticipation(editTarget.id, {
        proof: data.proof,
        progress: data.progress === '' ? undefined : Number(data.progress),
      });
      toast.success('Progress updated');
      setEditTarget(null);
      onUpdated();
    } catch (error) {
      toast.error(error?.response?.data?.message ?? 'Could not update progress');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="!p-0 overflow-hidden">
      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : participations.length === 0 ? (
        <p className="p-6 text-sm text-ink-400">You haven&apos;t joined any challenges yet.</p>
      ) : (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-ink-600">
              <th className="px-6 py-3 font-medium">Challenge</th>
              <th className="px-6 py-3 font-medium">Progress</th>
              <th className="px-6 py-3 font-medium">XP awarded</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody>
            {participations.map((p) => (
              <tr key={p.id} className="border-t border-border-subtle">
                <td className="px-6 py-3 text-ink-50">{p.challenge?.title}</td>
                <td className="px-6 py-3 text-ink-300">{p.progress}%</td>
                <td className="px-6 py-3 text-ink-300">{p.xpAwarded ?? '—'}</td>
                <td className="px-6 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[p.approvalStatus]}`}>
                    {p.approvalStatus}
                  </span>
                </td>
                <td className="px-6 py-3 text-right">
                  {p.approvalStatus === 'PENDING' && (
                    <button
                      onClick={() => openEdit(p)}
                      className="cursor-pointer rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-white/5 hover:text-ink-50"
                    >
                      <Pencil size={15} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal open={Boolean(editTarget)} onClose={() => setEditTarget(null)} title="Update progress">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Field label="Proof (optional)" type="text" error={errors.proof?.message} {...register('proof')} />
          <Field label="Progress %" type="number" min={0} max={100} error={errors.progress?.message} {...register('progress')} />
          <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save progress'}
          </Button>
        </form>
      </Modal>
    </Card>
  );
};

const ReviewQueueTab = ({ onReviewed }) => {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const fetchPending = () => {
    setLoading(true);
    listChallengeParticipations({ approvalStatus: 'PENDING' })
      .then((data) => setPending(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Could not load review queue'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let cancelled = false;
    listChallengeParticipations({ approvalStatus: 'PENDING' })
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
      await reviewChallengeParticipation(id, { approvalStatus });
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
              <th className="px-6 py-3 font-medium">Challenge</th>
              <th className="px-6 py-3 font-medium">Progress</th>
              <th className="px-6 py-3 font-medium">Proof</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody>
            {pending.map((p) => (
              <tr key={p.id} className="border-t border-border-subtle">
                <td className="px-6 py-3 text-ink-50">{p.employee?.username ?? p.employee?.email}</td>
                <td className="px-6 py-3 text-ink-300">{p.challenge?.title}</td>
                <td className="px-6 py-3 text-ink-300">{p.progress}%</td>
                <td className="px-6 py-3 text-ink-300">{p.proof || '—'}</td>
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

const Gamification = () => {
  const { isAdmin } = useAuth();
  const [tab, setTab] = useState('challenges');
  const [myParticipations, setMyParticipations] = useState([]);
  const [myLoading, setMyLoading] = useState(true);

  const fetchMine = () => {
    setMyLoading(true);
    listChallengeParticipations()
      .then((data) => setMyParticipations(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Could not load your participations'))
      .finally(() => setMyLoading(false));
  };

  useEffect(() => {
    let cancelled = false;
    listChallengeParticipations()
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
    { id: 'challenges', label: 'Challenges' },
    { id: 'my-participation', label: 'My Participation' },
    ...(isAdmin ? [{ id: 'review', label: 'Review Queue' }] : []),
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-ink-50">Gamification</h1>
        <p className="text-sm text-ink-400">Challenges, XP and department competition.</p>
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

      {tab === 'challenges' && (
        <ChallengesTab isAdmin={isAdmin} myParticipations={myParticipations} onParticipated={fetchMine} />
      )}
      {tab === 'my-participation' && (
        <MyParticipationsTab participations={myParticipations} loading={myLoading} onUpdated={fetchMine} />
      )}
      {tab === 'review' && isAdmin && <ReviewQueueTab onReviewed={fetchMine} />}
    </div>
  );
};

export default Gamification;
