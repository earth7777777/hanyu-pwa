import { useState } from 'react';

const InboundDashboard = () => {
  const [status, setStatus] = useState('ok'); 
  const [visionData, setVisionData] = useState({ vision: "等待识别...", ok: false });
  const [reason, setReason] = useState('');

  const handleQuickTest = async () => {
    setStatus('loading');
    try {
      const response = await fetch('/api/method/hanyu_warehouse.api.v1.vision_to_draft.create_rm_inbound_draft_from_receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exception_reason: reason || "S4最短联通测试" })
      });
      const res = await response.json();
      setVisionData(res.message || res);
      setStatus('ok');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <div className="p-4 space-y-6 bg-gray-50 min-h-screen pb-24 font-sans">
      <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-1.5 h-5 bg-blue-600 rounded-full"></div>
          <h2 className="text-lg font-bold text-gray-800">1. 拍照/上传单据</h2>
        </div>
        <div className="space-y-3">
          <div className="flex flex-col">
            <label className="text-xs text-gray-400 mb-1 ml-1 font-medium">若未拍照，请填写理由</label>
            <input 
              type="text" 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="请输入原因..." 
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <button 
            onClick={handleQuickTest}
            className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg text-sm active:bg-blue-700"
          >
            最短联通测试（不拍照+理由）
          </button>
        </div>
      </section>

      <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">2. 识别结果 (JSON)</h2>
        <details className="group bg-gray-50 rounded-lg border border-gray-100" open>
          <summary className="list-none p-3 text-sm text-gray-600 flex justify-between items-center cursor-pointer font-medium">
            <span>原始数据</span>
            <span className="transition-transform group-open:rotate-180">▼</span>
          </summary>
          <div className="p-3 border-t border-gray-100">
            <pre className="text-[10px] text-gray-500 font-mono overflow-auto max-h-60">
              {JSON.stringify(visionData, null, 2)}
            </pre>
          </div>
        </details>
      </section>

      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md p-4 border-t border-gray-200 shadow-lg text-center">
        <span className={`text-[10px] font-bold uppercase tracking-widest ${status === 'loading' ? 'text-blue-500' : 'text-gray-400'}`}>
          System Status: {status}
        </span>
      </div>
    </div>
  );
};

export default InboundDashboard;
