import Icon from "@/components/ui/icon";
import { Ad } from "@/lib/adsApi";

interface SoldDialogProps {
  ad: Ad;
  onConfirm: (soldOnOmo: boolean) => void;
  onClose: () => void;
}

export default function SoldDialog({ ad, onConfirm, onClose }: SoldDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center mb-5">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Icon name="CheckCircle" size={24} className="text-emerald-600" />
          </div>
          <h3 className="font-bold text-base">Где продали товар?</h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{ad.title}</p>
        </div>
        <div className="space-y-2.5">
          <button
            onClick={() => onConfirm(true)}
            className="w-full flex items-center gap-3 p-3.5 rounded-xl border-2 border-violet-500 bg-violet-50 hover:bg-violet-100 transition-colors text-left"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-cyan-500 rounded-lg flex items-center justify-center shrink-0">
              <Icon name="Zap" size={15} className="text-white" />
            </div>
            <div>
              <div className="font-semibold text-sm text-violet-700">Продано на OMO</div>
              <div className="text-xs text-muted-foreground">Сделка засчитается в статистику</div>
            </div>
          </button>
          <button
            onClick={() => onConfirm(false)}
            className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-border hover:bg-muted/40 transition-colors text-left"
          >
            <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center shrink-0">
              <Icon name="ExternalLink" size={15} className="text-muted-foreground" />
            </div>
            <div>
              <div className="font-semibold text-sm">Продано в другом месте</div>
              <div className="text-xs text-muted-foreground">Сделка не войдёт в статистику OMO</div>
            </div>
          </button>
        </div>
        <button onClick={onClose} className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors">
          Отмена
        </button>
      </div>
    </div>
  );
}
