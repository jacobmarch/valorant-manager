import { useRef, useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { Button, Card, Eyebrow } from '../components/ui';

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
    <section className="max-w-3xl space-y-6">
      <div>
        <Eyebrow>Save Data</Eyebrow>
        <h1 className="mt-2 text-3xl font-black tracking-tight">Save / Load</h1>
        <p className="mt-1 text-sm text-muted">Your career auto-saves to browser localStorage. Export a JSON backup or import one here.</p>
      </div>

      <Card className="p-6">
        <p className="rounded-xl border border-line bg-surface-2 px-4 py-3 text-sm text-muted">{message}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button onClick={handleExport}>Export JSON</Button>
          <Button variant="ghost" onClick={() => inputRef.current?.click()}>
            Import JSON
          </Button>
          <button
            className="rounded-xl border border-negative/40 bg-negative/10 px-4 py-2.5 text-sm font-bold text-negative transition hover:bg-negative/20"
            onClick={() => {
              deleteSave();
              setMessage('Save deleted. Start a new career from the main menu.');
            }}
          >
            Delete Save
          </button>
          <input ref={inputRef} className="hidden" type="file" accept="application/json,.json" onChange={(event) => void handleImport(event.target.files?.[0])} />
        </div>
      </Card>
    </section>
  );
}
