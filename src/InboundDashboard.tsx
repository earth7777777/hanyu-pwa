import { useState } from 'react';

const InboundDashboard = () => {
  const [status, setStatus] = useState('idle'); 
  const [visionData, setVisionData] = useState<any>(null);
  const [overrides, setOverrides] = useState({
    f01: 'PP再生料', f02: '宁波国睿新材料有限公司', f03: 'S7-FINAL-' + Date.now().toString().slice(-4), 
    f04: '1.0', f05: '40', f08: 'a2', f10: '', f11: 'S7主军帐验收'
  });

  const handleSubmit = async () => {
    setStatus('loading');
    setVisionData(null);
    try {
      const csrfToken = document.cookie.split('; ').find(row => row.trim().startsWith('frappe_csrftoken='))?.split('=')[1] || "";
      const response = await fetch('/api/method/hanyu_warehouse.api.v1.vision_to_draft.create_rm_inbound_draft_from_receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Frappe-CSRF-Token': csrfToken },
        body: JSON.stringify({ overrides: overrides })
      });
      const text = await response.text();
      let res;
      try { res = JSON.parse(text); } catch { res = { html_preview: text.slice(0, 300) }; }
      setVisionData(res);
      setStatus(response.ok ? 'success' : 'error');
    } catch (err: any) {
      setVisionData({ fetch_exception: err.message, help: "这是前端捕获到的网络层真实报错" });
      setStatus('error');
    }
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen pb-24 font-sans">
      <div className="bg-white p-4 rounded-xl shadow-sm border mb-4">
        <h2 className="font-bold mb-4 text-slate-700">数据校对 (S7)</h2>
        {Object.entries(overrides).map(([k, v]) => (
          <div key={k} className="mb-3">
            <label className="text-[10px] text-gray-400 font-bold uppercase">{k}</label>
            <input className="w-full p-2 border rounded-lg text-sm bg-gray-50" value={v} onChange={e => setOverrides(p => ({...p, [k]: e.target.value}))} />
          </div>
        ))}
      </div>
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur border-t shadow-lg">
        {status === 'error' && <div className="mb-2 p-2 bg-red-50 text-red-600 text-[10px] font-mono break-all ring-1 ring-red-200 rounded">{JSON.stringify(visionData)}</div>}
        {status === 'success' && <div className="mb-2 p-2 bg-green-50 text-green-700 text-sm font-bold text-center rounded">✅ 成功: {visionData?.message?.name || "已生成"}</div>}
        <button onClick={handleSubmit} disabled={status === 'loading'} className={`w-full p-4 rounded-xl font-bold text-white ${status === 'loading' ? 'bg-gray-400' : 'bg-slate-900 active:scale-95'}`}>
          {status === 'loading' ? '提交中...' : '确认并生成草稿'}
        </button>
      </div>
    </div>
  );
};
export default InboundDashboard;
