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
            budget: 5_000_000, // Starting budget of $5M - increased for better player affordability
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

    pub fn initialize_with_existing_team(&mut self, team_name: String, team_nickname: String, region: String) {
        // Create the player's chosen team
        let mut team = Team::new_with_details(team_name, team_nickname, region);
        
        // Generate initial roster for the player's team
        for i in 0..5 {
            let player = Player::generate_random(format!("{}_Player{}", team.nickname, i + 1));
            team.add_player(player.id);
            self.all_players.push(player);
        }
        
        self.current_team = Some(team);
        
        // Generate all other teams from all leagues
        self.generate_all_league_teams();
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

    fn generate_all_league_teams(&mut self) {
        // Americas teams
        let americas_teams = vec![
            ("100 Thieves", "100T"), ("2GAME Esports", "2G"), ("Cloud9", "C9"),
            ("Evil Geniuses", "EG"), ("FURIA", "FUR"), ("G2 Esports", "G2"),
            ("KRÜ Esports", "KRU"), ("Leviatán", "LEV"), ("LOUD", "LOUD"),
            ("MIBR", "MIBR"), ("NRG", "NRG"), ("Sentinels", "SEN"),
        ];

        // EMEA teams
        let emea_teams = vec![
            ("Apeks", "APX"), ("BBL Esports", "BBL"), ("Fnatic", "FNC"),
            ("FUT Esports", "FUT"), ("Gentle Mates", "M8"), ("GIANTX", "GIA"),
            ("Karmine Corp", "KC"), ("KOI", "KOI"), ("Natus Vincere", "NAVI"),
            ("Team Heretics", "TH"), ("Team Liquid", "TL"), ("Team Vitality", "VIT"),
        ];

        // Pacific teams
        let pacific_teams = vec![
            ("BOOM Esports", "BOOM"), ("DetonatioN FocusMe", "DFM"), ("DRX", "DRX"),
            ("Gen.G Esports", "GENG"), ("Global Esports", "GE"), ("Nongshim RedForce", "NS"),
            ("Paper Rex", "PRX"), ("Rex Regum Qeon", "RRQ"), ("T1", "T1"),
            ("TALON", "TLN"), ("Team Secret", "TS"), ("ZETA DIVISION", "ZETA"),
        ];

        // China teams
        let china_teams = vec![
            ("All Gamers", "AG"), ("Bilibili Gaming", "BLG"), ("Dragon Ranger Gaming", "DRG"),
            ("EDward Gaming", "EDG"), ("FunPlus Phoenix", "FPX"), ("JD Gaming", "JDG"),
            ("Nova Esports", "NOVA"), ("Titan Esports Club", "TEC"), ("Trace Esports", "TE"),
            ("TYLOO", "TYL"), ("Wolves Esports", "WOL"), ("XLG Esports", "XLG"),
        ];

        // Generate teams for each region, excluding the player's team
        let current_team_name = self.current_team.as_ref().map(|t| t.name.clone());

        for (name, nickname) in americas_teams {
            if current_team_name.as_ref() != Some(&name.to_string()) {
                let mut team = Team::new_with_details(name.to_string(), nickname.to_string(), "Americas".to_string());
                self.generate_team_roster(&mut team);
                self.all_teams.push(team);
            }
        }

        for (name, nickname) in emea_teams {
            if current_team_name.as_ref() != Some(&name.to_string()) {
                let mut team = Team::new_with_details(name.to_string(), nickname.to_string(), "EMEA".to_string());
                self.generate_team_roster(&mut team);
                self.all_teams.push(team);
            }
        }

        for (name, nickname) in pacific_teams {
            if current_team_name.as_ref() != Some(&name.to_string()) {
                let mut team = Team::new_with_details(name.to_string(), nickname.to_string(), "Pacific".to_string());
                self.generate_team_roster(&mut team);
                self.all_teams.push(team);
            }
        }

        for (name, nickname) in china_teams {
            if current_team_name.as_ref() != Some(&name.to_string()) {
                let mut team = Team::new_with_details(name.to_string(), nickname.to_string(), "China".to_string());
                self.generate_team_roster(&mut team);
                self.all_teams.push(team);
            }
        }
    }

    fn generate_team_roster(&mut self, team: &mut Team) {
        for i in 0..5 {
            let player = Player::generate_random(format!("{}_Player{}", team.nickname, i + 1));
            team.add_player(player.id);
            self.all_players.push(player);
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