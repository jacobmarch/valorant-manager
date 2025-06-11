pub mod player;
pub mod team;
pub mod match_simulation;
pub mod economy;
pub mod tournament;

use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use uuid::Uuid;

pub use player::*;
pub use team::*;
pub use match_simulation::*;
pub use economy::*;
pub use tournament::*;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GameState {
    pub current_team: Option<Team>,
    pub current_season: u32,
    pub budget: i64,
    pub current_date: DateTime<Utc>,
    pub tournament_state: TournamentState,
    pub all_players: Vec<Player>,
    pub all_teams: Vec<Team>,
    pub match_history: Vec<MatchResult>,
}

impl Default for GameState {
    fn default() -> Self {
        Self::new()
    }
}

impl GameState {
    pub fn new() -> Self {
        Self {
            current_team: None,
            current_season: 2025,
            budget: 1_000_000, // Starting budget of $1M
            current_date: Utc::now(),
            tournament_state: TournamentState::new(),
            all_players: Vec::new(),
            all_teams: Vec::new(),
            match_history: Vec::new(),
        }
    }

    pub fn initialize_with_team(&mut self, team_name: String) {
        // Create a new team with basic roster
        let mut team = Team::new(team_name);
        
        // Generate initial roster
        for i in 0..5 {
            let player = Player::generate_random(format!("Player{}", i + 1));
            team.add_player(player.id);
            self.all_players.push(player);
        }
        
        self.current_team = Some(team);
        
        // Generate other teams for competition
        self.generate_league_teams();
    }

    fn generate_league_teams(&mut self) {
        let team_names = vec![
            "Sentinels", "Cloud9", "100 Thieves", "TSM", "Team Liquid",
            "NRG", "Evil Geniuses", "XSET", "The Guard", "OpTic Gaming"
        ];

        for name in team_names {
            let mut team = Team::new(name.to_string());
            
            // Generate roster for each team
            for i in 0..5 {
                let player = Player::generate_random(format!("{}_Player{}", name, i + 1));
                team.add_player(player.id);
                self.all_players.push(player);
            }
            
            self.all_teams.push(team);
        }
    }

    pub fn get_player_by_id(&self, id: Uuid) -> Option<&Player> {
        self.all_players.iter().find(|p| p.id == id)
    }

    pub fn get_player_by_id_mut(&mut self, id: Uuid) -> Option<&mut Player> {
        self.all_players.iter_mut().find(|p| p.id == id)
    }

    pub fn advance_day(&mut self) {
        self.current_date = self.current_date + chrono::Duration::days(1);
        
        // Update player morale, training effects, etc.
        for player in &mut self.all_players {
            player.daily_update();
        }
    }
} 