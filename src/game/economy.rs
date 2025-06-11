use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
pub enum BuyPhase {
    FullBuy,
    HalfBuy,
    EcoRound,
    ForceBuy,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TeamFinances {
    pub budget: i64,
    pub monthly_income: i64,
    pub monthly_expenses: i64,
    pub player_salaries: i64,
    pub facility_costs: i64,
    pub marketing_budget: i64,
    pub prize_money: i64,
}

impl TeamFinances {
    pub fn new(starting_budget: i64) -> Self {
        Self {
            budget: starting_budget,
            monthly_income: 50_000, // Base monthly income
            monthly_expenses: 0,
            player_salaries: 0,
            facility_costs: 10_000, // Base facility costs
            marketing_budget: 5_000,
            prize_money: 0,
        }
    }

    pub fn calculate_monthly_expenses(&mut self) {
        self.monthly_expenses = self.player_salaries + self.facility_costs + self.marketing_budget;
    }

    pub fn monthly_update(&mut self) {
        self.calculate_monthly_expenses();
        self.budget += self.monthly_income - self.monthly_expenses;
    }

    pub fn add_prize_money(&mut self, amount: i64) {
        self.prize_money += amount;
        self.budget += amount;
    }

    pub fn can_afford(&self, amount: i64) -> bool {
        self.budget >= amount
    }

    pub fn spend(&mut self, amount: i64) -> bool {
        if self.can_afford(amount) {
            self.budget -= amount;
            true
        } else {
            false
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RoundEconomy {
    pub credits: u32,
    pub buy_phase: BuyPhase,
    pub weapons_cost: u32,
    pub utility_cost: u32,
    pub armor_cost: u32,
}

impl RoundEconomy {
    pub fn new() -> Self {
        Self {
            credits: 800, // Starting credits
            buy_phase: BuyPhase::EcoRound,
            weapons_cost: 0,
            utility_cost: 0,
            armor_cost: 0,
        }
    }

    pub fn determine_buy_phase(&mut self) {
        self.buy_phase = match self.credits {
            0..=2000 => BuyPhase::EcoRound,
            2001..=3500 => BuyPhase::HalfBuy,
            3501..=5000 => BuyPhase::ForceBuy,
            _ => BuyPhase::FullBuy,
        };
    }

    pub fn execute_buy(&mut self, buy_phase: BuyPhase) {
        match buy_phase {
            BuyPhase::FullBuy => {
                self.weapons_cost = 2900; // Phantom/Vandal
                self.armor_cost = 1000;   // Full armor
                self.utility_cost = 800;  // Full utility
            }
            BuyPhase::HalfBuy => {
                self.weapons_cost = 1600; // Spectre
                self.armor_cost = 400;    // Light armor
                self.utility_cost = 400;  // Some utility
            }
            BuyPhase::ForceBuy => {
                // Spend all available credits
                let total_available = self.credits;
                self.weapons_cost = (total_available * 60 / 100).min(2900);
                self.armor_cost = (total_available * 25 / 100).min(1000);
                self.utility_cost = total_available - self.weapons_cost - self.armor_cost;
            }
            BuyPhase::EcoRound => {
                self.weapons_cost = 0;    // Pistol only
                self.armor_cost = 0;      // No armor
                self.utility_cost = 200;  // Minimal utility
            }
        }

        let total_cost = self.weapons_cost + self.armor_cost + self.utility_cost;
        if total_cost <= self.credits {
            self.credits -= total_cost;
        }
        
        self.buy_phase = buy_phase;
    }

    pub fn add_credits(&mut self, amount: u32) {
        self.credits = (self.credits + amount).min(9000); // Max 9000 credits
    }

    pub fn round_win_bonus(&mut self) {
        self.add_credits(3000);
    }

    pub fn round_loss_bonus(&mut self, consecutive_losses: u8) {
        let bonus = match consecutive_losses {
            1 => 1900,
            2 => 2400,
            _ => 2900,
        };
        self.add_credits(bonus);
    }

    pub fn kill_bonus(&mut self, kills: u8) {
        self.add_credits(kills as u32 * 200);
    }

    pub fn spike_plant_bonus(&mut self) {
        self.add_credits(300);
    }
} 