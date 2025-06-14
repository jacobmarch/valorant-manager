use crate::game::{AgentRole, GameState, Player};
use eframe::egui;
use rand::Rng;

pub struct ScoutingScreen {
    scouted_players: Vec<Player>,
    selected_player_id: Option<uuid::Uuid>,
    scouting_budget: i64,
}

impl ScoutingScreen {
    pub fn new() -> Self {
        Self {
            scouted_players: Vec::new(),
            selected_player_id: None,
            scouting_budget: 50_000, // Starting scouting budget
        }
    }

    pub fn show(&mut self, ctx: &egui::Context, game_state: &mut GameState) {
        let mut scout_new_players = false;
        let mut sign_player_id: Option<uuid::Uuid> = None;

        egui::CentralPanel::default().show(ctx, |ui| {
            ui.heading("Scouting & Transfers");
            ui.separator();

            if let Some(_team) = &game_state.current_team {
                ui.horizontal(|ui| {
                    // Left panel - Scouting actions
                    ui.vertical(|ui| {
                        ui.heading("Scouting Operations");

                        ui.horizontal(|ui| {
                            ui.label("Scouting Budget:");
                            ui.label(format!("${}", self.scouting_budget));
                        });

                        ui.add_space(10.0);

                        if ui.button("Scout New Players").clicked() && self.scouting_budget >= 10_000 {
                            scout_new_players = true;
                        }
                        ui.label("Cost: $10,000");

                        ui.add_space(20.0);
                        ui.heading("Available Players");

                        if self.scouted_players.is_empty() {
                            ui.label("No players scouted yet. Click 'Scout New Players' to discover talent.");
                        } else {
                            egui::ScrollArea::vertical().show(ui, |ui| {
                                for player in &self.scouted_players {
                                    let is_selected = self.selected_player_id == Some(player.id);
                                    let selectable_id = format!("scouted_player_{}", player.id);

                                    if ui.selectable_label(is_selected, &player.name).clicked() {
                                        self.selected_player_id = Some(player.id);
                                    }

                                    ui.horizontal(|ui| {
                                        ui.label(format!("Role: {:?}", player.preferred_role));
                                        ui.label(format!("Overall: {}", player.attributes.overall_rating()));
                                        ui.label(format!("Value: ${}", player.market_value));
                                    });

                                    if ui.button("Sign Player").clicked() 
                                        && game_state.budget >= player.market_value {
                                        sign_player_id = Some(player.id);
                                    }
                                    ui.separator();
                                }
                            });
                        }

                        ui.add_space(20.0);
                        ui.heading("Scouting Regions");
                        ui.label("• North America");
                        ui.label("• Europe");
                        ui.label("• Asia-Pacific");
                        ui.label("• Brazil");
                        ui.add_space(10.0);
                        ui.label("Future: Region-specific scouting");
                    });

                    ui.separator();

                    // Right panel - Player details
                    ui.vertical(|ui| {
                        if let Some(player_id) = self.selected_player_id {
                            if let Some(player) = self.scouted_players.iter().find(|p| p.id == player_id) {
                                ui.heading(&player.name);
                                ui.separator();

                                ui.horizontal(|ui| {
                                    ui.label(format!("Age: {}", player.age));
                                    ui.label(format!("Nationality: {}", player.nationality));
                                });

                                ui.horizontal(|ui| {
                                    ui.label(format!("Preferred Role: {:?}", player.preferred_role));
                                    ui.label(format!("Overall Rating: {}", player.attributes.overall_rating()));
                                });

                                ui.horizontal(|ui| {
                                    ui.label(format!("Market Value: ${}", player.market_value));
                                    ui.label(format!("Salary Demand: ${}/year", player.contract_salary));
                                });

                                ui.add_space(10.0);
                                ui.heading("Attributes");

                                ui.label("Technical:");
                                ui.horizontal(|ui| {
                                    ui.label(format!("Aim: {}", player.attributes.aim));
                                    ui.label(format!("Utility: {}", player.attributes.utility_usage));
                                    ui.label(format!("Movement: {}", player.attributes.movement));
                                    ui.label(format!("Clutch: {}", player.attributes.clutch_potential));
                                });

                                ui.label("Mental:");
                                ui.horizontal(|ui| {
                                    ui.label(format!("Game Sense: {}", player.attributes.game_sense));
                                    ui.label(format!("Communication: {}", player.attributes.communication));
                                });
                                ui.horizontal(|ui| {
                                    ui.label(format!("Composure: {}", player.attributes.composure));
                                    ui.label(format!("Aggression: {}", player.attributes.aggression));
                                    ui.label(format!("Adaptability: {}", player.attributes.adaptability));
                                });

                                ui.add_space(10.0);
                                ui.heading("Role Proficiencies");

                                for role in [AgentRole::Duelist, AgentRole::Initiator, AgentRole::Controller, AgentRole::Sentinel] {
                                    let proficiency = player.get_role_proficiency(role);
                                    let progress = proficiency as f32 / 20.0;
                                    ui.horizontal(|ui| {
                                        ui.label(format!("{:?}:", role));
                                        ui.add(egui::ProgressBar::new(progress).text(format!("{}/20", proficiency)));
                                    });
                                }

                                ui.add_space(20.0);

                                let can_afford = game_state.budget >= player.market_value;
                                let button_text = if can_afford {
                                    format!("Sign for ${}", player.market_value)
                                } else {
                                    "Cannot Afford".to_string()
                                };

                                ui.add_enabled_ui(can_afford, |ui| {
                                    if ui.button(button_text).clicked() {
                                        sign_player_id = Some(player.id);
                                    }
                                });

                                if !can_afford {
                                    ui.colored_label(egui::Color32::RED, "Insufficient budget");
                                }
                            }
                        } else {
                            ui.label("Select a player to view details");
                        }
                    });
                });
            } else {
                ui.label("No team selected");
            }
        });

        if scout_new_players {
            self.scout_new_players();
        }

        if let Some(player_id) = sign_player_id {
            self.sign_player(player_id, game_state);
        }
    }

    fn scout_new_players(&mut self) {
        if self.scouting_budget >= 10_000 {
            self.scouting_budget -= 10_000;
            let mut rng = rand::thread_rng();
            let num_players = rng.gen_range(3..=5);
            for i in 0..num_players {
                let player = Player::generate_random(format!(
                    "Scout{}{}",
                    self.scouted_players.len() + i + 1,
                    rng.gen_range(100..999)
                ));
                self.scouted_players.push(player);
            }
        }
    }

    fn sign_player(&mut self, player_id: uuid::Uuid, game_state: &mut GameState) {
        if let Some(player_index) = self.scouted_players.iter().position(|p| p.id == player_id) {
            let player = self.scouted_players.remove(player_index);
            if game_state.budget >= player.market_value {
                game_state.budget -= player.market_value;
                if let Some(team) = &mut game_state.current_team {
                    team.add_player(player.id);
                }
                game_state.all_players.push(player);
                self.selected_player_id = None;
            }
        }
    }
}
