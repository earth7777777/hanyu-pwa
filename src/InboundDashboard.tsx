import { useState } from 'react';

const InboundDashboard = () => {
  const [status, setStatus] = useState('ok'); 
  const [visionData, setVisionData] = useState<any>(null);
  const [reason, setReason] = useState('');
  const [overrides, setOverrides] = useState({
    f01: '', f02: '', f03: '', f04: '', f05: '', f08: '', f10: '', f11: ''
  });

  const handleFieldChange = (field: string, value: string) => {
    setOverrides(prev => ({ ...prev, [field]: value }));
  };

  const handleIdentify = async () => {
    setStatus('loading');
    try {
      const response = await fetch('/api/method/hanyu_warehouse.api.v1.vision_to_draft.create_rm_inbound_draft_from_receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          exception_reason: reason || "S6预埋联调",
          overrides: overrides 
        })
      });
      const res = await response.json();
      setVisionData(res.message || res);
      setStatus('ok');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  // S6: 定义预埋键显示逻辑
  const metaKeys = [
    { key: 'batch_no', label: '批次号' },
    { key: 'external_bag_code', label: '外袋码' },
    { key: 'external_bag_code_list', label: '外袋码清单' },
    { key: 'material_source_type', label: '物料来源' },
    { key: 'regrind_class', label: '回料等级' }
  ];

  return (
    <div className="p-4 space-y-6 bg-gray-50 min-h-screen pb-40 font-sans">
      <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-3">1. 采集/识别</h2>
        <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="不拍照理由..." className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm mb-3" />
        <button onClick={handleIdentify} className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg text-sm">解析单据</button>
      </section>

      <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-sm font-bold text-gray-500 mb-2 uppercase">2. 识别结果 (JSON)</h2>
        <pre className="text-[10px] text-gray-500 font-mono bg-gray-50 p-2 rounded overflow-auto max-h-32">{JSON.stringify(visionData, null, 2)}</pre>
      </section>

      <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-4">3. 主字段校对</h2>
        <div className="grid grid-cols-1 gap-3">
          {Object.keys(overrides).map(key => (
            <div key={key}>
              <label className="text-xs font-bold text-gray-500">{key}</label>
              <input type="text" value={(overrides as any)[key]} onChange={(e) => handleFieldChange(key, e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg text-sm" />
            </div>
          ))}
        </div>
      </section>

      {/* S6: 预埋展示区落地 */}
      <section className="bg-gray-100/50 p-4 rounded-xl border border-dashed border-gray-300">
        <h2 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-widest text-center">4. 预埋信息 (不落库/不阻塞)</h2>
        <div className="grid grid-cols-1 gap-2">
          {metaKeys.map(item => {
            const value = visionData?.meta?.[item.key];
            return (
              <div key={item.key} className="flex justify-between items-center bg-white p-2 rounded border border-gray-100">
                <span className="text-[10px] text-gray-500 font-medium">{item.label} <code className="text-[8px] opacity-50">({item.key})</code></span>
                <span className={`text-xs font-mono ${value ? 'text-blue-600 font-bold' : 'text-gray-300'}`}>
                  {value || 'NULL'}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur p-4 border-t shadow-lg">
        <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-2">
          <span>STATUS: {status}</span>
          <span>DRAFT: {visionData?.draft?.name || 'PENDING'}</span>
        </div>
        <button className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl">
          确认提交建草稿 (S7功能)
        </button>
      </div>
    </div>
  );
};

export default InboundDashboard;
