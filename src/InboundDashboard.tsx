import { useState, useEffect } from 'react';

const InboundDashboard = () => {
  const [status, setStatus] = useState('idle'); 
  const [visionData, setVisionData] = useState<any>(null);
  const [reason, setReason] = useState('');
  const [overrides, setOverrides] = useState({
    f01: 'PP再生料', f02: '宁波国睿新材料有限公司', f03: 'S7-FINAL-' + Date.now().toString().slice(-4), 
    f04: '1.0', f05: '40', f08: 'a2', f10: '', f11: 'S7主军帐验收'
  });

  // 核心修复：进入页面先调一个 GET 接口，强行唤醒浏览器的 Session 状态
  useEffect(() => {
    fetch('/api/method/frappe.auth.get_logged_user');
  }, []);

  const handleSubmit = async () => {
    setStatus('loading');
    setVisionData(null);
    try {
      // 从 Cookie 提取通行证 (如果没被 HttpOnly 锁死则能拿到)
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.trim().startsWith('frappe_csrftoken='))
        ?.split('=')[1] || "";

      const response = await fetch('/api/method/hanyu_warehouse.api.v1.vision_to_draft.create_rm_inbound_draft_from_receipt', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Frappe-CSRF-Token': csrfToken 
        },
        body: JSON.stringify({ exception_reason: reason || "S7补丁提交", overrides: overrides })
      });

      // 核心修复：如果报错，不再报连接失败，而是尝试读出后端报错页面的标题
      if (!response.ok) {
        const text = await response.text();
        const errorTitle = text.match(/<title>(.*?)<\/title>/)?.[1] || `HTTP ${response.status}`;
        throw new Error(errorTitle);
      }

      const res = await response.json();
      const data = res.message || res;
      setVisionData(data);
      setStatus(data.ok ? 'success' : 'error');
    } catch (err: any) {
      // 将报错细节直接打在屏幕上，不再猜
      setVisionData({ error: "请求被拒绝", detail: err.message });
      setStatus('error');
    }
  };

  return (
    <div className="p-4 space-y-6 bg-gray-50 min-h-screen pb-48 font-sans text-slate-900">
      <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold mb-3">1. 异常理由</h2>
        <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="未拍照理由..." className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
      </section>
      <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold mb-4 text-orange-600">2. 核心校对</h2>
        <div className="grid grid-cols-1 gap-3">
          {Object.entries(overrides).map(([key, val]) => (
            <div key={key}>
              <label className="text-[10px] font-bold text-gray-400 uppercase">{key}</label>
              <input type="text" value={val} onChange={(e) => setOverrides(prev => ({...prev, [key]: e.target.value}))} className="w-full p-2 border border-gray-200 rounded-lg text-sm" />
            </div>
          ))}
        </div>
      </section>
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur p-4 border-t shadow-2xl">
        {status === 'success' && <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg text-center font-bold text-green-700">✅ 草稿成功: {visionData?.draft?.name}</div>}
        {status === 'error' && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-mono">
            <strong>❌ 拦截反馈:</strong> {visionData?.error} <div className="mt-1 opacity-70">{visionData?.detail}</div>
          </div>
        )}
        <button onClick={handleSubmit} disabled={status === 'loading'} className={`w-full font-bold py-4 rounded-xl shadow-lg text-lg ${status === 'loading' ? 'bg-gray-400' : 'bg-slate-900 text-white active:scale-95'}`}>
          {status === 'loading' ? '正在创建...' : '确认并生成 RM Inbound 草稿'}
        </button>
      </div>
    </div>
  );
};
export default InboundDashboard;
