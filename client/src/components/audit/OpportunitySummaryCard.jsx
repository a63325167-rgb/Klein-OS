import React from 'react';

const OpportunitySummaryCard = ({ data }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Opportunity Summary</h3>
      <div className="space-y-2">
        <p className="text-gray-600 dark:text-gray-400">Analysis results will appear here</p>
      </div>
    </div>
  );
};

export default OpportunitySummaryCard;
