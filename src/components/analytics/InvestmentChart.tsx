'use client';

// ============================================
// BADGER - Investment Chart Component
// ============================================

import { useEffect, useState } from 'react';

interface InvestmentSummary {
  month: string;
  totalInvested: number;
}

export default function InvestmentChart() {
  const [data, setData] = useState<InvestmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    async function fetchInvestments() {
      try {
        // For now, we'll calculate this client-side from the analytics
        // In a real implementation, you'd want a dedicated API endpoint
        const res = await fetch('/api/analytics/monthly-summaries');
        const summaries = await res.json();

        // Transform to investment data
        // This is a placeholder - you'll need to implement getInvestmentSummaries API
        const investmentData: InvestmentSummary[] = summaries.slice(0, 6).map((s: any) => ({
          month: s.month,
          totalInvested: 0, // Will be populated from actual investment entries
        }));

        setData(investmentData);
      } catch (error) {
        console.error('Error fetching investments:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchInvestments();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
        <div className="h-80 bg-gray-100 rounded-lg"></div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.totalInvested), 1);
  const hasData = data.some(d => d.totalInvested > 0);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Investment Tracker</h3>
          <p className="text-sm text-gray-500 mt-1">Last 6 months</p>
        </div>
        <span className="text-2xl">📊</span>
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <span className="text-6xl mb-4">💼</span>
          <p className="text-gray-600 font-medium">No investments yet</p>
          <p className="text-sm text-gray-400 mt-2">
            Start tracking your investments to see your portfolio grow!
          </p>
        </div>
      ) : (
        <>
          {/* Chart */}
          <div className="relative h-64 flex items-end justify-between gap-2 mb-4">
            {data.map((item, index) => {
              const heightPercentage = (item.totalInvested / maxValue) * 100;
              const isHovered = hoveredIndex === index;

              return (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center group cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Tooltip */}
                  {isHovered && (
                    <div className="absolute bottom-full mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg z-10 whitespace-nowrap animate-fade-in">
                      <div className="font-semibold">{item.month}</div>
                      <div className="text-accent">${item.totalInvested.toLocaleString()}</div>
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                        <div className="border-4 border-transparent border-t-gray-800"></div>
                      </div>
                    </div>
                  )}

                  {/* Bar */}
                  <div className="w-full relative flex items-end justify-center" style={{ height: '16rem' }}>
                    <div
                      className={`w-full rounded-t-lg transition-all duration-700 ease-out ${
                        isHovered ? 'bg-accent shadow-lg' : 'bg-gradient-to-t from-accent to-accent/60'
                      }`}
                      style={{
                        height: `${heightPercentage}%`,
                        minHeight: item.totalInvested > 0 ? '4px' : '0',
                        transitionDelay: `${index * 100}ms`,
                      }}
                    >
                      {/* Shine effect on hover */}
                      {isHovered && (
                        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent animate-shine"></div>
                      )}
                    </div>
                  </div>

                  {/* Label */}
                  <div className={`mt-2 text-xs text-center transition-all duration-200 ${
                    isHovered ? 'font-semibold text-accent' : 'text-gray-500'
                  }`}>
                    {item.month.split(' ')[0]}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total Summary */}
          <div className="pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Invested (6 months)</span>
              <span className="text-2xl font-bold text-accent">
                ${data.reduce((sum, item) => sum + item.totalInvested, 0).toLocaleString()}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
