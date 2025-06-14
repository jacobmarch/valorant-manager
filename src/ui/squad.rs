use crate::game::{AgentRole, GameState};
use eframe::egui;

pub struct SquadScreen {
    selected_player_id: Option<uuid::Uuid>,
    starters_collapsed: bool,
    bench_collapsed: bool,
}

impl SquadScreen {
    pub fn new() -> Self {
        Self {
            selected_player_id: None,
            starters_collapsed: false,
            bench_collapsed: false,
        }
    }

    pub fn show(&mut self, ctx: &egui::Context, game_state: &mut GameState) {
        egui::CentralPanel::default().show(ctx, |ui| {
            ui.heading("Squad Management");
            ui.separator();

            if let Some(team) = &game_state.current_team {
                ui.horizontal(|ui| {
                    // Left panel - Player list with collapsible sections
                    ui.allocate_ui_with_layout(
                        [300.0, ui.available_height()].into(),
                        egui::Layout::top_down(egui::Align::LEFT),
                        |ui| {
                        
                        // Both sections now show all players without scrolling

                        // Starting Lineup Section
                        ui.horizontal(|ui| {
                            let chevron = if self.starters_collapsed { "⏵" } else { "⏷" };
                            if ui.add_sized(
                                [ui.available_width(), 30.0],
                                egui::Button::new(format!("{} Starting Lineup", chevron))
                            ).clicked() {
                                self.starters_collapsed = !self.starters_collapsed;
                            }
                        });

                        if !self.starters_collapsed {
                            // Show starters without scrolling - just display all players
                            for &player_id in &team.starting_lineup {
                                if let Some(player) = game_state.get_player_by_id(player_id) {
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
                                                    ui.add(egui::Label::new(format!("Morale: {:?}", player.morale)).selectable(false));
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
                                        egui::Id::new(format!("starter_click_{}", player_id)),
                                        egui::Sense::click()
                                    );

                                    if click_response.clicked() {
                                        self.selected_player_id = Some(player_id);
                                    }

                                    ui.separator();
                                }
                            }
                        }

                        ui.add_space(10.0);

                        // Bench Players Section
                        ui.horizontal(|ui| {
                            let chevron = if self.bench_collapsed { "⏵" } else { "⏷" };
                            if ui.add_sized(
                                [ui.available_width(), 30.0],
                                egui::Button::new(format!("{} Bench Players", chevron))
                            ).clicked() {
                                self.bench_collapsed = !self.bench_collapsed;
                            }
                        });

                        if !self.bench_collapsed {
                            // Show bench players without scrolling - just display all players
                            for &player_id in &team.players {
                                if !team.starting_lineup.contains(&player_id) {
                                    if let Some(player) = game_state.get_player_by_id(player_id) {
                                        let is_selected =
                                            self.selected_player_id == Some(player_id);

                                        // Create the content area with non-selectable text first to get actual size
                                        let content_response = ui.allocate_ui_with_layout(
                                            [ui.available_width(), 0.0].into(),
                                            egui::Layout::top_down(egui::Align::LEFT),
                                            |ui| {
                                                ui.vertical(|ui| {
                                                    ui.add_space(2.0);
                                                    ui.add(egui::Label::new(&player.name).selectable(false));
                                                    
                                                    ui.horizontal(|ui| {
                                                        ui.add(egui::Label::new(format!("Role: {:?}", player.preferred_role)).selectable(false));
                                                        ui.add(egui::Label::new(format!(
                                                            "Overall: {}",
                                                            player.attributes.overall_rating()
                                                        )).selectable(false));
                                                    });
                                                    ui.add_space(2.0);
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
                                            egui::Id::new(format!("bench_click_{}", player_id)),
                                            egui::Sense::click()
                                        );

                                        if click_response.clicked() {
                                            self.selected_player_id = Some(player_id);
                                        }

                                        ui.separator();
                                    }
                                }
                            }
                        }
                    }).response;

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
                                    ui.label(format!(
                                        "Preferred Role: {:?}",
                                        player.preferred_role
                                    ));
                                    ui.label(format!(
                                        "Overall Rating: {}",
                                        player.attributes.overall_rating()
                                    ));
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
                                    ui.label(format!(
                                        "Utility: {}",
                                        player.attributes.utility_usage
                                    ));
                                    ui.label(format!("Movement: {}", player.attributes.movement));
                                    ui.label(format!(
                                        "Clutch: {}",
                                        player.attributes.clutch_potential
                                    ));
                                });

                                // Mental attributes
                                ui.label("Mental:");
                                ui.horizontal(|ui| {
                                    ui.label(format!(
                                        "Game Sense: {}",
                                        player.attributes.game_sense
                                    ));
                                    ui.label(format!(
                                        "Communication: {}",
                                        player.attributes.communication
                                    ));
                                });
                                ui.horizontal(|ui| {
                                    ui.label(format!("Composure: {}", player.attributes.composure));
                                    ui.label(format!(
                                        "Aggression: {}",
                                        player.attributes.aggression
                                    ));
                                    ui.label(format!(
                                        "Adaptability: {}",
                                        player.attributes.adaptability
                                    ));
                                });

                                // Physical attributes
                                ui.label("Physical:");
                                ui.horizontal(|ui| {
                                    ui.label(format!("Stamina: {}", player.attributes.stamina));
                                    ui.label(format!(
                                        "Fitness: {}",
                                        player.attributes.natural_fitness
                                    ));
                                });

                                ui.add_space(10.0);
                                ui.heading("Role Proficiencies");

                                for role in [
                                    AgentRole::Duelist,
                                    AgentRole::Initiator,
                                    AgentRole::Controller,
                                    AgentRole::Sentinel,
                                ] {
                                    let proficiency = player.get_role_proficiency(role);
                                    let progress = proficiency as f32 / 20.0;
                                    ui.horizontal(|ui| {
                                        ui.label(format!("{:?}:", role));
                                        ui.add(
                                            egui::ProgressBar::new(progress)
                                                .text(format!("{}", proficiency)),
                                        );
                                    });
                                }

                                ui.add_space(20.0);
                                ui.heading("Contract");
                                ui.horizontal(|ui| {
                                    ui.label(format!("Salary: ${}/year", player.contract_salary));
                                    ui.label(format!(
                                        "Contract Length: {} years",
                                        player.contract_length
                                    ));
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
