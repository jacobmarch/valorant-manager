use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MatchResult {
    pub id: Uuid,
    pub date: DateTime<Utc>,
    pub team1_id: Uuid,
    pub team2_id: Uuid,
    pub team1_score: u8,
    pub team2_score: u8,
    pub map: String,
    pub winner_id: Option<Uuid>,
    pub match_type: MatchType,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MatchType {
    Regular,
    Playoff,
    Kickoff,
    Masters,
    Champions,
}

impl MatchResult {
    pub fn new(
        team1_id: Uuid,
        team2_id: Uuid,
        team1_score: u8,
        team2_score: u8,
        map: String,
        match_type: MatchType,
    ) -> Self {
        let winner_id = if team1_score > team2_score {
            Some(team1_id)
        } else if team2_score > team1_score {
            Some(team2_id)
        } else {
            None // Draw (shouldn't happen in Valorant)
        };

        Self {
            id: Uuid::new_v4(),
            date: Utc::now(),
            team1_id,
            team2_id,
            team1_score,
            team2_score,
            map,
            winner_id,
            match_type,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlayerMatchStats {
    pub player_id: Uuid,
    pub kills: u8,
    pub deaths: u8,
    pub assists: u8,
    pub damage: u32,
    pub headshot_percentage: f32,
    pub first_kills: u8,
    pub clutches_won: u8,
    pub clutches_attempted: u8,
}

impl PlayerMatchStats {
    pub fn new(player_id: Uuid) -> Self {
        Self {
            player_id,
            kills: 0,
            deaths: 0,
            assists: 0,
            damage: 0,
            headshot_percentage: 0.0,
            first_kills: 0,
            clutches_won: 0,
            clutches_attempted: 0,
        }
    }

    pub fn kdr(&self) -> f32 {
        if self.deaths == 0 {
            self.kills as f32
        } else {
            self.kills as f32 / self.deaths as f32
        }
    }

    pub fn acs(&self) -> f32 {
        // Simplified Average Combat Score calculation
        (self.kills as f32 * 150.0 + self.assists as f32 * 50.0 + self.damage as f32 * 0.15) / 13.0
    }
} 