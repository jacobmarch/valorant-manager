use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum VCTEvent {
    Kickoff,
    MastersBangkok,
    Stage1,
    MastersToronto,
    Stage2,
    ChampionsParis,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TournamentState {
    pub current_event: VCTEvent,
    pub current_week: u8,
    pub events_completed: Vec<VCTEvent>,
    pub qualified_teams: Vec<Uuid>,
    pub championship_standings: Vec<ChampionshipStanding>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChampionshipStanding {
    pub team_id: Uuid,
    pub points: u32,
    pub wins: u32,
    pub losses: u32,
}

impl TournamentState {
    pub fn new() -> Self {
        Self {
            current_event: VCTEvent::Kickoff,
            current_week: 1,
            events_completed: Vec::new(),
            qualified_teams: Vec::new(),
            championship_standings: Vec::new(),
        }
    }

    pub fn advance_week(&mut self) {
        self.current_week += 1;
        
        // Simple progression logic - advance to next event after certain weeks
        match (&self.current_event, self.current_week) {
            (VCTEvent::Kickoff, 4) => {
                self.complete_event(VCTEvent::Kickoff);
                self.current_event = VCTEvent::MastersBangkok;
                self.current_week = 1;
            }
            (VCTEvent::MastersBangkok, 2) => {
                self.complete_event(VCTEvent::MastersBangkok);
                self.current_event = VCTEvent::Stage1;
                self.current_week = 1;
            }
            (VCTEvent::Stage1, 8) => {
                self.complete_event(VCTEvent::Stage1);
                self.current_event = VCTEvent::MastersToronto;
                self.current_week = 1;
            }
            (VCTEvent::MastersToronto, 2) => {
                self.complete_event(VCTEvent::MastersToronto);
                self.current_event = VCTEvent::Stage2;
                self.current_week = 1;
            }
            (VCTEvent::Stage2, 8) => {
                self.complete_event(VCTEvent::Stage2);
                self.current_event = VCTEvent::ChampionsParis;
                self.current_week = 1;
            }
            _ => {}
        }
    }

    fn complete_event(&mut self, event: VCTEvent) {
        self.events_completed.push(event);
    }

    pub fn add_championship_points(&mut self, team_id: Uuid, points: u32) {
        if let Some(standing) = self.championship_standings.iter_mut().find(|s| s.team_id == team_id) {
            standing.points += points;
        } else {
            self.championship_standings.push(ChampionshipStanding {
                team_id,
                points,
                wins: 0,
                losses: 0,
            });
        }
        
        // Sort standings by points
        self.championship_standings.sort_by(|a, b| b.points.cmp(&a.points));
    }

    pub fn record_match_result(&mut self, team_id: Uuid, won: bool) {
        if let Some(standing) = self.championship_standings.iter_mut().find(|s| s.team_id == team_id) {
            if won {
                standing.wins += 1;
                // Award 1 championship point for regular season wins
                if matches!(self.current_event, VCTEvent::Stage1 | VCTEvent::Stage2) {
                    standing.points += 1;
                }
            } else {
                standing.losses += 1;
            }
        }
    }

    pub fn get_team_standing(&self, team_id: Uuid) -> Option<&ChampionshipStanding> {
        self.championship_standings.iter().find(|s| s.team_id == team_id)
    }

    pub fn is_qualified_for_masters(&self, team_id: Uuid) -> bool {
        // Top 2 from Kickoff qualify for Masters Bangkok
        // Top 3 from Stage 1 qualify for Masters Toronto
        match self.current_event {
            VCTEvent::Kickoff => {
                self.championship_standings.iter().take(2).any(|s| s.team_id == team_id)
            }
            VCTEvent::Stage1 => {
                self.championship_standings.iter().take(3).any(|s| s.team_id == team_id)
            }
            _ => false,
        }
    }

    pub fn is_qualified_for_champions(&self, team_id: Uuid) -> bool {
        // Top 2 from Stage 2 + Top 2 CP leaders qualify for Champions
        if let Some(_standing) = self.get_team_standing(team_id) {
            // Simplified: top 4 teams by championship points qualify
            self.championship_standings.iter().take(4).any(|s| s.team_id == team_id)
        } else {
            false
        }
    }

    pub fn get_current_event_name(&self) -> &str {
        match self.current_event {
            VCTEvent::Kickoff => "VCT Kickoff",
            VCTEvent::MastersBangkok => "Masters Bangkok",
            VCTEvent::Stage1 => "VCT Stage 1",
            VCTEvent::MastersToronto => "Masters Toronto",
            VCTEvent::Stage2 => "VCT Stage 2",
            VCTEvent::ChampionsParis => "Champions Paris",
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Match {
    pub id: Uuid,
    pub team1_id: Uuid,
    pub team2_id: Uuid,
    pub scheduled_date: DateTime<Utc>,
    pub map: String,
    pub event: VCTEvent,
    pub completed: bool,
    pub result: Option<crate::game::MatchResult>,
}

impl Match {
    pub fn new(
        team1_id: Uuid,
        team2_id: Uuid,
        scheduled_date: DateTime<Utc>,
        map: String,
        event: VCTEvent,
    ) -> Self {
        Self {
            id: Uuid::new_v4(),
            team1_id,
            team2_id,
            scheduled_date,
            map,
            event,
            completed: false,
            result: None,
        }
    }
} 