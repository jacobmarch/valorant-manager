use serde::{Deserialize, Serialize};
use uuid::Uuid;
use rand::Rng;

#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
pub enum AgentRole {
    Duelist,
    Initiator,
    Controller,
    Sentinel,
}

#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
pub enum Morale {
    Abysmal = 1,
    Poor = 2,
    Average = 3,
    Good = 4,
    Superb = 5,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlayerAttributes {
    // Technical Attributes
    pub aim: u8,              // 1-20 scale
    pub utility_usage: u8,
    pub movement: u8,
    pub clutch_potential: u8,
    
    // Mental Attributes
    pub game_sense: u8,
    pub communication: u8,
    pub composure: u8,
    pub aggression: u8,
    pub adaptability: u8,
    
    // Physical Attributes
    pub stamina: u8,
    pub natural_fitness: u8,
}

impl PlayerAttributes {
    pub fn generate_random() -> Self {
        let mut rng = rand::thread_rng();
        Self {
            aim: rng.gen_range(8..=18),
            utility_usage: rng.gen_range(8..=18),
            movement: rng.gen_range(8..=18),
            clutch_potential: rng.gen_range(8..=18),
            game_sense: rng.gen_range(8..=18),
            communication: rng.gen_range(8..=18),
            composure: rng.gen_range(8..=18),
            aggression: rng.gen_range(8..=18),
            adaptability: rng.gen_range(8..=18),
            stamina: rng.gen_range(10..=18),
            natural_fitness: rng.gen_range(10..=18),
        }
    }

    pub fn overall_rating(&self) -> u8 {
        let technical = (self.aim + self.utility_usage + self.movement + self.clutch_potential) / 4;
        let mental = (self.game_sense + self.communication + self.composure + self.aggression + self.adaptability) / 5;
        let physical = (self.stamina + self.natural_fitness) / 2;
        
        (technical * 4 + mental * 5 + physical * 1) / 10
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentProficiency {
    pub role: AgentRole,
    pub proficiency: u8, // 1-20 scale
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Player {
    pub id: Uuid,
    pub name: String,
    pub age: u8,
    pub nationality: String,
    pub attributes: PlayerAttributes,
    pub preferred_role: AgentRole,
    pub agent_proficiencies: Vec<AgentProficiency>,
    pub morale: Morale,
    pub contract_salary: i64,
    pub contract_length: u8, // years remaining
    pub market_value: i64,
    pub training_happiness: i8, // -10 to +10
}

impl Player {
    pub fn new(name: String) -> Self {
        let mut rng = rand::thread_rng();
        let preferred_role = match rng.gen_range(0..4) {
            0 => AgentRole::Duelist,
            1 => AgentRole::Initiator,
            2 => AgentRole::Controller,
            _ => AgentRole::Sentinel,
        };

        let attributes = PlayerAttributes::generate_random();
        let market_value = Self::calculate_market_value(&attributes);

        Self {
            id: Uuid::new_v4(),
            name,
            age: rng.gen_range(18..=28),
            nationality: "USA".to_string(), // Simplified for MVP
            preferred_role,
            agent_proficiencies: Self::generate_agent_proficiencies(preferred_role),
            attributes,
            morale: Morale::Average,
            contract_salary: market_value / 5, // Rough salary calculation
            contract_length: rng.gen_range(1..=4),
            market_value,
            training_happiness: 0,
        }
    }

    pub fn generate_random(name: String) -> Self {
        Self::new(name)
    }

    fn calculate_market_value(attributes: &PlayerAttributes) -> i64 {
        let overall = attributes.overall_rating() as i64;
        // Base value between $50k and $500k based on overall rating
        50_000 + (overall - 8) * 45_000
    }

    fn generate_agent_proficiencies(preferred_role: AgentRole) -> Vec<AgentProficiency> {
        let mut rng = rand::thread_rng();
        let mut proficiencies = Vec::new();

        // High proficiency in preferred role
        proficiencies.push(AgentProficiency {
            role: preferred_role,
            proficiency: rng.gen_range(14..=18),
        });

        // Lower proficiencies in other roles
        let other_roles = [AgentRole::Duelist, AgentRole::Initiator, AgentRole::Controller, AgentRole::Sentinel];
        for role in other_roles {
            if role != preferred_role {
                proficiencies.push(AgentProficiency {
                    role,
                    proficiency: rng.gen_range(6..=14),
                });
            }
        }

        proficiencies
    }

    pub fn get_role_proficiency(&self, role: AgentRole) -> u8 {
        self.agent_proficiencies
            .iter()
            .find(|p| p.role == role)
            .map(|p| p.proficiency)
            .unwrap_or(5)
    }

    pub fn daily_update(&mut self) {
        // Simple daily morale fluctuation
        let mut rng = rand::thread_rng();
        if rng.gen_bool(0.1) { // 10% chance of morale change
            match rng.gen_range(0..2) {
                0 => self.improve_morale(),
                _ => self.decrease_morale(),
            }
        }
    }

    pub fn improve_morale(&mut self) {
        self.morale = match self.morale {
            Morale::Abysmal => Morale::Poor,
            Morale::Poor => Morale::Average,
            Morale::Average => Morale::Good,
            Morale::Good => Morale::Superb,
            Morale::Superb => Morale::Superb,
        };
    }

    pub fn decrease_morale(&mut self) {
        self.morale = match self.morale {
            Morale::Abysmal => Morale::Abysmal,
            Morale::Poor => Morale::Abysmal,
            Morale::Average => Morale::Poor,
            Morale::Good => Morale::Average,
            Morale::Superb => Morale::Good,
        };
    }
} 