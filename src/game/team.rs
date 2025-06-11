use serde::{Deserialize, Serialize};
use uuid::Uuid;
use crate::game::player::AgentRole;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Team {
    pub id: Uuid,
    pub name: String,
    pub players: Vec<Uuid>, // Player IDs
    pub starting_lineup: Vec<Uuid>, // 5 players
    pub coach: Option<String>,
    pub region: String,
    pub championship_points: u32,
    pub wins: u32,
    pub losses: u32,
    pub team_cohesion: u8, // 1-20 scale
}

impl Team {
    pub fn new(name: String) -> Self {
        Self {
            id: Uuid::new_v4(),
            name,
            players: Vec::new(),
            starting_lineup: Vec::new(),
            coach: None,
            region: "Americas".to_string(), // Default region for MVP
            championship_points: 0,
            wins: 0,
            losses: 0,
            team_cohesion: 10, // Start with average cohesion
        }
    }

    pub fn add_player(&mut self, player_id: Uuid) {
        if !self.players.contains(&player_id) {
            self.players.push(player_id);
            
            // Auto-add to starting lineup if we have less than 5 players
            if self.starting_lineup.len() < 5 {
                self.starting_lineup.push(player_id);
            }
        }
    }

    pub fn remove_player(&mut self, player_id: Uuid) {
        self.players.retain(|&id| id != player_id);
        self.starting_lineup.retain(|&id| id != player_id);
    }

    pub fn set_starting_lineup(&mut self, lineup: Vec<Uuid>) {
        if lineup.len() == 5 && lineup.iter().all(|id| self.players.contains(id)) {
            self.starting_lineup = lineup;
        }
    }

    pub fn get_win_rate(&self) -> f32 {
        if self.wins + self.losses == 0 {
            0.0
        } else {
            self.wins as f32 / (self.wins + self.losses) as f32
        }
    }

    pub fn record_match_result(&mut self, won: bool) {
        if won {
            self.wins += 1;
            self.improve_cohesion();
        } else {
            self.losses += 1;
            self.decrease_cohesion();
        }
    }

    pub fn improve_cohesion(&mut self) {
        if self.team_cohesion < 20 {
            self.team_cohesion += 1;
        }
    }

    pub fn decrease_cohesion(&mut self) {
        if self.team_cohesion > 1 {
            self.team_cohesion -= 1;
        }
    }

    pub fn add_championship_points(&mut self, points: u32) {
        self.championship_points += points;
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TeamComposition {
    pub duelist_count: u8,
    pub initiator_count: u8,
    pub controller_count: u8,
    pub sentinel_count: u8,
}

impl TeamComposition {
    pub fn new() -> Self {
        Self {
            duelist_count: 0,
            initiator_count: 0,
            controller_count: 0,
            sentinel_count: 0,
        }
    }

    pub fn add_role(&mut self, role: AgentRole) {
        match role {
            AgentRole::Duelist => self.duelist_count += 1,
            AgentRole::Initiator => self.initiator_count += 1,
            AgentRole::Controller => self.controller_count += 1,
            AgentRole::Sentinel => self.sentinel_count += 1,
        }
    }

    pub fn is_balanced(&self) -> bool {
        // A balanced composition typically has 1-2 duelists, 1 initiator, 1 controller, 1 sentinel
        self.duelist_count >= 1 && self.duelist_count <= 2 &&
        self.initiator_count >= 1 &&
        self.controller_count >= 1 &&
        self.sentinel_count >= 1 &&
        (self.duelist_count + self.initiator_count + self.controller_count + self.sentinel_count) == 5
    }
} 