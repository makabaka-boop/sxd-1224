import { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Download,
  Upload,
  List,
  AlertTriangle,
  Trash2,
  Boxes,
  TrendingUp,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useBoxStore } from '../hooks/useBoxStore';
import { FilterBar } from '../components/FilterBar';
import { ValidationAlert } from '../components/ValidationAlert';
import { SortableBoxList } from '../components/SortableBoxList';
import { PriorityView } from '../components/PriorityView';
import { UnpackProgressView } from '../components/UnpackProgressView';
import { BatchActionBar } from '../components/BatchActionBar';
import { BoxForm } from '../components/BoxForm';
import { exportToJSON, importFromJSON } from '../utils/export';
import type { Box, UnpackStatus } from '../types';

type ViewType = 'all' | 'priority' | 'progress';

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { boxes, loadBoxes, isLoading, getFilteredBoxes, importBoxes, clearAll } = useBoxStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBox, setEditingBox] = useState<Box | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('all');
  const fileInputRef = useState<HTMLInputElement | null>(null);

  useEffect(() => {
    loadBoxes();
  }, [loadBoxes]);

  useEffect(() => {
    if (location.pathname === '/priority') {
      setCurrentView('priority');
    } else if (location.pathname === '/progress') {
      setCurrentView('progress');
    } else {
      setCurrentView('all');
    }
  }, [location.pathname]);

  const handleAddBox = () => {
    setEditingBox(null);
    setIsFormOpen(true);
  };

  const handleEditBox = (box: Box) => {
    setEditingBox(box);
    setIsFormOpen(true);
  };

  const handleExport = () => {
    exportToJSON(boxes, `搬家箱清单_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.json`);
  };

  const handleImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const importedBoxes = await importFromJSON(file);
          const boxesToImport = importedBoxes.map((box) => ({
            boxNumber: box.boxNumber,
            targetRoom: box.targetRoom,
            contentSummary: box.contentSummary,
            weightLevel: box.weightLevel,
            isFragile: box.isFragile,
            fragileNote: box.fragileNote,
            priorityLevel: box.priorityLevel,
            loadingOrder: box.loadingOrder,
            status: box.status,
            notes: box.notes,
            unpackStatus: (box.unpackStatus as UnpackStatus) || 'toUnpack',
            actualPlacement: box.actualPlacement || '',
            unpackCompletedAt: box.unpackCompletedAt || null,
            abnormalNote: box.abnormalNote || '',
          }));
          await importBoxes(boxesToImport);
          alert(`成功导入 ${boxesToImport.length} 个箱子！`);
        } catch (error) {
          alert('导入失败：' + (error as Error).message);
        }
      }
    };
    input.click();
  };

  const handleClearAll = () => {
    if (confirm('确定要清空所有箱子数据吗？此操作不可恢复！')) {
      clearAll();
    }
  };

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
    if (view === 'priority') {
      navigate('/priority');
    } else if (view === 'progress') {
      navigate('/progress');
    } else {
      navigate('/');
    }
  };

  const filteredBoxes = getFilteredBoxes();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-amber-700 font-medium">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-amber-100 shadow-sm">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Boxes className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 font-serif">搬家箱清单</h1>
                <p className="text-sm text-gray-500">
                  共 {boxes.length} 个箱子
                  {currentView === 'all' && filteredBoxes.length !== boxes.length && (
                    <span className="text-amber-600">，当前显示 {filteredBoxes.length} 个</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex bg-amber-50 rounded-xl p-1">
                <button
                  onClick={() => handleViewChange('all')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentView === 'all'
                      ? 'bg-white text-amber-700 shadow-md'
                      : 'text-amber-500 hover:text-amber-700'
                  }`}
                >
                  <List className="w-4 h-4" />
                  全部清单
                </button>
                <button
                  onClick={() => handleViewChange('priority')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentView === 'priority'
                      ? 'bg-white text-amber-700 shadow-md'
                      : 'text-amber-500 hover:text-amber-700'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                  优先清单
                </button>
                <button
                  onClick={() => handleViewChange('progress')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentView === 'progress'
                      ? 'bg-white text-green-700 shadow-md'
                      : 'text-green-500 hover:text-green-700'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  开箱进度
                </button>
              </div>

              <div className="h-8 w-px bg-gray-200 hidden sm:block" />

              <button
                onClick={handleImportClick}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-amber-200 text-amber-700 hover:bg-amber-50 transition-colors font-medium text-sm"
              >
                <Upload className="w-4 h-4" />
                导入
              </button>

              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors font-medium text-sm"
              >
                <Download className="w-4 h-4" />
                导出 JSON
              </button>

              <button
                onClick={handleClearAll}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors font-medium text-sm"
              >
                <Trash2 className="w-4 h-4" />
                清空
              </button>

              <button
                onClick={handleAddBox}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-500 text-white hover:bg-amber-600 transition-colors font-medium text-sm shadow-md hover:shadow-lg"
              >
                <Plus className="w-4 h-4" />
                添加箱子
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 py-6">
        {currentView === 'all' && (
          <>
            <ValidationAlert />
            <FilterBar />
            <SortableBoxList boxes={filteredBoxes} onEditBox={handleEditBox} />
          </>
        )}

        {currentView === 'priority' && <PriorityView />}

        {currentView === 'progress' && <UnpackProgressView />}
      </main>

      <BatchActionBar />

      <BoxForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingBox(null);
        }}
        editingBox={editingBox}
      />
    </div>
  );
}

