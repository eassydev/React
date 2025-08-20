'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface SPOCWorkload {
  spoc_user: {
    id: string;
    username: string;
    full_name: string;
    email: string;
  };
  total_assignments: number;
  assignments_by_type: {
    [key: string]: number;
  };
}

interface B2BSPOCWorkloadChartProps {
  data: SPOCWorkload[];
}

export const B2BSPOCWorkloadChart: React.FC<B2BSPOCWorkloadChartProps> = ({ data }) => {
  // Prepare data for bar chart
  const barChartData = data.map(spoc => ({
    name: spoc.spoc_user.full_name || spoc.spoc_user.username,
    assignments: spoc.total_assignments,
    primary: spoc.assignments_by_type.primary || 0,
    backup: spoc.assignments_by_type.backup || 0,
    technical: spoc.assignments_by_type.technical || 0,
    accounts: spoc.assignments_by_type.accounts || 0,
    sales: spoc.assignments_by_type.sales || 0,
    manager: spoc.assignments_by_type.manager || 0
  }));

  // Prepare data for pie chart (assignment types distribution)
  const typeDistribution = data.reduce((acc, spoc) => {
    Object.entries(spoc.assignments_by_type).forEach(([type, count]) => {
      acc[type] = (acc[type] || 0) + count;
    });
    return acc;
  }, {} as Record<string, number>);

  const pieChartData = Object.entries(typeDistribution).map(([type, count]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: count
  }));

  // Colors for different SPOC types
  const colors = {
    primary: '#ef4444',
    backup: '#3b82f6',
    technical: '#10b981',
    accounts: '#f59e0b',
    sales: '#8b5cf6',
    manager: '#f97316'
  };

  const pieColors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#f97316'];

  return (
    <div className="space-y-8">
      {/* Workload Distribution Bar Chart */}
      <div>
        <h3 className="text-lg font-semibold mb-4">SPOC Workload Distribution</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [value, name.charAt(0).toUpperCase() + name.slice(1)]}
                labelFormatter={(label) => `SPOC: ${label}`}
              />
              <Bar dataKey="primary" stackId="a" fill={colors.primary} name="Primary" />
              <Bar dataKey="backup" stackId="a" fill={colors.backup} name="Backup" />
              <Bar dataKey="technical" stackId="a" fill={colors.technical} name="Technical" />
              <Bar dataKey="accounts" stackId="a" fill={colors.accounts} name="Accounts" />
              <Bar dataKey="sales" stackId="a" fill={colors.sales} name="Sales" />
              <Bar dataKey="manager" stackId="a" fill={colors.manager} name="Manager" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Assignment Types Distribution Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Assignment Types Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Workload Statistics */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Workload Statistics</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Total SPOCs</p>
                <p className="text-2xl font-bold text-blue-900">{data.length}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Total Assignments</p>
                <p className="text-2xl font-bold text-green-900">
                  {data.reduce((sum, spoc) => sum + spoc.total_assignments, 0)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-600 font-medium">Avg. Workload</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {data.length > 0 
                    ? Math.round(data.reduce((sum, spoc) => sum + spoc.total_assignments, 0) / data.length)
                    : 0
                  }
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-600 font-medium">Max Workload</p>
                <p className="text-2xl font-bold text-purple-900">
                  {data.length > 0 
                    ? Math.max(...data.map(spoc => spoc.total_assignments))
                    : 0
                  }
                </p>
              </div>
            </div>

            {/* Top Performers */}
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-3">Top Performers by Workload</h4>
              <div className="space-y-2">
                {data
                  .sort((a, b) => b.total_assignments - a.total_assignments)
                  .slice(0, 3)
                  .map((spoc, index) => (
                    <div key={spoc.spoc_user.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <span className="font-medium text-sm">
                          {spoc.spoc_user.full_name || spoc.spoc_user.username}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-600">
                        {spoc.total_assignments} clients
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
