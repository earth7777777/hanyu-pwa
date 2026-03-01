import { useState } from 'react';

const InboundDashboard = () => {
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [visionData, setVisionData] = useState<any>(null);
  const [reason, setReason] = useState('');
  
  // 初始化 Overrides 表单（预填部分合法值以方便 S7 验收测试）
  const [overrides, setOverrides] = useState({
    f01: 'PP再生料', 
    f02: '宁波国睿新材料有限公司', 
    f03: 'S7-AUTO-' + Date.now().toString().slice(-4), 
    f04: '1.0', 
    f05: '40', 
    f08: 'a2', 
    f10: '', 
    f11: 'S7前端闭环测试'
  });

  const handleFieldChange = (field: string, value: string) => {
    setOverrides(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setStatus('loading');
    try {
      const response = await fetch('/api/method/hanyu_warehouse.api.v1.vision_to_draft.create_rm_inbound_draft_from_receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          exception_reason: reason || "S7前端自动提交",
          overrides: overrides 
        })
      });
      const res = await response.json();
      const data = res.message || res;
      setVisionData(data);
      
      if (data.ok && data.draft?.name) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  const metaKeys = [
    { key: 'batch_no', label: '批次号' },
    { key: 'external_bag_code', label: '外袋码' },
    { key: 'external_bag_code_list', label: '外袋码清单' },
    { key: 'material_source_type', label: '物料来源' },
    { key: 'regrind_class', label: '回料等级' }
  ];

  return (
    <div className="p-4 space-y-6 bg-gray-50 min-h-screen pb-48 font-sans text-slate-900">
      {/* 1. 采集区 */}
      <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold mb-3 flex items-center"><span className="w-1.5 h-5 bg-blue-600 rounded-full mr-2"></span>1. 异常理由</h2>
        <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="未拍照理由..." className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
      </section>

      {/* 2. Overrides 校对区 */}
      <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold mb-4 flex items-center text-orange-600"><span className="w-1.5 h-5 bg-orange-500 rounded-full mr-2"></span>2. 核心校对 (f01-f11)</h2>
        <div className="grid grid-cols-1 gap-3">
          {Object.entries(overrides).map(([key, val]) => (
            <div key={key} className="flex flex-col">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1">{key}</label>
              <input type="text" value={val} onChange={(e) => handleFieldChange(key, e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-white" />
            </div>
          ))}
        </div>
      </section>

      {/* 3. 预埋展示区 */}
      <section className="bg-gray-100/50 p-4 rounded-xl border border-dashed border-gray-200">
        <h2 className="text-xs font-bold mb-3 uppercase tracking-widest text-center text-gray-400">3. 预埋信息 (只读)</h2>
        <div className="space-y-2 opacity-60">
          {metaKeys.map(item => (
            <div key={item.key} className="flex justify-between text-xs border-b border-gray-100 pb-1">
              <span className="text-gray-500">{item.label}</span>
              <span className="font-mono text-gray-400">{visionData?.meta?.[item.key] || 'NULL'}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 5. 提交结果与固定操作区 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur p-4 border-t shadow-2xl z-50">
        {status === 'success' && (
          <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg text-center animate-pulse">
            <p className="text-green-700 font-bold text-sm">✅ 草稿创建成功！</p>
            <p className="text-green-600 text-xs font-mono">单号: {visionData?.draft?.name}</p>
            <p className="text-[10px] text-green-500 mt-1">docstatus=0 (非入账)</p>
          </div>
        )}
        {status === 'error' && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 overflow-auto max-h-24 font-mono">
            <strong>❌ 拦截原因:</strong> {JSON.stringify(visionData?.error || visionData || '请求失败')}
          </div>
        )}
        <button 
          onClick={handleSubmit}
          disabled={status === 'loading'}
          className={`w-full font-bold py-4 rounded-xl transition-all shadow-lg text-lg ${status === 'loading' ? 'bg-gray-400 cursor-not-allowed' : 'bg-slate-900 text-white active:scale-95'}`}
        >
          {status === 'loading' ? '正在创建草稿...' : '确认并生成 RM Inbound 草稿'}
        </button>
      </div>
    </div>
  );
};

export default InboundDashboard;
