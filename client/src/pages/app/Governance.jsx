import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { CheckCircle2, Pencil, Plus, Users } from 'lucide-react';
import { createAudit, listAudits, updateAudit } from '../../api/audits';
import { createComplianceIssue, listComplianceIssues, updateComplianceIssue } from '../../api/complianceIssues';
import { listEsgPolicies } from '../../api/esgPolicies';
import {
  acknowledgePolicy,
  getMyAcknowledgement,
  listAcknowledgements,
} from '../../api/policyAcknowledgements';
import { listDepartments } from '../../api/departments';
import { listUsers } from '../../api/users';
import { auditSchema, complianceIssueSchema } from '../../lib/validation';
import { toDateInputValue } from '../../lib/date';
import { useAuth } from '../../context/useAuth';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Field from '../../components/Field';
import SelectField from '../../components/SelectField';
import Modal from '../../components/Modal';
import Spinner from '../../components/Spinner';

const auditStatusStyles = {
  PLANNED: 'bg-white/5 text-ink-400',
  IN_PROGRESS: 'bg-accent-500/15 text-accent-400',
  COMPLETED: 'bg-primary-500/15 text-primary-400',
};

const severityStyles = {
  LOW: 'bg-white/5 text-ink-400',
  MEDIUM: 'bg-accent-500/15 text-accent-400',
  HIGH: 'bg-danger-500/15 text-danger-400',
  CRITICAL: 'bg-danger-500/25 text-danger-400',
};

const issueStatusStyles = {
  OPEN: 'bg-danger-500/15 text-danger-400',
  IN_PROGRESS: 'bg-accent-500/15 text-accent-400',
  RESOLVED: 'bg-primary-500/15 text-primary-400',
  CLOSED: 'bg-white/5 text-ink-400',
};

