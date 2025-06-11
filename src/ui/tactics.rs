use eframe::egui;
use crate::game::GameState;

pub struct TacticsScreen {
    selected_map: String,
}

impl TacticsScreen {
    pub fn new() -> Self {
        Self {
            selected_map: "Ascent".to_string(),
        }
    }

    pub fn show(&mut self, ctx: &egui::Context, game_state: &mut GameState) {
        egui::CentralPanel::default().show(ctx, |ui| {
            ui.heading("Tactics & Strategy");
            ui.separator();

            if let Some(_team) = &game_state.current_team {
                ui.horizontal(|ui| {
                    // Left panel - Map selection and strategy
                    ui.vertical(|ui| {
                        ui.heading("Map Strategy");
                        
                        ui.horizontal(|ui| {
                            ui.label("Selected Map:");
                            egui::ComboBox::from_label("")
                                .selected_text(&self.selected_map)
                                .show_ui(ui, |ui| {
                                    let maps = vec!["Ascent", "Bind", "Breeze", "Haven", "Icebox", "Fracture", "Lotus", "Split"];
                                    for map in maps {
                                        ui.selectable_value(&mut self.selected_map, map.to_string(), map);
                                    }
                                });
                        });
                        
                        ui.add_space(20.0);
                        
                        // Map-specific strategy options
                        ui.heading(format!("{} Strategy", self.selected_map));
                        
                        match self.selected_map.as_str() {
                            "Ascent" => {
                                ui.label("• Mid control is crucial");
                                ui.label("• Strong defender-sided map");
                                ui.label("• Good for OP users");
                            }
                            "Bind" => {
                                ui.label("• No middle area - use teleporters");
                                ui.label("• Fast rotations possible");
                                ui.label("• Tight corners favor abilities");
                            }
                            "Haven" => {
                                ui.label("• Three bomb sites require smart rotation");
                                ui.label("• Communication is key");
                                ui.label("• Many paths for attackers");
                            }
                            _ => {
                                ui.label("• Adapt strategy based on map characteristics");
                            }
                        }
                        
                        ui.add_space(20.0);
                        
                        ui.heading("Team Composition");
                        ui.label("Recommended composition for this map:");
                        
                        // Show recommended agents based on map
                        match self.selected_map.as_str() {
                            "Ascent" => {
                                ui.label("• Jett (Duelist)");
                                ui.label("• Sova (Initiator)");
                                ui.label("• Omen (Controller)");
                                ui.label("• Killjoy (Sentinel)");
                                ui.label("• KAY/O (Initiator)");
                            }
                            "Bind" => {
                                ui.label("• Jett (Duelist)");
                                ui.label("• Sova (Initiator)");
                                ui.label("• Viper (Controller)");
                                ui.label("• Sage (Sentinel)");
                                ui.label("• Killjoy (Sentinel)");
                            }
                            _ => {
                                ui.label("• 1-2 Duelists");
                                ui.label("• 1 Initiator");
                                ui.label("• 1 Controller");
                                ui.label("• 1 Sentinel");
                            }
                        }
                    });

                    ui.separator();

                    // Right panel - Current lineup and tactics
                    ui.vertical(|ui| {
                        ui.heading("Current Lineup");
                        
                        if let Some(team) = &game_state.current_team {
                            for &player_id in &team.starting_lineup {
                                if let Some(player) = game_state.get_player_by_id(player_id) {
                                    ui.horizontal(|ui| {
                                        ui.label(&player.name);
                                        ui.label(format!("({:?})", player.preferred_role));
                                        ui.label(format!("Overall: {}", player.attributes.overall_rating()));
                                    });
                                }
                            }
                        }
                        
                        ui.add_space(20.0);
                        
                        ui.heading("Tactical Instructions");
                        
                        ui.label("Attack Side:");
                        ui.checkbox(&mut true, "Default spread");
                        ui.checkbox(&mut false, "Fast execute");
                        ui.checkbox(&mut false, "Slow default");
                        
                        ui.add_space(10.0);
                        
                        ui.label("Defense Side:");
                        ui.checkbox(&mut true, "Standard setup");
                        ui.checkbox(&mut false, "Aggressive angles");
                        ui.checkbox(&mut false, "Stack sites");
                        
                        ui.add_space(20.0);
                        
                        ui.heading("Economic Strategy");
                        
                        ui.label("Buy Phase Preferences:");
                        ui.checkbox(&mut true, "Conservative economy");
                        ui.checkbox(&mut false, "Aggressive force buys");
                        ui.checkbox(&mut false, "Save for full buys");
                        
                        ui.add_space(20.0);
                        
                        if ui.button("Save Tactical Setup").clicked() {
                            // TODO: Save tactical preferences
                        }
                    });
                });
            } else {
                ui.label("No team selected");
            }
        });
    }
} 