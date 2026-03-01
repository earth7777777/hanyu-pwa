import { useState } from 'react';

const InboundDashboard = () => {
  const [status, setStatus] = useState('idle'); 
  const [visionData, setVisionData] = useState<any>(null);
  const [overrides, setOverrides] = useState({
    f01: 'PP再生料', f02: '宁波国睿新材料有限公司', f03: 'S7-FINAL-' + Date.now().toString().slice(-4), 
    f04: '1.0', f05: '40', f08: 'a2', f10: '', f11: 'S7主军帐终极补丁'
  });

  const handleSubmit = async () => {
    setStatus('loading');
    setVisionData(null);
    try {
      // 核心修复：先去主页“偷”出最新的 CSRF 令牌
      const homeRes = await fetch('/');
      const html = await homeRes.text();
      const tokenMatch = html.match(/csrf_token":\s*"(.*?)"/);
      const stolenToken = tokenMatch ? tokenMatch[1] : "";

      const response = await fetch('/api/method/hanyu_warehouse.api.v1.vision_to_draft.create_rm_inbound_draft_from_receipt', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'X-Frappe-CSRF-Token': stolenToken 
        },
        body: JSON.stringify({ overrides: overrides })
      });

      const text = await response.text();
      let res;
      try { res = JSON.parse(text); } catch { res = { raw_response: text.slice(0, 500) }; }
      
      setVisionData(res);
      setStatus(response.ok ? 'success' : 'error');
    } catch (err: any) {
      setVisionData({ error: "系统连接失败", detail: err.message });
      setStatus('error');
    }
  };

  return (
    <div className="p-4 space-y-4 bg-gray-50 min-h-screen pb-48 font-sans">
      <div className="bg-white p-4 rounded-xl shadow-sm border">
        <h2 className="text-lg font-bold mb-4 text-slate-800">S7 终极验收数据</h2>
        <div className="grid grid-cols-1 gap-4">
          {Object.entries(overrides).map(([k, v]) => (
            <div key={k}>
              <label className="text-[10px] font-bold text-gray-400 uppercase">{k}</label>
              <input value={v} onChange={e => setOverrides(p => ({...p, [k]: e.target.value}))} className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-gray-50" />
            </div>
          ))}
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur p-4 border-t shadow-2xl">
        {status === 'success' && <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg text-center font-bold text-green-700">✅ 成功：{visionData?.message?.name || "已生成草稿"}</div>}
        {status === 'error' && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-mono overflow-auto max-h-40">
            <strong>❌ 拦截细节：</strong>
            <pre className="mt-1 whitespace-pre-wrap">{JSON.stringify(visionData, null, 2)}</pre>
          </div>
        )}
        <button onClick={handleSubmit} disabled={status === 'loading'} className={`w-full font-bold py-4 rounded-xl shadow-lg text-lg ${status === 'loading' ? 'bg-gray-400' : 'bg-slate-900 text-white active:scale-95'}`}>
          {status === 'loading' ? '正在强制同步...' : '确认并最终提交'}
        </button>
      </div>
    </div>
  );
};
export default InboundDashboard;
