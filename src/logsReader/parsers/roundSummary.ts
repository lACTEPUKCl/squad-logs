// parsers/playfabRoundSummary.ts
import { LogsReaderEvents } from '../../events';
import { TPlayfabRoundSummary } from '../../types';

export const playfabRoundSummary = (() => {
  let collecting = false;
  let time = '';
  let chainID = '';
  let firstLine = '';
  let buf: string[] = [];

  let depth = 0;
  let inString = false;
  let escaped = false;

  const startRe =
    /^\[([0-9.:-]+)]\[([ 0-9]*)]LogODKPlayFabProvider: .*?Payload:\s*(\{.*)?$/;

  function feed(chunk: string) {
    buf.push(chunk);
    for (let i = 0; i < chunk.length; i++) {
      const ch = chunk[i];

      if (escaped) { escaped = false; continue; }
      if (ch === '\\') { escaped = true; continue; }
      if (ch === '"') { inString = !inString; continue; }
      if (!inString) {
        if (ch === '{') depth++;
        else if (ch === '}') depth--;
      }
    }
  }

  function normalizeModsList(raw: unknown): string[] {
    if (!Array.isArray(raw)) return [];
    return raw
      .map((x) => (x == null ? '' : String(x).trim()))
      .filter((s) => s.length > 0);
  }

  function tryParse(): TPlayfabRoundSummary | null {
    const jsonText = buf.join('\n').trim();

    collecting = false;
    buf = [];
    const raw = `${firstLine}\n${jsonText}`;

    try {
      const payload = JSON.parse(jsonText) as any;

      const data: TPlayfabRoundSummary = {
        raw,
        time,
        chainID,
        event: LogsReaderEvents.ROUND_SUMMARY,

        sessionId: String(payload.session_id ?? ''),
        map: String(payload.Map ?? ''),
        layer: String(payload.Layer ?? ''),
        gameMode: String(payload.GameMode ?? ''),
        durationSec: Number(payload.Duration ?? 0),

        winFaction: String(payload.Win ?? ''),
        winTeamIndex: Number(payload.WinTeamIndex ?? -1),
        winTickets: Number(payload.WinTickets ?? 0),
        winPlayerCount: Number(payload.WinPlayerCount ?? 0),

        loseFaction: String(payload.Lose ?? ''),
        loseTickets: Number(payload.LoseTickets ?? 0),
        losePlayerCount: Number(payload.LosePlayerCount ?? 0),

        licensed: Boolean(payload.Licensed ?? false),

        detailsTeam1: payload.DetailsTeam1,
        detailsTeam2: payload.DetailsTeam2,
        modsList: normalizeModsList(payload.ModsList),
      };

      return data;
    } catch {
      return null;
    }
  }

  return (line: string): TPlayfabRoundSummary | null => {
    if (!collecting) {
      const m = line.match(startRe);
      if (!m) return null;

      collecting = true;
      time = m[1];
      chainID = m[2];
      firstLine = line;
      buf = [];
      depth = 0;
      inString = false;
      escaped = false;

      const after = line.split('Payload:')[1]!.trim();
      const idx = after.indexOf('{');
      if (idx !== -1) {
        const tail = after.slice(idx);
        feed(tail);
        if (depth === 0) return tryParse();
      }
      return null;
    }

    feed(line);
    if (depth > 0) return null;
    return tryParse();
  };
})();