const AuditsTab = ({ departments, onChanged }) => {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchAudits = async () => {
    setLoading(true);
    try {
      const data = await listAudits();
      setAudits(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Could not load audits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    listAudits()
      .then((data) => {
        if (!cancelled) setAudits(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) toast.error('Could not load audits');
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
  } = useForm({ resolver: zodResolver(auditSchema) });

  const openCreate = () => {
    setEditing(null);
    reset({ title: '', description: '', departmentId: '', auditor: '', auditDate: '', status: 'PLANNED', findingsSummary: '' });
    setModalOpen(true);
  };

  const openEdit = (audit) => {
    setEditing(audit);
    reset({
      title: audit.title,
      description: audit.description ?? '',
      departmentId: audit.departmentId ?? '',
      auditor: audit.auditor ?? '',
      auditDate: toDateInputValue(audit.auditDate),
      status: audit.status,
      findingsSummary: audit.findingsSummary ?? '',
    });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (isEditing) {
        await updateAudit(editing.id, data);
        toast.success('Audit updated');
      } else {
        await createAudit(data);
        toast.success('Audit created');
      }
      setModalOpen(false);
      fetchAudits();
      onChanged();
    } catch (error) {
      toast.error(error?.response?.data?.message ?? 'Could not save audit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button size="sm" variant="primary" onClick={openCreate}>
          <Plus size={16} /> New Audit
        </Button>
      </div>

      <Card className="!p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : audits.length === 0 ? (
          <p className="p-6 text-sm text-ink-400">No audits yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-ink-600">
                <th className="px-6 py-3 font-medium">Title</th>
                <th className="px-6 py-3 font-medium">Department</th>
                <th className="px-6 py-3 font-medium">Auditor</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {audits.map((a) => (
                <tr key={a.id} className="border-t border-border-subtle">
                  <td className="px-6 py-3 text-ink-50">{a.title}</td>
                  <td className="px-6 py-3 text-ink-300">{a.department?.name ?? 'Org-wide'}</td>
                  <td className="px-6 py-3 text-ink-300">{a.auditor ?? '—'}</td>
                  <td className="px-6 py-3 text-ink-300">{toDateInputValue(a.auditDate)}</td>
                  <td className="px-6 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${auditStatusStyles[a.status]}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => openEdit(a)}
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={isEditing ? 'Edit audit' : 'New audit'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Field label="Title" type="text" placeholder="Q3 Governance Audit" error={errors.title?.message} {...register('title')} />
          <Field
            label="Description (optional)"
            type="text"
            error={errors.description?.message}
            {...register('description')}
          />
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Department (optional)" error={errors.departmentId?.message} {...register('departmentId')}>
              <option value="">Organization-wide</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </SelectField>
            <Field label="Auditor (optional)" type="text" error={errors.auditor?.message} {...register('auditor')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Audit date" type="date" error={errors.auditDate?.message} {...register('auditDate')} />
            <SelectField label="Status" error={errors.status?.message} {...register('status')}>
              <option value="PLANNED">Planned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </SelectField>
          </div>
          <Field
            label="Findings summary (optional)"
            type="text"
            error={errors.findingsSummary?.message}
            {...register('findingsSummary')}
          />

          <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
            {submitting ? 'Saving...' : isEditing ? 'Save changes' : 'Create audit'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

const ComplianceIssuesTab = ({ audits, users }) => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const data = await listComplianceIssues();
      setIssues(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Could not load compliance issues');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    listComplianceIssues()
      .then((data) => {
        if (!cancelled) setIssues(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) toast.error('Could not load compliance issues');
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
  } = useForm({ resolver: zodResolver(complianceIssueSchema) });

  const openCreate = () => {
    setEditing(null);
    reset({ auditId: '', severity: 'MEDIUM', description: '', ownerId: '', dueDate: '', status: 'OPEN' });
    setModalOpen(true);
  };

  const openEdit = (issue) => {
    setEditing(issue);
    reset({
      auditId: issue.auditId,
      severity: issue.severity,
      description: issue.description,
      ownerId: issue.ownerId,
      dueDate: toDateInputValue(issue.dueDate),
      status: issue.status,
    });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (isEditing) {
        await updateComplianceIssue(editing.id, data);
        toast.success('Compliance issue updated');
      } else {
        await createComplianceIssue(data);
        toast.success('Compliance issue created');
      }
      setModalOpen(false);
      fetchIssues();
    } catch (error) {
      toast.error(error?.response?.data?.message ?? 'Could not save compliance issue');
    } finally {
      setSubmitting(false);
    }
  };

  const isOverdue = (issue) =>
    new Date(issue.dueDate) < new Date() && ['OPEN', 'IN_PROGRESS'].includes(issue.status);

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button size="sm" variant="primary" onClick={openCreate}>
          <Plus size={16} /> New Compliance Issue
        </Button>
      </div>

      <Card className="!p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : issues.length === 0 ? (
          <p className="p-6 text-sm text-ink-400">No compliance issues yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-ink-600">
                <th className="px-6 py-3 font-medium">Description</th>
                <th className="px-6 py-3 font-medium">Severity</th>
                <th className="px-6 py-3 font-medium">Owner</th>
                <th className="px-6 py-3 font-medium">Due date</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {issues.map((issue) => (
                <tr key={issue.id} className="border-t border-border-subtle">
                  <td className="max-w-xs truncate px-6 py-3 text-ink-50">{issue.description}</td>
                  <td className="px-6 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${severityStyles[issue.severity]}`}>
                      {issue.severity}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-ink-300">{issue.owner?.username ?? issue.owner?.email}</td>
                  <td className={`px-6 py-3 ${isOverdue(issue) ? 'font-semibold text-danger-400' : 'text-ink-300'}`}>
                    {toDateInputValue(issue.dueDate)} {isOverdue(issue) && '(overdue)'}
                  </td>
                  <td className="px-6 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${issueStatusStyles[issue.status]}`}>
                      {issue.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => openEdit(issue)}
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
        title={isEditing ? 'Edit compliance issue' : 'New compliance issue'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <SelectField label="Audit" error={errors.auditId?.message} {...register('auditId')}>
            <option value="">Select an audit</option>
            {audits.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}
          </SelectField>
          <Field label="Description" type="text" error={errors.description?.message} {...register('description')} />
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Severity" error={errors.severity?.message} {...register('severity')}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </SelectField>
            <SelectField label="Owner" error={errors.ownerId?.message} {...register('ownerId')}>
              <option value="">Select an owner</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username ?? u.email}
                </option>
              ))}
            </SelectField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Due date" type="date" error={errors.dueDate?.message} {...register('dueDate')} />
            <SelectField label="Status" error={errors.status?.message} {...register('status')}>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </SelectField>
          </div>

          <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
            {submitting ? 'Saving...' : isEditing ? 'Save changes' : 'Create issue'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

const PoliciesTab = ({ isAdmin }) => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [ackModal, setAckModal] = useState(null);
  const [ackList, setAckList] = useState([]);
  const [ackLoading, setAckLoading] = useState(false);

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const data = await listEsgPolicies({ status: 'PUBLISHED' });
      const list = Array.isArray(data) ? data : [];
      const withAck = await Promise.all(
        list.map(async (policy) => {
          const mine = await getMyAcknowledgement(policy.id).catch(() => null);
          return { ...policy, myAck: mine };
        })
      );
      setPolicies(withAck);
    } catch {
      toast.error('Could not load policies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await listEsgPolicies({ status: 'PUBLISHED' });
        const list = Array.isArray(data) ? data : [];
        const withAck = await Promise.all(
          list.map(async (policy) => {
            const mine = await getMyAcknowledgement(policy.id).catch(() => null);
            return { ...policy, myAck: mine };
          })
        );
        if (!cancelled) setPolicies(withAck);
      } catch {
        if (!cancelled) toast.error('Could not load policies');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleAcknowledge = async (policyId) => {
    setBusyId(policyId);
    try {
      await acknowledgePolicy(policyId);
      toast.success('Policy acknowledged');
      fetchPolicies();
    } catch (error) {
      toast.error(error?.response?.data?.message ?? 'Could not acknowledge policy');
    } finally {
      setBusyId(null);
    }
  };

  const openAckList = async (policy) => {
    setAckModal(policy);
    setAckLoading(true);
    try {
      const data = await listAcknowledgements(policy.id);
      setAckList(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Could not load acknowledgements');
    } finally {
      setAckLoading(false);
    }
  };

  return (
    <div>
      <Card className="!p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : policies.length === 0 ? (
          <p className="p-6 text-sm text-ink-400">No published policies yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-ink-600">
                <th className="px-6 py-3 font-medium">Policy</th>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium">Effective</th>
                <th className="px-6 py-3 font-medium">Your status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {policies.map((p) => (
                <tr key={p.id} className="border-t border-border-subtle">
                  <td className="px-6 py-3 text-ink-50">{p.title}</td>
                  <td className="px-6 py-3 text-ink-300">{p.category}</td>
                  <td className="px-6 py-3 text-ink-300">{toDateInputValue(p.effectiveDate)}</td>
                  <td className="px-6 py-3">
                    {p.myAck?.acknowledged ? (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-primary-400">
                        <CheckCircle2 size={14} /> Acknowledged
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-accent-400">Pending</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      {!p.myAck?.acknowledged && (
                        <Button size="sm" variant="primary" disabled={busyId === p.id} onClick={() => handleAcknowledge(p.id)}>
                          {busyId === p.id ? 'Saving...' : 'Acknowledge'}
                        </Button>
                      )}
                      {isAdmin && (
                        <button
                          onClick={() => openAckList(p)}
                          title="View acknowledgements"
                          className="cursor-pointer rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-white/5 hover:text-ink-50"
                        >
                          <Users size={15} />
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

      <Modal open={Boolean(ackModal)} onClose={() => setAckModal(null)} title={`Acknowledgements — ${ackModal?.title}`}>
        {ackLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : ackList.length === 0 ? (
          <p className="py-4 text-center text-sm text-ink-400">No one has acknowledged this yet.</p>
        ) : (
          <div className="space-y-2">
            {ackList.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-lg border border-border-subtle px-4 py-2.5 text-sm">
                <span className="text-ink-50">{a.employee?.username ?? a.employee?.email}</span>
                <span className="text-ink-400">{toDateInputValue(a.acknowledgedAt)}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

const Governance = () => {
  const { isAdmin } = useAuth();
  const [tab, setTab] = useState(isAdmin ? 'audits' : 'policies');
  const [departments, setDepartments] = useState([]);
  const [audits, setAudits] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    Promise.all([listDepartments(), listAudits(), listUsers()])
      .then(([deptData, auditData, userData]) => {
        if (cancelled) return;
        setDepartments(Array.isArray(deptData) ? deptData : []);
        setAudits(Array.isArray(auditData) ? auditData : []);
        setUsers(Array.isArray(userData) ? userData : []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const tabs = [
    ...(isAdmin ? [{ id: 'audits', label: 'Audits' }, { id: 'compliance', label: 'Compliance Issues' }] : []),
    { id: 'policies', label: 'Policies' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-ink-50">Governance</h1>
        <p className="text-sm text-ink-400">Policies, audits and compliance tracking.</p>
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

      {tab === 'audits' && isAdmin && (
        <AuditsTab departments={departments} onChanged={() => listAudits().then(setAudits)} />
      )}
      {tab === 'compliance' && isAdmin && <ComplianceIssuesTab audits={audits} users={users} />}
      {tab === 'policies' && <PoliciesTab isAdmin={isAdmin} />}
    </div>
  );
};

export default Governance;
