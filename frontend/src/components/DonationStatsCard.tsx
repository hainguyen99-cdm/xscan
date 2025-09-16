interface DonationStatsCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: string;
}

export function DonationStatsCard({ title, value, change, changeType, icon }: DonationStatsCardProps) {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-emerald-600';
      case 'negative':
        return 'text-red-600';
      case 'neutral':
        return 'text-cyan-600';
      default:
        return 'text-cyan-600';
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case 'positive':
        return '↗';
      case 'negative':
        return '↘';
      case 'neutral':
        return '→';
      default:
        return '→';
    }
  };

  const getChangeBgColor = () => {
    switch (changeType) {
      case 'positive':
        return 'bg-emerald-50 border-emerald-200';
      case 'negative':
        return 'bg-red-50 border-red-200';
      case 'neutral':
        return 'bg-cyan-50 border-cyan-200';
      default:
        return 'bg-cyan-50 border-cyan-200';
    }
  };

  return (
    <div className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300 transform hover:-translate-y-1 hover:border-indigo-200">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-indigo-200/50 transition-all duration-300 group-hover:scale-110">
            <span className="text-xl text-white">{icon}</span>
          </div>
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600 group-hover:text-gray-700 transition-colors duration-200">{title}</p>
          <p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent group-hover:from-indigo-700 group-hover:to-cyan-700 transition-all duration-300">{value}</p>
        </div>
      </div>
      <div className="mt-4">
        <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getChangeBgColor()} ${getChangeColor()} border transition-all duration-200 group-hover:scale-105`}>
          <span className="mr-1.5 text-base">{getChangeIcon()}</span>
          {change}
        </div>
      </div>
      
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 to-cyan-50/0 group-hover:from-indigo-50/30 group-hover:to-cyan-50/30 rounded-2xl transition-all duration-300 pointer-events-none"></div>
    </div>
  );
} 