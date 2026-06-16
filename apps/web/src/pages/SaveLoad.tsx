import { useRef, useState } from 'react';
import { useGameStore } from '../store/useGameStore';

export function SaveLoad() {
  const exportSave = useGameStore((state) => state.exportSave);
  const importSave = useGameStore((state) => state.importSave);
  const deleteSave = useGameStore((state) => state.deleteSave);
  const [message, setMessage] = useState('Auto-save is active in this browser.');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const blob = new Blob([exportSave()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'valorant-manager-save.json';
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage('Save exported.');
  };

  const handleImport = async (file: File | undefined) => {
    if (!file) {
      return;
    }

    try {
      importSave(await file.text());
      setMessage('Save imported successfully.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not import save.');
    } finally {
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  return (
    <section className="max-w-3xl">
      <p className="text-sm uppercase tracking-[0.4em] text-valorant">Save Data</p>
      <h1 className="mt-2 text-3xl font-black">Save / Load</h1>
      <p className="mt-3 text-slate-400">Your career auto-saves to browser localStorage. You can also export a JSON backup or import one here.</p>
      <div className="mt-6 rounded-2xl border border-white/10 bg-panel p-6">
        <p className="rounded-xl bg-slate-950 p-4 text-slate-300">{message}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button className="rounded-xl bg-valorant px-5 py-3 font-bold text-white" onClick={handleExport}>
            Export JSON
          </button>
          <button className="rounded-xl bg-white px-5 py-3 font-bold text-slate-950" onClick={() => inputRef.current?.click()}>
            Import JSON
          </button>
          <button
            className="rounded-xl border border-red-400/40 bg-red-500/10 px-5 py-3 font-bold text-red-200"
            onClick={() => {
              deleteSave();
              setMessage('Save deleted. Start a new career from the main menu.');
            }}
          >
            Delete Save
          </button>
          <input ref={inputRef} className="hidden" type="file" accept="application/json,.json" onChange={(event) => void handleImport(event.target.files?.[0])} />
        </div>
      </div>
    </section>
  );
}
