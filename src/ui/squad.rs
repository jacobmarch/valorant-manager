use eframe::egui;
use crate::game::{GameState, AgentRole};

pub struct SquadScreen {
    selected_player_id: Option<uuid::Uuid>,
}

impl SquadScreen {
    pub fn new() -> Self {
        Self {
            selected_player_id: None,
        }
    }

    pub fn show(&mut self, ctx: &egui::Context, game_state: &mut GameState) {
        egui::CentralPanel::default().show(ctx, |ui| {
            ui.heading("Squad Management");
            ui.separator();

            if let Some(team) = &game_state.current_team {
                ui.horizontal(|ui| {
                    // Left panel - Player list
                    ui.vertical(|ui| {
                        ui.heading("Starting Lineup");
                        
                        egui::ScrollArea::vertical().show(ui, |ui| {
                            for &player_id in &team.starting_lineup {
                                if let Some(player) = game_state.get_player_by_id(player_id) {
                                    let is_selected = self.selected_player_id == Some(player_id);
                                    
                                    if ui.selectable_label(is_selected, &player.name).clicked() {
                                        self.selected_player_id = Some(player_id);
                                    }
                                    
                                    ui.horizontal(|ui| {
                                        ui.label(format!("Role: {:?}", player.preferred_role));
                                        ui.label(format!("Overall: {}", player.attributes.overall_rating()));
                                        ui.label(format!("Morale: {:?}", player.morale));
                                    });
                                    ui.separator();
                                }
                            }
                        });
                        
                        ui.add_space(20.0);
                        ui.heading("Bench Players");
                        
                        egui::ScrollArea::vertical().show(ui, |ui| {
                            for &player_id in &team.players {
                                if !team.starting_lineup.contains(&player_id) {
                                    if let Some(player) = game_state.get_player_by_id(player_id) {
                                        let is_selected = self.selected_player_id == Some(player_id);
                                        
                                        if ui.selectable_label(is_selected, &player.name).clicked() {
                                            self.selected_player_id = Some(player_id);
                                        }
                                        
                                        ui.horizontal(|ui| {
                                            ui.label(format!("Role: {:?}", player.preferred_role));
                                            ui.label(format!("Overall: {}", player.attributes.overall_rating()));
                                        });
                                        ui.separator();
                                    }
                                }
                            }
                        });
                    });

                    ui.separator();

                    // Right panel - Player details
                    ui.vertical(|ui| {
                        if let Some(player_id) = self.selected_player_id {
                            if let Some(player) = game_state.get_player_by_id(player_id) {
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
                                    ui.label(format!("Morale: {:?}", player.morale));
                                    ui.label(format!("Market Value: ${}", player.market_value));
                                });
                                
                                ui.add_space(10.0);
                                ui.heading("Attributes");
                                
                                // Technical attributes
                                ui.label("Technical:");
                                ui.horizontal(|ui| {
                                    ui.label(format!("Aim: {}", player.attributes.aim));
                                    ui.label(format!("Utility: {}", player.attributes.utility_usage));
                                    ui.label(format!("Movement: {}", player.attributes.movement));
                                    ui.label(format!("Clutch: {}", player.attributes.clutch_potential));
                                });
                                
                                // Mental attributes
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
                                
                                // Physical attributes
                                ui.label("Physical:");
                                ui.horizontal(|ui| {
                                    ui.label(format!("Stamina: {}", player.attributes.stamina));
                                    ui.label(format!("Fitness: {}", player.attributes.natural_fitness));
                                });
                                
                                ui.add_space(10.0);
                                ui.heading("Role Proficiencies");
                                
                                for role in [AgentRole::Duelist, AgentRole::Initiator, AgentRole::Controller, AgentRole::Sentinel] {
                                    let proficiency = player.get_role_proficiency(role);
                                    ui.horizontal(|ui| {
                                        ui.label(format!("{:?}:", role));
                                        ui.label(format!("{}/20", proficiency));
                                        
                                        // Simple progress bar
                                        let progress = proficiency as f32 / 20.0;
                                        ui.add(egui::ProgressBar::new(progress).text(format!("{}", proficiency)));
                                    });
                                }
                                
                                ui.add_space(20.0);
                                ui.heading("Contract");
                                ui.horizontal(|ui| {
                                    ui.label(format!("Salary: ${}/year", player.contract_salary));
                                    ui.label(format!("Contract Length: {} years", player.contract_length));
                                });
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
    }
} 