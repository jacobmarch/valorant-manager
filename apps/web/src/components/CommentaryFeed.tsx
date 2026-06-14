type CommentaryFeedProps = {
  lines: string[];
};

export function CommentaryFeed({ lines }: CommentaryFeedProps) {
  return (
    <div className="panel h-[28rem] overflow-y-auto p-4">
      {lines.length === 0 ? (
        <p className="text-slate-400">No rounds played yet. Step the match to begin the live feed.</p>
      ) : (
        <ol className="space-y-3">
          {lines.map((line, index) => (
            <li key={`${line}-${index}`} className="rounded-xl bg-slate-950/70 p-3 text-sm text-slate-200">
              {line}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
