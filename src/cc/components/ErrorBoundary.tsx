import React from 'react';

interface Props { children: React.ReactNode }
interface State { err: Error | null }

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { err: null };

  static getDerivedStateFromError(err: Error): State {
    return { err };
  }

  componentDidCatch(err: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('Party Idle crashed:', err, info.componentStack);
  }

  reset = () => {
    try { localStorage.removeItem('cc_save_v1'); } catch {}
    window.location.reload();
  };

  reload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.err) return this.props.children;
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-[#0a0806] text-[#E8E0D4] p-8"
           style={{ fontFamily: "'Nunito', sans-serif" }}>
        <div className="max-w-xl w-full bg-[#1E1A16] border-2 border-[#E86E6E] rounded-xl p-6 space-y-4">
          <div className="text-2xl font-bold text-[#E86E6E]"
               style={{ fontFamily: "'Cinzel', serif" }}>
            ⚠ Party Idle hit a snag
          </div>
          <div className="text-sm text-[#B8A890]">
            Something went wrong while rendering. Your save file may be from an older version.
          </div>
          <pre className="bg-black/60 border border-[#3D3328] rounded p-2 text-xs text-[#ff9090] overflow-auto max-h-32"
               style={{ fontFamily: "'JetBrains Mono', monospace" }}>
{this.state.err.message}
          </pre>
          <div className="flex gap-2">
            <button onClick={this.reload}
                    className="flex-1 px-4 py-2 rounded bg-[#1E1A16] hover:bg-[#2B231B] border border-[#3D3328] text-[#E8E0D4] text-sm font-bold">
              Reload Page
            </button>
            <button onClick={this.reset}
                    className="flex-1 px-4 py-2 rounded bg-[#E86E6E] hover:bg-[#d85858] text-black text-sm font-bold">
              Reset Save & Reload
            </button>
          </div>
          <div className="text-[10px] text-[#7A6E60] uppercase tracking-widest text-center"
               style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            If this keeps happening, open DevTools (⌥⌘I) and copy the console error.
          </div>
        </div>
      </div>
    );
  }
}
