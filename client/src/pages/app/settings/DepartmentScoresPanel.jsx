import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { RefreshCw } from 'lucide-react';
import { getOverallScore, listLatestScores, recomputeScores } from '../../../api/departmentScores';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Spinner from '../../../components/Spinner';

const DepartmentScoresPanel = () => {
  const [scores, setScores] = useState([]);
  const [overall, setOverall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recomputing, setRecomputing] = useState(false);

  const fetchScores = async () => {
    setLoading(true);
    try {
      const [scoreData, overallData] = await Promise.all([
        listLatestScores(),
        getOverallScore().catch(() => null),
      ]);
      setScores(Array.isArray(scoreData) ? scoreData : []);
      setOverall(overallData);
    } catch {
      toast.error('Could not load department scores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    Promise.all([listLatestScores(), getOverallScore().catch(() => null)])
      .then(([scoreData, overallData]) => {
        if (cancelled) return;
        setScores(Array.isArray(scoreData) ? scoreData : []);
        setOverall(overallData);
      })
      .catch(() => {
        if (!cancelled) toast.error('Could not load department scores');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleRecompute = async () => {
    setRecomputing(true);
    try {
      await recomputeScores();
      toast.success('Department scores recomputed');
      fetchScores();
    } catch (error) {
      toast.error(error?.response?.data?.message ?? 'Could not recompute scores');
    } finally {
      setRecomputing(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-ink-400">
          Environmental / Social / Governance scores, weighted into a total per department.
        </p>
        <Button size="sm" variant="primary" onClick={handleRecompute} disabled={recomputing}>
          <RefreshCw size={16} className={recomputing ? 'animate-spin' : ''} />
          {recomputing ? 'Recomputing...' : 'Recompute'}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : (
        <>
          {overall && (
            <Card className="mb-6">
              <span className="text-xs text-ink-400">Overall ESG Score</span>
              <div className="font-heading text-4xl font-bold text-ink-50">
                {overall.overallScore.toFixed(1)}
              </div>
            </Card>
          )}

          <Card className="!p-0 overflow-hidden">
            {scores.length === 0 ? (
              <p className="p-6 text-sm text-ink-400">
                No scores computed yet. Click Recompute to generate the first snapshot.
              </p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-ink-600">
                    <th className="px-6 py-3 font-medium">Department</th>
                    <th className="px-6 py-3 font-medium">Environmental</th>
                    <th className="px-6 py-3 font-medium">Social</th>
                    <th className="px-6 py-3 font-medium">Governance</th>
                    <th className="px-6 py-3 font-medium">Total</th>
                    <th className="px-6 py-3 font-medium">Computed</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map((s) => (
                    <tr key={s.id} className="border-t border-border-subtle">
                      <td className="px-6 py-3 text-ink-50">{s.department?.name}</td>
                      <td className="px-6 py-3 text-ink-300">{s.environmentalScore.toFixed(1)}</td>
                      <td className="px-6 py-3 text-ink-300">{s.socialScore.toFixed(1)}</td>
                      <td className="px-6 py-3 text-ink-300">{s.governanceScore.toFixed(1)}</td>
                      <td className="px-6 py-3 font-semibold text-ink-50">{s.totalScore.toFixed(1)}</td>
                      <td className="px-6 py-3 text-ink-400">
                        {new Date(s.computedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </>
      )}
    </div>
  );
};

export default DepartmentScoresPanel;
