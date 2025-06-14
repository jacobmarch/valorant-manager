use crate::game::{AgentRole, GameState};
use eframe::egui;

pub struct SquadScreen {
    selected_player_id: Option<uuid::Uuid>,
    starters_collapsed: bool,
    bench_collapsed: bool,
    dragging_player_id: Option<uuid::Uuid>,
    drop_target_position: Option<(bool, usize)>, // (is_starters, position)
    drag_origin: Option<(bool, usize)>, // Track where the drag started from (is_starters, original_position)
}

impl SquadScreen {
    pub fn new() -> Self {
        Self {
            selected_player_id: None,
            starters_collapsed: false,
            bench_collapsed: false,
            dragging_player_id: None,
            drop_target_position: None,
            drag_origin: None,
        }
    }

    pub fn show(&mut self, ctx: &egui::Context, game_state: &mut GameState) {
        egui::CentralPanel::default().show(ctx, |ui| {
            ui.heading("Squad Management");
            ui.separator();

            // Clone the team data to avoid borrowing issues
            let team_data = game_state.current_team.clone();
            if let Some(mut team) = team_data {
                ui.horizontal(|ui| {
                    // Left panel - Player list with collapsible sections
                    ui.allocate_ui_with_layout(
                        [300.0, ui.available_height()].into(),
                        egui::Layout::top_down(egui::Align::LEFT),
                        |ui| {
                        
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
                            self.show_player_list(ui, &mut team, game_state, true);
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
                            self.show_player_list(ui, &mut team, game_state, false);
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
                
                // Update the game state with the modified team
                game_state.current_team = Some(team);
            } else {
                ui.label("No team selected");
            }
        });

        // Handle drag cancellation (mouse released outside valid drop zones)
        if self.dragging_player_id.is_some() && ctx.input(|i| i.pointer.any_released()) {
            // If we reach here, the drag ended but wasn't handled by any drop zone
            if let Some(mut team) = game_state.current_team.clone() {
                if let Some(dragged_id) = self.dragging_player_id {
                    self.handle_drag_end(&mut team, dragged_id);
                    game_state.current_team = Some(team);
                }
            }
        }

        // Draw the floating player card if dragging
        if let Some(dragged_player_id) = self.dragging_player_id {
            if let Some(team) = &game_state.current_team {
                if let Some(player) = game_state.get_player_by_id(dragged_player_id) {
                    self.draw_floating_player_card(ctx, player, team.starting_lineup.contains(&dragged_player_id));
                }
            }
        }
    }

    fn show_player_list(&mut self, ui: &mut egui::Ui, team: &mut crate::game::Team, game_state: &GameState, is_starters: bool) {
        let players: Vec<uuid::Uuid> = if is_starters {
            team.starting_lineup.clone()
        } else {
            team.players.iter().filter(|&&id| !team.starting_lineup.contains(&id)).cloned().collect()
        };

        // Reset drop target if not dragging
        if self.dragging_player_id.is_none() {
            self.drop_target_position = None;
        }

        for (index, &player_id) in players.iter().enumerate() {
            // Show drop zone before this player if hovering
            if let Some((target_is_starters, target_pos)) = self.drop_target_position {
                if target_is_starters == is_starters && target_pos == index {
                    self.show_drop_zone(ui);
                }
            }

            // Skip rendering the player being dragged (it will be rendered at cursor)
            if self.dragging_player_id == Some(player_id) {
                continue;
            }

            if let Some(player) = game_state.get_player_by_id(player_id) {
                let is_selected = self.selected_player_id == Some(player_id);

                // Create the content area
                let content_response = ui.allocate_ui_with_layout(
                    [ui.available_width(), 0.0].into(),
                    egui::Layout::top_down(egui::Align::LEFT),
                    |ui| {
                        ui.vertical(|ui| {
                            ui.add_space(if is_starters { 3.0 } else { 2.0 });
                            
                            let name_text = if is_starters {
                                egui::RichText::new(&player.name).monospace().strong()
                            } else {
                                egui::RichText::new(&player.name)
                            };
                            ui.add(egui::Label::new(name_text).selectable(false));
                            
                            ui.horizontal(|ui| {
                                ui.add(egui::Label::new(format!("Role: {:?}", player.preferred_role)).selectable(false));
                                ui.add(egui::Label::new(format!(
                                    "Overall: {}",
                                    player.attributes.overall_rating()
                                )).selectable(false));
                                if is_starters {
                                    ui.add(egui::Label::new(format!("Morale: {:?}", player.morale)).selectable(false));
                                }
                            });
                            ui.add_space(if is_starters { 3.0 } else { 2.0 });
                        });
                    }
                );

                // Create interaction rectangle
                let full_width_rect = egui::Rect::from_min_size(
                    egui::Pos2::new(content_response.response.rect.min.x - 5.0, content_response.response.rect.min.y),
                    egui::Vec2::new(ui.available_width() + 10.0, content_response.response.rect.height())
                );

                // Draw selection highlighting
                if is_selected {
                    let mut selection_color = ui.style().visuals.selection.bg_fill;
                    selection_color = egui::Color32::from_rgba_unmultiplied(
                        selection_color.r(),
                        selection_color.g(), 
                        selection_color.b(),
                        60
                    );
                    ui.painter().rect_filled(
                        full_width_rect,
                        egui::Rounding::same(4.0),
                        selection_color
                    );
                    ui.painter().rect_stroke(
                        full_width_rect,
                        egui::Rounding::same(4.0),
                        egui::Stroke::new(2.0, ui.style().visuals.selection.bg_fill)
                    );
                }

                // Handle interactions
                let interact_response = ui.interact(
                    full_width_rect,
                    egui::Id::new(format!("player_interact_{}_{}", if is_starters { "starter" } else { "bench" }, player_id)),
                    egui::Sense::click_and_drag()
                );

                if interact_response.clicked() {
                    self.selected_player_id = Some(player_id);
                }

                // Handle drag start
                if interact_response.drag_started() {
                    self.dragging_player_id = Some(player_id);
                    self.drag_origin = Some((is_starters, index));
                }

                // Handle drag end
                if interact_response.drag_stopped() && self.dragging_player_id == Some(player_id) {
                    self.handle_drag_end(team, player_id);
                }

                // Update drop target position when hovering during drag
                if self.dragging_player_id.is_some() && self.dragging_player_id != Some(player_id) {
                    if interact_response.hovered() {
                        // Calculate the correct drop position accounting for the dragged player being temporarily removed
                        let drop_pos = if let Some(_dragged_id) = self.dragging_player_id {
                            if let Some((origin_is_starters, origin_pos)) = self.drag_origin {
                                if origin_is_starters == is_starters && origin_is_starters && origin_pos < index {
                                    // Dragged player was originally before this position in the same list
                                    index
                                } else {
                                    index
                                }
                            } else {
                                index
                            }
                        } else {
                            index
                        };
                        self.drop_target_position = Some((is_starters, drop_pos));
                    }
                }

                ui.separator();
            }
        }

        // Show drop zone at the end if hovering there
        if let Some((target_is_starters, target_pos)) = self.drop_target_position {
            if target_is_starters == is_starters && target_pos == players.len() {
                self.show_drop_zone(ui);
            }
        }

        // Handle dropping at the end of the list
        if self.dragging_player_id.is_some() {
            let end_drop_response = ui.allocate_response(
                [ui.available_width(), 20.0].into(),
                egui::Sense::hover()
            );

            if end_drop_response.hovered() {
                // Calculate the correct end position accounting for the dragged player
                let end_pos = if let Some(_dragged_id) = self.dragging_player_id {
                    if let Some((origin_is_starters, _)) = self.drag_origin {
                        if origin_is_starters == is_starters && is_starters {
                            // Dragged player was originally in this same list, so the end position is one less
                            players.len()
                        } else {
                            // Dragged player was from a different list
                            players.len()
                        }
                    } else {
                        players.len()
                    }
                } else {
                    players.len()
                };
                self.drop_target_position = Some((is_starters, end_pos));
            }

            if end_drop_response.hovered() && ui.input(|i| i.pointer.any_released()) {
                if let Some(dragged_id) = self.dragging_player_id {
                    self.handle_drag_end(team, dragged_id);
                }
            }
        }
    }

    fn show_drop_zone(&self, ui: &mut egui::Ui) {
        let (_, drop_zone_rect) = ui.allocate_space([ui.available_width(), 40.0].into());
        
        // Draw a highlighted drop zone
        ui.painter().rect_filled(
            drop_zone_rect,
            egui::Rounding::same(4.0),
            egui::Color32::from_rgba_unmultiplied(100, 200, 100, 50)
        );
        ui.painter().rect_stroke(
            drop_zone_rect,
            egui::Rounding::same(4.0),
            egui::Stroke::new(2.0, egui::Color32::from_rgb(100, 200, 100))
        );
        
        // Add some text to indicate it's a drop zone
        ui.allocate_ui_at_rect(drop_zone_rect, |ui| {
            ui.centered_and_justified(|ui| {
                ui.label(egui::RichText::new("Drop here").color(egui::Color32::from_rgb(60, 120, 60)));
            });
        });
    }

    fn handle_drag_end(&mut self, team: &mut crate::game::Team, player_id: uuid::Uuid) {
        // Check if we have a valid drop target
        if let Some((target_is_starters, target_pos)) = self.drop_target_position {
            // Valid drop - perform the move
            self.perform_player_move(team, player_id, target_is_starters, target_pos);
        } else {
            // Invalid drop - restore to original position
            self.restore_to_original_position(team, player_id);
        }
        
        // Clean up drag state
        self.dragging_player_id = None;
        self.drop_target_position = None;
        self.drag_origin = None;
    }

    fn perform_player_move(&self, team: &mut crate::game::Team, player_id: uuid::Uuid, target_is_starters: bool, target_pos: usize) {
        // Check if player is currently in starters
        let was_in_starters = team.starting_lineup.contains(&player_id);
        
        // Remove from current position (both starters and bench are handled by removing from starters)
        team.starting_lineup.retain(|&id| id != player_id);

        // Add to new position
        if target_is_starters {
            // Adjust target position if the player was originally in starters and before the target position
            let adjusted_pos = if was_in_starters {
                if let Some((origin_is_starters, origin_pos)) = self.drag_origin {
                    if origin_is_starters && origin_pos < target_pos {
                        // Player was removed from before the target position, so adjust down by 1
                        target_pos.saturating_sub(1)
                    } else {
                        target_pos
                    }
                } else {
                    target_pos
                }
            } else {
                target_pos
            };
            
            // Clamp to valid range
            let insert_pos = adjusted_pos.min(team.starting_lineup.len());
            team.starting_lineup.insert(insert_pos, player_id);
        }
        // If dropping to bench, just removing from starters is enough since bench is derived
    }

    fn restore_to_original_position(&self, team: &mut crate::game::Team, player_id: uuid::Uuid) {
        if let Some((origin_is_starters, origin_pos)) = self.drag_origin {
            // Remove from wherever it currently is
            team.starting_lineup.retain(|&id| id != player_id);
            
            // Restore to original position
            if origin_is_starters {
                // Insert back into starters at original position, but clamp to current length
                let insert_pos = origin_pos.min(team.starting_lineup.len());
                team.starting_lineup.insert(insert_pos, player_id);
            }
            // If it was originally on bench, just removing from starters is enough
        }
    }

    fn draw_floating_player_card(&self, ctx: &egui::Context, player: &crate::game::Player, is_starters: bool) {
        // Get the current pointer position
        let pointer_pos = ctx.input(|i| i.pointer.interact_pos()).unwrap_or_default();
        
        // Offset the card slightly from the cursor so it doesn't interfere with hover detection
        let card_pos = pointer_pos + egui::Vec2::new(10.0, -30.0);
        
        // Create a floating window for the dragged player card
        egui::Area::new(egui::Id::new("floating_player_card"))
            .fixed_pos(card_pos)
            .order(egui::Order::Tooltip) // Draw on top of everything
            .show(ctx, |ui| {
                // Create a frame that looks like the original player card
                egui::Frame::none()
                    .fill(ui.style().visuals.window_fill)
                    .stroke(egui::Stroke::new(2.0, egui::Color32::from_rgb(100, 150, 255)))
                    .rounding(egui::Rounding::same(6.0))
                    .shadow(egui::epaint::Shadow {
                        offset: egui::Vec2::new(4.0, 4.0),
                        blur: 8.0,
                        spread: 0.0,
                        color: egui::Color32::from_black_alpha(100),
                    })
                    .inner_margin(egui::Margin::same(8.0))
                    .show(ui, |ui| {
                        // Set a fixed width for the floating card
                        ui.set_max_width(250.0);
                        
                        ui.vertical(|ui| {
                            ui.add_space(3.0);
                            
                            // Player name with appropriate styling
                            let name_text = if is_starters {
                                egui::RichText::new(&player.name)
                                    .monospace()
                                    .strong()
                                    .color(egui::Color32::WHITE)
                            } else {
                                egui::RichText::new(&player.name)
                                    .color(egui::Color32::WHITE)
                            };
                            ui.add(egui::Label::new(name_text).selectable(false));
                            
                            // Player info
                            ui.horizontal(|ui| {
                                ui.add(egui::Label::new(
                                    egui::RichText::new(format!("Role: {:?}", player.preferred_role))
                                        .color(egui::Color32::LIGHT_GRAY)
                                ).selectable(false));
                                ui.add(egui::Label::new(
                                    egui::RichText::new(format!("Overall: {}", player.attributes.overall_rating()))
                                        .color(egui::Color32::LIGHT_GRAY)
                                ).selectable(false));
                            });
                            
                            if is_starters {
                                ui.add(egui::Label::new(
                                    egui::RichText::new(format!("Morale: {:?}", player.morale))
                                        .color(egui::Color32::LIGHT_GRAY)
                                ).selectable(false));
                            }
                            
                            ui.add_space(3.0);
                        });
                    });
            });
    }
}
