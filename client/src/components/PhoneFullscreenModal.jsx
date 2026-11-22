import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Maximize,
  Minimize,
  QrCode,
  Copy,
  Check,
  X,
  Share2,
  Download,
  Wifi,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function PhoneFullscreenModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('android');
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));
  const [installPrompt, setInstallPrompt] = useState(null);

  // Network IP address detected on host machine
  const localNetworkUrl = 'http://10.240.14.104:5173';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(localNetworkUrl)}`;

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(localNetworkUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const toggleFullscreen = () => {
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(() => {});
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  };

  const handleNativeInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#24A36B] to-[#2FA878] p-5 text-white flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight brand-font flex items-center gap-1.5">
                <span>Open in Phone (Full Screen)</span>
                <span className="text-amber-300 text-xs">✨</span>
              </h3>
              <p className="text-xs text-emerald-100 font-medium">
                Run Fitora borderless like a native mobile app
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 space-y-5 overflow-y-auto">
          
          {/* Hardware Full Screen Action Banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black text-emerald-950 uppercase tracking-wide">
                Instant Immersive Mode
              </p>
              <p className="text-xs text-emerald-800 font-medium">
                Hide browser window borders & status bars
              </p>
            </div>
            <button
              onClick={toggleFullscreen}
              className="px-4 py-2 rounded-xl bg-[#24A36B] hover:bg-[#1E8D5B] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap active:scale-95 transition-all"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              <span>{isFullscreen ? 'Exit Full Screen' : 'Go Full Screen'}</span>
            </button>
          </div>

          {/* Native PWA Prompt Banner if browser supports beforeinstallprompt */}
          {installPrompt && (
            <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Download className="w-5 h-5 text-emerald-700" />
                <div>
                  <p className="text-xs font-black text-slate-800">1-Tap App Install Ready</p>
                  <p className="text-[11px] text-slate-600">Install directly to your device home screen</p>
                </div>
              </div>
              <button
                onClick={handleNativeInstall}
                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold rounded-xl shadow-xs cursor-pointer"
              >
                Install Now
              </button>
            </div>
          )}

          {/* Step 1: Scan QR or Open Network Link */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px]">1</span>
                <span>Open URL On Your Phone:</span>
              </span>
              <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                <Wifi className="w-3.5 h-3.5" /> Same Wi-Fi
              </span>
            </div>

            {/* QR Code and Link */}
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3 rounded-xl border border-slate-200">
              <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-2xs shrink-0 flex items-center justify-center">
                <img
                  src={qrCodeUrl}
                  alt="Scan QR code with phone"
                  className="w-28 h-28 object-contain"
                  loading="lazy"
                />
              </div>

              <div className="flex-1 w-full space-y-2">
                <p className="text-xs text-slate-600 font-medium">
                  Scan this QR code with your phone camera or type the address below in your phone browser:
                </p>
                <div className="flex items-center gap-1.5 bg-slate-100 p-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-800 break-all select-all">
                  <span className="flex-1 truncate">{localNetworkUrl}</span>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-white rounded-lg transition-colors cursor-pointer shrink-0"
                    title="Copy Link"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                {copied && (
                  <p className="text-[10px] font-bold text-emerald-700">✓ Address copied to clipboard!</p>
                )}
              </div>
            </div>
          </div>

          {/* Step 2: Convert into Full Screen App Mode */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px]">2</span>
                <span>Convert to 100% Full Screen App:</span>
              </span>
            </div>

            {/* Platform Selector Tabs */}
            <div className="flex rounded-xl bg-slate-200 p-1 text-xs font-bold">
              <button
                onClick={() => setActiveTab('android')}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'android'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🤖 Android (Chrome / Samsung)
              </button>
              <button
                onClick={() => setActiveTab('iphone')}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'iphone'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🍏 iPhone (iOS Safari)
              </button>
            </div>

            {/* Tab Instructions */}
            {activeTab === 'android' ? (
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2.5 text-xs text-slate-700">
                <div className="flex items-start gap-2.5">
                  <span className="font-extrabold text-emerald-700 text-sm">①</span>
                  <p>Open <b>Chrome</b> on your Android phone and load <code>{localNetworkUrl}</code>.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="font-extrabold text-emerald-700 text-sm">②</span>
                  <p>Tap the <b>three dots menu (⋮)</b> in the top right corner.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="font-extrabold text-emerald-700 text-sm">③</span>
                  <p>Tap <b>"Install app"</b> or <b>"Add to Home screen"</b>.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="font-extrabold text-emerald-700 text-sm">④</span>
                  <p className="font-semibold text-emerald-900">
                    🎉 Tap the new <b>Fitora icon</b> on your home screen — it will open in <b>100% borderless Full Screen</b> without any browser URL bar or bottom buttons!
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2.5 text-xs text-slate-700">
                <div className="flex items-start gap-2.5">
                  <span className="font-extrabold text-emerald-700 text-sm">①</span>
                  <p>Open <b>Safari</b> on your iPhone and go to <code>{localNetworkUrl}</code>.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="font-extrabold text-emerald-700 text-sm">②</span>
                  <p>Tap the <b>Share button</b> (the square with an arrow pointing up ⬆) at the bottom toolbar.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="font-extrabold text-emerald-700 text-sm">③</span>
                  <p>Scroll down the list and tap <b>"Add to Home Screen"</b>.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="font-extrabold text-emerald-700 text-sm">④</span>
                  <p className="font-semibold text-emerald-900">
                    🎉 Open Fitora from your iPhone Home Screen. Safari runs in <b>Standalone Full Screen</b> across the entire OLED screen and dynamic island!
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-[11px] text-slate-500 font-medium">
            PWA Standalone + Hardware Full Screen Ready
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
          >
            Got It
          </button>
        </div>

      </div>
    </div>
  );
}
