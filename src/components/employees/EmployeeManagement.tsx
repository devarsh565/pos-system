import React from 'react';
import { Briefcase, UserCheck, Clock, Award, Shield, DollarSign } from 'lucide-react';
import { User, Order, SystemSettings } from '../../types/pos';
import { formatCurrency } from '../../utils/storage';

interface EmployeeManagementProps {
  users: User[];
  orders: Order[];
  settings: SystemSettings;
}

export const EmployeeManagement: React.FC<EmployeeManagementProps> = ({
  users,
  orders,
  settings,
}) => {
  // Compute sales per employee
  const employeeStats = users.map((u) => {
    const userOrders = orders.filter((o) => o.cashierId === u.id && o.status === 'completed');
    const totalSales = userOrders.reduce((sum, o) => sum + o.total, 0);
    const orderCount = userOrders.length;
    const target = 1000;
    const targetProgress = Math.min(100, Math.round((totalSales / target) * 100));

    return {
      ...u,
      totalSales,
      orderCount,
      targetProgress,
      shift: u.role === 'admin' ? 'Day Management' : 'Morning Shift (08:00 - 16:00)',
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-xl shadow-md shadow-emerald-500/20">
              <Briefcase className="w-5 h-5" />
            </div>
            <span>Employee & Cashier Roster Management</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Monitor staff attendance, terminal shift allocations, and sales performance targets
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employeeStats.map((emp) => (
          <div
            key={emp.id}
            className="p-5 bg-white border border-slate-100 hover:border-slate-200 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md flex flex-col justify-between transition-all"
          >
            <div>
              <div className="flex items-center gap-3">
                <img
                  src={emp.avatar}
                  alt={emp.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-slate-200 shadow-xs"
                />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{emp.name}</h3>
                  <p className="text-[11px] text-slate-500">{emp.email}</p>
                  <span className="inline-block mt-1 text-[10px] uppercase font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                    {emp.role}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> Shift:
                  </span>
                  <span className="font-semibold text-slate-800">{emp.shift}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1 font-medium">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Processed Volume:
                  </span>
                  <span className="font-mono font-bold text-emerald-700">
                    {formatCurrency(emp.totalSales, settings.currency)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Orders Handled:</span>
                  <span className="font-mono font-semibold text-slate-800">{emp.orderCount} tickets</span>
                </div>

                {/* Sales Target Progress Bar */}
                <div className="pt-2">
                  <div className="flex justify-between text-[11px] text-slate-600 mb-1 font-medium">
                    <span>Shift Target ($1,000)</span>
                    <span className="font-mono text-emerald-700 font-bold">{emp.targetProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${emp.targetProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-medium">Status: {emp.status === 'active' ? 'On Duty' : 'Inactive'}</span>
              <span className="font-mono text-[10px] text-slate-400">
                Last: {new Date(emp.lastLogin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
