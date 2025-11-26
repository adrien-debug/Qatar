import { TrendingUp, Coins, DollarSign, Activity, Calendar, Zap } from "lucide-react";
import { DealAResult, DealBResult } from "@/lib/financial-calculations";

const safeToFixed = (value: number | undefined | null, decimals: number): string => {
  if (value === undefined || value === null || isNaN(value)) return "0";
  return value.toFixed(decimals);
};

const formatCurrency = (value: number | undefined | null): string => {
  const num = value ?? 0;
  if (isNaN(num) || num === 0) return "$0";
  
  if (Math.abs(num) >= 1000000) {
    const millions = num / 1000000;
    return `$${safeToFixed(millions, millions >= 10 ? 1 : 2)}M`;
  } else if (Math.abs(num) >= 1000) {
    const thousands = num / 1000;
    return `$${safeToFixed(thousands, thousands >= 10 ? 1 : 2)}K`;
  } else {
    return `$${safeToFixed(num, 2)}`;
  }
};

interface ReportResultsProps {
  dealAResult?: DealAResult | null;
  dealBResult?: DealBResult | null;
  dealType: "revenue" | "mw";
}

export default function ReportResults({ dealAResult, dealBResult, dealType }: ReportResultsProps) {
  return null;
}

