import { useState } from 'react';

const InboundDashboard = () => {
  const [status, setStatus] = useState('idle'); 
  const [visionData, setVisionData] = useState<any>(null);
  const [stolenToken, setStolenToken] = useState("");
  const [overrides, setOverrides] = useState({
    f01: 'PP再生料', f02: '宁波国睿新材料有限公司', f03: 'S8-FINAL-' + Date.now().toString().slice(-4), 
    f04: '1.0', f05: '40', f08: 'a2', f11: 'S8强制凭证补丁'
  });

  const handleSubmit = async () => {
    setStatus('loading');
    try {
      // 1. 强制携带凭据去首页抓取管理员专属 Token
      const homeRes = await fetch('/', { credentials: 'include' });
      const html = await homeRes.text();
      const tokenMatch = html.match(/csrf_token":\s*"(.*?)"/);
      const token = tokenMatch ? tokenMatch[1] : "";
      setStolenToken(token);

      // 2. 带着领到的证件提交数据
      const response = await fetch('/api/method/hanyu_warehouse.api.v1.vision_to_draft.create_rm_inbound_draft_from_receipt', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'X-Frappe-CSRF-Token': token 
        },
        body: JSON.stringify({ overrides: overrides }),
        credentials: 'include' 
      });

      const text = await response.text();
      let res;
      try { res = JSON.parse(text); } catch { res = { raw_response: text.slice(0, 500) }; }
      
      setVisionData(res);
      setStatus(response.ok ? 'success' : 'error');
    } catch (err: any) {
      setVisionData({ error: "网络通信中断", detail: err.message });
      setStatus('error');
    }
  };

  return (
    <div className="p-4 space-y-4 bg-gray-50 min-h-screen pb-60 font-sans">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold mb-2 text-slate-800">S8 终极数据校验</h2>
        <div className="text-[10px] font-mono text-slate-400 mb-4 break-all bg-slate-100 p-2 rounded">
          TOKEN: {stolenToken || "未获取"}
        </div>
        <div className="grid grid-cols-1 gap-3">
          {Object.entries(overrides).map(([k, v]) => (
            <div key={k}>
              <label className="text-[10px] font-bold text-gray-400 uppercase">{k}</label>
              <input value={v} onChange={e => setOverrides(p => ({...p, [k]: e.target.value}))} className="w-full p-2 border border-gray-200 rounded-lg text-sm" />
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur p-4 border-t shadow-2xl">
        {status === 'success' && <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg text-center font-bold text-green-700">✅ 成功：{visionData?.message?.name}</div>}
        {status === 'error' && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-mono overflow-auto max-h-40">
            <pre>{JSON.stringify(visionData, null, 2)}</pre>
          </div>
        )}
        <button onClick={handleSubmit} disabled={status === 'loading'} className={`w-full font-bold py-4 rounded-xl text-lg shadow-lg ${status === 'loading' ? 'bg-gray-300' : 'bg-slate-900 text-white active:scale-95'}`}>
          {status === 'loading' ? '验证凭据中...' : '确认并最终提交'}
        </button>
      </div>
    </div>
  );
};
export default InboundDashboard;
