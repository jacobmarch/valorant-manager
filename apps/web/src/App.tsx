import { AppShell } from './components/AppShell';
import { AroundLeague } from './pages/AroundLeague';
import { Dashboard } from './pages/Dashboard';
import { MainMenu } from './pages/MainMenu';
import { MatchHistory } from './pages/MatchHistory';
import { MatchScreen } from './pages/MatchScreen';
import { Roster } from './pages/Roster';
import { SaveLoad } from './pages/SaveLoad';
import { Schedule } from './pages/Schedule';
import { Standings } from './pages/Standings';
import { useGameStore } from './store/useGameStore';

export default function App() {
  const game = useGameStore((state) => state.game);
  const screen = useGameStore((state) => state.screen);

  if (!game) {
    return <MainMenu />;
  }

  return (
    <AppShell>
      {screen === 'dashboard' && <Dashboard />}
      {screen === 'roster' && <Roster />}
      {screen === 'schedule' && <Schedule />}
      {screen === 'standings' && <Standings />}
      {screen === 'match' && <MatchScreen />}
      {screen === 'aroundLeague' && <AroundLeague />}
      {screen === 'history' && <MatchHistory />}
      {screen === 'saves' && <SaveLoad />}
    </AppShell>
  );
}
