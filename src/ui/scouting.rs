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
                    // Left panel - Scouting actions (fixed width)
                    ui.allocate_ui_with_layout(
                        egui::Vec2::new(400.0, ui.available_height()),
                        egui::Layout::top_down(egui::Align::LEFT),
                        |ui| {
                        ui.heading("Scouting Operations");

                        ui.horizontal(|ui| {
                            ui.label("Scouting Budget:");
                            ui.label(format!("${}", self.scouting_budget));
                        });

                        ui.add_space(10.0);

                        let scout_button_text = if self.scouted_players.is_empty() {
                            "Scout New Players"
                        } else {
                            "Scout Fresh Players"
                        };
                        
                        if ui.button(scout_button_text).clicked() && self.scouting_budget >= 10_000 {
                            scout_new_players = true;
                        }
                        ui.label("Cost: $10,000 (refreshes player list)");

                        ui.add_space(20.0);
                        ui.horizontal(|ui| {
                            ui.heading("Available Players");
                            if !self.scouted_players.is_empty() {
                                ui.label(format!("({} found)", self.scouted_players.len()));
                            }
                        });

                        if self.scouted_players.is_empty() {
                            ui.label("No players scouted yet. Click 'Scout New Players' to discover talent.");
                        } else {
                            // Show all scouted players without scrolling - similar to squad screen
                            for &player_id in &self.scouted_players.iter().map(|p| p.id).collect::<Vec<_>>() {
                                if let Some(player) = self.scouted_players.iter().find(|p| p.id == player_id) {
                                    let is_selected = self.selected_player_id == Some(player_id);

                                    // Create the content area with non-selectable text first to get actual size
                                    let content_response = ui.allocate_ui_with_layout(
                                        [ui.available_width(), 0.0].into(),
                                        egui::Layout::top_down(egui::Align::LEFT),
                                        |ui| {
                                            ui.vertical(|ui| {
                                                ui.add_space(3.0);
                                                ui.add(egui::Label::new(egui::RichText::new(&player.name)
                                                    .monospace()
                                                    .strong()).selectable(false));
                                                
                                                ui.horizontal(|ui| {
                                                    ui.add(egui::Label::new(format!("Role: {:?}", player.preferred_role)).selectable(false));
                                                    ui.add(egui::Label::new(format!(
                                                        "Overall: {}",
                                                        player.attributes.overall_rating()
                                                    )).selectable(false));
                                                    ui.add(egui::Label::new(format!("Age: {}", player.age)).selectable(false));
                                                });

                                                ui.horizontal(|ui| {
                                                    ui.add(egui::Label::new(format!("Value: ${}", player.market_value)).selectable(false));
                                                    ui.add(egui::Label::new(format!("Salary: ${}/year", player.contract_salary)).selectable(false));
                                                });

                                                ui.horizontal(|ui| {
                                                    let can_afford = game_state.budget >= player.market_value;
                                                    let button_text = if can_afford {
                                                        format!("Sign for ${}", player.market_value)
                                                    } else {
                                                        "Can't Afford".to_string()
                                                    };
                                                    
                                                    ui.add_enabled_ui(can_afford, |ui| {
                                                        if ui.small_button(button_text).clicked() {
                                                            sign_player_id = Some(player_id);
                                                        }
                                                    });
                                                });
                                                ui.add_space(3.0);
                                            });
                                        }
                                    );

                                    // Create a full-width selection rectangle
                                    let full_width_rect = egui::Rect::from_min_size(
                                        egui::Pos2::new(content_response.response.rect.min.x - 5.0, content_response.response.rect.min.y),
                                        egui::Vec2::new(ui.available_width() + 10.0, content_response.response.rect.height())
                                    );

                                    // Draw selection highlighting over the full width
                                    if is_selected {
                                        // Use a more transparent selection color or border instead of solid fill
                                        let mut selection_color = ui.style().visuals.selection.bg_fill;
                                        selection_color = egui::Color32::from_rgba_unmultiplied(
                                            selection_color.r(),
                                            selection_color.g(), 
                                            selection_color.b(),
                                            60 // Much more transparent
                                        );
                                        ui.painter().rect_filled(
                                            full_width_rect,
                                            egui::Rounding::same(4.0),
                                            selection_color
                                        );
                                        // Add a border for better visibility
                                        ui.painter().rect_stroke(
                                            full_width_rect,
                                            egui::Rounding::same(4.0),
                                            egui::Stroke::new(2.0, ui.style().visuals.selection.bg_fill)
                                        );
                                    }

                                    // Create a clickable overlay that covers the full width area
                                    let click_response = ui.interact(
                                        full_width_rect,
                                        egui::Id::new(format!("scouted_click_{}", player_id)),
                                        egui::Sense::click()
                                    );

                                    if click_response.clicked() {
                                        self.selected_player_id = Some(player_id);
                                    }

                                    ui.separator();
                                }
                            }
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

                    // Right panel - Player details (fill remaining space)
                    ui.allocate_ui_with_layout(
                        egui::Vec2::new(ui.available_width(), ui.available_height()),
                        egui::Layout::top_down(egui::Align::LEFT),
                        |ui| {
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
            
            // Clear the existing list to refresh with new players
            self.scouted_players.clear();
            self.selected_player_id = None; // Clear selection since list is refreshed
            
            let mut rng = rand::thread_rng();
            let num_players = rng.gen_range(3..=5); // Generate 3-5 players
            for i in 0..num_players {
                let player = Player::generate_random(format!(
                    "Scout{}{}",
                    i + 1,
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
