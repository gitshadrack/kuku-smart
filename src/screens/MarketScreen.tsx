import { ListPlus, Search, ShoppingCart } from 'lucide-react';

import { useFarmData } from '../app/hooks';

import { RouteKey } from '../app/routes';

import { SectionHeader, StatCard, TitleBlock, formatMoney } from '../components/ui';

import { GenericList } from './GenericList';

export function MarketScreen({ data, setCurrent }: { data: ReturnType<typeof useFarmData>; setCurrent: (r: RouteKey) => void }) {
  return (
    <>
      <TitleBlock title="Marketplace" />
      <label className="relative mb-stack-lg block">
        <Search className="absolute left-4 top-3 text-outline" size={22} />
        <input className="h-touch-target w-full rounded-xl border border-outline-variant bg-white pl-12 pr-4 outline-none focus:border-primary" placeholder="Search buyers or commodities..." />
      </label>
      <button onClick={() => setCurrent('list_produce_for_sale_1')} className="mb-stack-lg flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary-container font-bold text-white">
        <ListPlus size={20} /> List Produce for Sale
      </button>
      <SectionHeader title="Live Market Prices" />
      <div className="mb-stack-lg grid grid-cols-2 gap-gutter-mobile md:grid-cols-4">
        {['Eggs (Tray)|KES 450|+2.4%', 'Broilers (kg)|KES 380|-1.1%', 'Manure (Bag)|KES 120|Stable', 'Layers (Live)|KES 850|+0.5%'].map((raw) => {
          const [label, price, trend] = raw.split('|');
          return <div className="record-card p-4" key={label}><p className="text-xs text-outline">{label}</p><p className="font-heading text-xl font-bold">{price}</p><p className={`text-xs font-bold ${trend.startsWith('-') ? 'text-error' : 'text-primary'}`}>{trend}</p></div>;
        })}
      </div>
      <GenericList title="Top Buyers Nearby" icon={<ShoppingCart size={22} />} items={data.buyers.map((buyer) => ({ title: buyer.name, meta: `${buyer.county} - ${buyer.specialty}`, amount: buyer.phone }))} />
    </>
  );
}
