import { useState } from 'react';

const InboundDashboard = () => {
  const [status, setStatus] = useState('ok'); 
  const [visionData, setVisionData] = useState<any>(null);
  const [reason, setReason] = useState('');
  
  // S5: 初始化 Overrides 表单状态
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
          exception_reason: reason || "S5校对区联调",
          overrides: overrides // 传当前表单值
        })
      });
      const res = await response.json();
      const data = res.message || res;
      setVisionData(data);
      
      // 若后端有返回建议值，则更新表单（此处为后续 OCR 预留）
      if (data.vision && data.ok) {
        // 示例：若视觉识别出单号，同步给 f03
        // setOverrides(prev => ({ ...prev, f03: data.vision.invoice_no || prev.f03 }));
      }
      
      setStatus('ok');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <div className="p-4 space-y-6 bg-gray-50 min-h-screen pb-40 font-sans">
      {/* 1. 采集区 */}
      <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-3">1. 拍照/理由</h2>
        <input 
          type="text" 
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="不拍照理由..." 
          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm mb-3"
        />
        <button onClick={handleIdentify} className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg text-sm">
          调用后端识别
        </button>
      </section>

      {/* 2. 识别结果 (JSON) */}
      <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-sm font-bold text-gray-500 mb-2 uppercase">2. 视觉返回</h2>
        <pre className="text-[10px] text-gray-500 font-mono bg-gray-50 p-2 rounded overflow-auto max-h-32">
          {JSON.stringify(visionData, null, 2)}
        </pre>
      </section>

      {/* 3. 主字段校对区 (S5核心) */}
      <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-1.5 h-5 bg-orange-500 rounded-full"></div>
          <h2 className="text-lg font-bold text-gray-800">3. 校对表单 (Overrides)</h2>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {[
            { id: 'f01', label: 'Material 物料' },
            { id: 'f02', label: 'Supplier 供应商' },
            { id: 'f03', label: 'Invoice No. 送货单号' },
            { id: 'f04', label: 'Weight (吨) 毛重' },
            { id: 'f05', label: 'Package Qty 袋数' },
            { id: 'f08', label: 'Location 库位', highlight: true, note: '人必填' },
            { id: 'f10', label: 'Exception 异常说明' },
            { id: 'f11', label: 'Remarks 备注' }
          ].map(f => (
            <div key={f.id}>
              <label className={`text-xs font-bold ${f.highlight ? 'text-red-500' : 'text-gray-500'}`}>
                {f.label} {f.note && `(${f.note})`}
              </label>
              <input 
                type="text" 
                value={(overrides as any)[f.id]}
                onChange={(e) => handleFieldChange(f.id, e.target.value)}
                className={`w-full p-2 border rounded-lg text-sm ${f.highlight ? 'border-red-200 bg-red-50/20' : 'border-gray-200'}`}
              />
            </div>
          ))}
        </div>
      </section>

      {/* 5. 结果展示区 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur p-4 border-t shadow-lg text-center">
        <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-2">
          <span>STATUS: {status}</span>
          <span>DRAFT: {visionData?.draft?.name || 'PENDING'}</span>
        </div>
        <button className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl opacity-50 cursor-not-allowed">
          确认提交 (待S6闭环)
        </button>
      </div>
    </div>
  );
};

export default InboundDashboard;
