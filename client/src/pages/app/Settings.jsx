import { useState } from 'react';
import DepartmentsPanel from './settings/DepartmentsPanel';
import CategoriesPanel from './settings/CategoriesPanel';
import EsgConfigPanel from './settings/EsgConfigPanel';

const tabs = [
  { id: 'departments', label: 'Departments', Panel: DepartmentsPanel },
  { id: 'categories', label: 'Categories', Panel: CategoriesPanel },
  { id: 'esg-config', label: 'ESG Configuration', Panel: EsgConfigPanel },
];

const Settings = () => {
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const ActivePanel = tabs.find((t) => t.id === activeTab)?.Panel;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-ink-50">Settings</h1>
        <p className="text-sm text-ink-400">
          Manage departments, categories and ESG scoring configuration.
        </p>
      </div>

      <div className="mb-6 flex gap-1 border-b border-border-subtle">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-primary-500 text-primary-400'
                : 'border-transparent text-ink-400 hover:text-ink-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {ActivePanel && <ActivePanel />}
    </div>
  );
};

export default Settings;
