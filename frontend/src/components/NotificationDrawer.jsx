import React from 'react';
import {
  X,
  Bell,
  CheckCircle,
  AlertTriangle,
  Zap,
  Sun,
  ShieldAlert,
  CalendarCheck,
  Check,
} from 'lucide-react';

export default function NotificationDrawer({
  isOpen,
  onClose,
  notifications = [],
  onMarkRead,
  onMarkAllRead,
}) {
  if (!isOpen) return null;

  const getIcon = (type, severity) => {
    switch (type) {
      case 'LOW_BATTERY':
        return <Zap className="w-4 h-4 text-rose-600" />;
      case 'SOLAR_WINDOW':
        return <Sun className="w-4 h-4 text-amber-600" />;
      case 'BOOKING':
        return <CalendarCheck className="w-4 h-4 text-teal-600" />;
      case 'SECURITY':
        return <ShieldAlert className="w-4 h-4 text-red-600" />;
      default:
        return severity === 'SUCCESS' ? (
          <CheckCircle className="w-4 h-4 text-emerald-600" />
        ) : (
          <Bell className="w-4 h-4 text-slate-500" />
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
                <Bell className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Notifications & Alerts</h3>
            </div>
            <div className="flex items-center gap-2">
              {notifications.some((n) => !n.isRead) && (
                <button
                  onClick={onMarkAllRead}
                  className="text-xs text-teal-700 hover:text-teal-800 font-bold px-2 py-1 rounded-md hover:bg-teal-50"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                No notifications right now. System all clear!
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    notif.isRead
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : 'bg-white border-slate-200 shadow-sm ring-1 ring-slate-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 p-1.5 rounded-lg bg-slate-100">
                        {getIcon(notif.type, notif.severity)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 mb-0.5">{notif.title}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {!notif.isRead && (
                      <button
                        onClick={() => onMarkRead(notif.id)}
                        className="p-1 text-slate-400 hover:text-teal-600 hover:bg-slate-100 rounded"
                        title="Mark as read"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
