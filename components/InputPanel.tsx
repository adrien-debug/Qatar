"use client";

import { MiningParams } from "@/lib/financial-calculations";

interface InputPanelProps {
  miningParams: MiningParams;
  onParamsChange: (params: Partial<MiningParams>) => void;
}

export default function InputPanel({
  miningParams,
  onParamsChange,
}: InputPanelProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <h3 className="text-xl font-semibold mb-4 text-hearst-text">
        Paramètres Financiers
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prix Bitcoin (USD)
          </label>
          <input
            type="number"
            value={miningParams.btcPrice}
            onChange={(e) =>
              onParamsChange({ btcPrice: parseFloat(e.target.value) })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hearst-green focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulté Réseau (T)
          </label>
          <input
            type="number"
            value={miningParams.networkDifficulty}
            onChange={(e) =>
              onParamsChange({
                networkDifficulty: parseFloat(e.target.value),
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hearst-green focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hashrate par MW (PH)
          </label>
          <input
            type="number"
            step="0.1"
            value={miningParams.hashratePerMW}
            onChange={(e) =>
              onParamsChange({
                hashratePerMW: parseFloat(e.target.value),
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hearst-green focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Uptime (%)
          </label>
          <input
            type="number"
            step="0.1"
            value={miningParams.uptime}
            onChange={(e) =>
              onParamsChange({ uptime: parseFloat(e.target.value) })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hearst-green focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pool Fee (%)
          </label>
          <input
            type="number"
            step="0.1"
            value={miningParams.poolFee}
            onChange={(e) =>
              onParamsChange({ poolFee: parseFloat(e.target.value) })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hearst-green focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}


