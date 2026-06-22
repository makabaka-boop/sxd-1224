import { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, XCircle, AlertCircle } from 'lucide-react';
import { useBoxStore } from '../hooks/useBoxStore';
import { cn } from '../lib/utils';

export const ValidationAlert = () => {
  const { validationWarnings } = useBoxStore();
  const [isExpanded, setIsExpanded] = useState(false);

  if (validationWarnings.length === 0) return null;

  const errors = validationWarnings.filter((w) => w.severity === 'error');
  const warnings = validationWarnings.filter((w) => w.severity === 'warning');

  return (
    <div className="mb-6 animate-slide-in">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full p-4 rounded-xl flex items-center justify-between transition-all',
          errors.length > 0
            ? 'bg-red-50 border-2 border-red-200 hover:bg-red-100'
            : 'bg-amber-50 border-2 border-amber-200 hover:bg-amber-100'
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center',
              errors.length > 0 ? 'bg-red-200' : 'bg-amber-200'
            )}
          >
            <AlertTriangle
              className={cn('w-5 h-5', errors.length > 0 ? 'text-red-600' : 'text-amber-600')}
            />
          </div>
          <div className="text-left">
            <p
              className={cn(
                'font-bold',
                errors.length > 0 ? 'text-red-700' : 'text-amber-700'
              )}
            >
              发现 {validationWarnings.length} 个问题需要注意
            </p>
            <p className="text-sm text-gray-600">
              {errors.length > 0 && `${errors.length} 个错误`}
              {errors.length > 0 && warnings.length > 0 && '，'}
              {warnings.length > 0 && `${warnings.length} 个警告`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {errors.length > 0 && (
            <span className="px-3 py-1 rounded-full bg-red-500 text-white text-sm font-bold">
              {errors.length}
            </span>
          )}
          {warnings.length > 0 && (
            <span className="px-3 py-1 rounded-full bg-amber-500 text-white text-sm font-bold">
              {warnings.length}
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="mt-2 p-4 bg-white rounded-xl border border-gray-200 shadow-lg animate-fade-in">
          <div className="space-y-3">
            {validationWarnings.map((warning, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg',
                  warning.severity === 'error' ? 'bg-red-50' : 'bg-amber-50'
                )}
              >
                {warning.severity === 'error' ? (
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p
                    className={cn(
                      'font-medium',
                      warning.severity === 'error' ? 'text-red-700' : 'text-amber-700'
                    )}
                  >
                    {warning.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    影响 {warning.affectedBoxIds.length} 个箱子
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
