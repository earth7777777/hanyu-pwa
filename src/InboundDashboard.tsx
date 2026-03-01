import React, { useState } from 'react';

const InboundDashboard = () => {
  const [status, setStatus] = useState('ok'); // loading, ok, warn, error

  return (
    <div className="p-4 space-y-6 bg-gray-50 min-h-screen pb-24 font-sans">
      {/* 1. 拍照/上传 + 不拍照理由 */}
      <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-1.5 h-5 bg-blue-600 rounded-full"></div>
          <h2 className="text-lg font-bold text-gray-800">1. 拍照/上传单据</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-center w-full h-40 border-2 border-dashed border-blue-100 rounded-xl bg-blue-50/30">
            <div className="text-center text-blue-600 font-medium text-sm">
              <div className="text-3xl mb-1">📷</div>
              <span>点击拍照或上传</span>
            </div>
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-400 mb-1 ml-1 font-medium">若未拍照，请填写理由</label>
            <input 
              type="text" 
              placeholder="请输入原因..." 
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* 2. 识别结果区 */}
      <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">2. 识别结果 (JSON)</h2>
        <details className="group bg-gray-50 rounded-lg border border-gray-100">
          <summary className="list-none p-3 text-sm text-gray-600 flex justify-between items-center cursor-pointer font-medium">
            <span>点击展开原始数据</span>
            <span className="transition-transform group-open:rotate-180">▼</span>
          </summary>
          <div className="p-3 border-t border-gray-100">
            <pre className="text-[10px] text-gray-500 font-mono overflow-auto max-h-40">
              {JSON.stringify({ vision: "等待识别...", ok: false }, null, 2)}
            </pre>
          </div>
        </details>
      </section>

      {/* 3. 主字段校对区 (Overrides) */}
      <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-1.5 h-5 bg-orange-500 rounded-full"></div>
          <h2 className="text-lg font-bold text-gray-800">3. 核心字段校对</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 text-sm">
          {[
            { id: 'f01', label: 'Material 物料' },
            { id: 'f02', label: 'Supplier 供应商' },
            { id: 'f03', label: 'Invoice No. 送货单号' },
            { id: 'f04', label: 'Gross Weight (吨) 毛重' },
            { id: 'f05', label: 'Package Qty 袋数' },
            { id: 'f08', label: 'Location 库位 (人工必填!!)', highlight: true },
            { id: 'f10', label: 'Exception 异常说明' },
            { id: 'f11', label: 'Remarks 备注说明' }
          ].map(field => (
            <div key={field.id} className="flex flex-col">
              <label className={`text-xs mb-1 ml-1 font-bold ${field.highlight ? 'text-red-500' : 'text-gray-500'}`}>
                {field.label}
              </label>
              <input 
                type="text" 
                className={`p-2.5 border rounded-lg bg-gray-50 focus:outline-none transition-all ${field.highlight ? 'border-red-200 focus:ring-2 focus:ring-red-100' : 'border-gray-200 focus:ring-2 focus:ring-blue-100'}`} 
                placeholder={`请输入 ${field.id}...`} 
              />
            </div>
          ))}
        </div>
      </section>

      {/* 4. 预埋区 (Meta) */}
      <section className="bg-gray-50/50 p-4 rounded-xl border border-dashed border-gray-200">
        <h2 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-widest">4. 预埋信息 (仅展示)</h2>
        <div className="grid grid-cols-2 gap-2 opacity-60">
          {['batch_no', 'external_bag_code', 'material_source_type', 'regrind_class'].map(key => (
            <div key={key} className="bg-white p-2 rounded border border-gray-100 flex flex-col">
              <span className="text-[10px] text-gray-400 font-mono truncate">{key}</span>
              <span className="text-xs text-gray-300">--</span>
            </div>
          ))}
        </div>
      </section>

      {/* 5. 提交区 (状态机) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md p-4 border-t border-gray-200 shadow-lg">
        <div className="max-w-md mx-auto flex flex-col space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-1.5">
              <div className={`w-2 h-2 rounded-full ${status === 'ok' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status: {status}</span>
            </div>
            <span className="text-[10px] font-mono text-gray-300">DRAFT: PENDING</span>
          </div>
          <button className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl active:scale-[0.98] transition-transform">
            生成 RM Inbound 草稿 (docstatus=0)
          </button>
        </div>
      </div>
    </div>
  );
};

export default InboundDashboard;
