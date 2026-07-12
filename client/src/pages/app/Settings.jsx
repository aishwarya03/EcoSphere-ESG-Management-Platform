import { useState } from 'react';
import OrganizationPanel from './settings/OrganizationPanel';
import DepartmentsPanel from './settings/DepartmentsPanel';
import CategoriesPanel from './settings/CategoriesPanel';
import EsgConfigPanel from './settings/EsgConfigPanel';
import ProductsPanel from './settings/ProductsPanel';
import EmissionFactorsPanel from './settings/EmissionFactorsPanel';
import EnvironmentalGoalsPanel from './settings/EnvironmentalGoalsPanel';
import EsgPoliciesPanel from './settings/EsgPoliciesPanel';
import BadgesPanel from './settings/BadgesPanel';
import RewardsPanel from './settings/RewardsPanel';
import DepartmentScoresPanel from './settings/DepartmentScoresPanel';

const groups = [
  {
    label: 'Organization',
    items: [
      { id: 'organization', label: 'Profile', Panel: OrganizationPanel },
      { id: 'departments', label: 'Departments', Panel: DepartmentsPanel },
      { id: 'categories', label: 'Categories', Panel: CategoriesPanel },
      { id: 'esg-config', label: 'ESG Configuration', Panel: EsgConfigPanel },
      { id: 'scores', label: 'Department Scores', Panel: DepartmentScoresPanel },
    ],
  },
  {
    label: 'Environmental',
    items: [
      { id: 'emission-factors', label: 'Emission Factors', Panel: EmissionFactorsPanel },
      { id: 'environmental-goals', label: 'Sustainability Goals', Panel: EnvironmentalGoalsPanel },
    ],
  },
  {
    label: 'Governance',
    items: [{ id: 'esg-policies', label: 'ESG Policies', Panel: EsgPoliciesPanel }],
  },
  {
    label: 'Products',
    items: [{ id: 'products', label: 'Products & ESG Profiles', Panel: ProductsPanel }],
  },
  {
    label: 'Gamification',
    items: [
      { id: 'badges', label: 'Badges', Panel: BadgesPanel },
      { id: 'rewards', label: 'Rewards', Panel: RewardsPanel },
    ],
  },
];

const allItems = groups.flatMap((g) => g.items);

const Settings = () => {
  const [activeId, setActiveId] = useState(allItems[0].id);
  const ActivePanel = allItems.find((i) => i.id === activeId)?.Panel;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-ink-50">Settings</h1>
        <p className="text-sm text-ink-400">
          Manage your organization&apos;s master data and ESG configuration.
        </p>
      </div>

      <div className="flex flex-col gap-8 md:flex-row">
        <nav className="shrink-0 md:w-52">
          {groups.map((group) => (
            <div key={group.label} className="mb-5">
              <div className="mb-1.5 px-3 text-xs font-semibold uppercase tracking-wide text-ink-600">
                {group.label}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveId(item.id)}
                    className={`block w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                      activeId === item.id
                        ? 'bg-primary-500/15 text-primary-400'
                        : 'text-ink-300 hover:bg-white/5 hover:text-ink-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="min-w-0 flex-1">{ActivePanel && <ActivePanel />}</div>
      </div>
    </div>
  );
};

export default Settings;
