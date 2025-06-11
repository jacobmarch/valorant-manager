use eframe::egui;
use crate::game::GameState;

pub struct ScheduleScreen;

impl ScheduleScreen {
    pub fn new() -> Self {
        Self
    }

    pub fn show(&mut self, ctx: &egui::Context, game_state: &mut GameState) {
        let mut advance_week = false;
        
        egui::CentralPanel::default().show(ctx, |ui| {
            ui.heading("Schedule & Tournament");
            ui.separator();

            if let Some(team) = &game_state.current_team {
                ui.horizontal(|ui| {
                    // Left panel - Tournament status
                    ui.vertical(|ui| {
                        ui.heading("Tournament Status");
                        
                        ui.horizontal(|ui| {
                            ui.label("Current Event:");
                            ui.label(game_state.tournament_state.get_current_event_name());
                        });
                        
                        ui.horizontal(|ui| {
                            ui.label("Week:");
                            ui.label(format!("{}", game_state.tournament_state.current_week));
                        });
                        
                        ui.add_space(20.0);
                        
                        ui.heading("Championship Standings");
                        
                        egui::ScrollArea::vertical().show(ui, |ui| {
                            for (i, standing) in game_state.tournament_state.championship_standings.iter().enumerate() {
                                if let Some(standing_team) = game_state.all_teams.iter().find(|t| t.id == standing.team_id) {
                                    let is_current_team = standing.team_id == team.id;
                                    
                                    ui.horizontal(|ui| {
                                        ui.label(format!("{}.", i + 1));
                                        
                                        let team_name = if is_current_team {
                                            egui::RichText::new(&standing_team.name).color(egui::Color32::YELLOW)
                                        } else {
                                            egui::RichText::new(&standing_team.name)
                                        };
                                        ui.label(team_name);
                                        
                                        ui.label(format!("{}pts", standing.points));
                                        ui.label(format!("{}-{}", standing.wins, standing.losses));
                                    });
                                }
                            }
                        });
                        
                        ui.add_space(20.0);
                        
                        ui.heading("Qualification Status");
                        
                        if game_state.tournament_state.is_qualified_for_masters(team.id) {
                            ui.colored_label(egui::Color32::GREEN, "✓ Qualified for Masters");
                        } else {
                            ui.colored_label(egui::Color32::RED, "✗ Not qualified for Masters");
                        }
                        
                        if game_state.tournament_state.is_qualified_for_champions(team.id) {
                            ui.colored_label(egui::Color32::GREEN, "✓ Qualified for Champions");
                        } else {
                            ui.colored_label(egui::Color32::RED, "✗ Not qualified for Champions");
                        }
                    });

                    ui.separator();

                    // Right panel - Upcoming matches and calendar
                    ui.vertical(|ui| {
                        ui.heading("Upcoming Matches");
                        
                        // Placeholder for upcoming matches
                        ui.label("No upcoming matches scheduled");
                        
                        ui.add_space(20.0);
                        
                        ui.heading("Recent Results");
                        
                        if game_state.match_history.is_empty() {
                            ui.label("No matches played yet");
                        } else {
                            egui::ScrollArea::vertical().show(ui, |ui| {
                                for match_result in game_state.match_history.iter().rev().take(10) {
                                    ui.horizontal(|ui| {
                                        // Find team names
                                        let team1_name = game_state.all_teams.iter()
                                            .find(|t| t.id == match_result.team1_id)
                                            .map(|t| t.name.as_str())
                                            .unwrap_or("Unknown");
                                        
                                        let team2_name = game_state.all_teams.iter()
                                            .find(|t| t.id == match_result.team2_id)
                                            .map(|t| t.name.as_str())
                                            .unwrap_or("Unknown");
                                        
                                        ui.label(format!("{} {} - {} {}", 
                                            team1_name, match_result.team1_score,
                                            match_result.team2_score, team2_name));
                                        ui.label(&match_result.map);
                                    });
                                    ui.separator();
                                }
                            });
                        }
                        
                        ui.add_space(20.0);
                        
                        ui.heading("Season Calendar");
                        
                        ui.label("VCT 2025 Schedule:");
                        ui.label("• January-February: Kickoff");
                        ui.label("• February-March: Masters Bangkok");
                        ui.label("• March-May: Stage 1");
                        ui.label("• June: Masters Toronto");
                        ui.label("• July-August: Stage 2");
                        ui.label("• September-October: Champions Paris");
                        
                        ui.add_space(20.0);
                        
                        ui.heading("Team Actions");
                        
                        if ui.button("Advance Week").clicked() {
                            advance_week = true;
                        }
                        
                        if ui.button("Simulate Match").clicked() {
                            // TODO: Implement match simulation
                        }
                        
                        ui.add_space(10.0);
                        
                        ui.horizontal(|ui| {
                            ui.label("Current Date:");
                            ui.label(game_state.current_date.format("%Y-%m-%d").to_string());
                        });
                    });
                });
            } else {
                ui.label("No team selected");
            }
        });
        
        // Handle actions outside the UI closure to avoid borrowing conflicts
        if advance_week {
            game_state.tournament_state.advance_week();
            // Advance game time
            for _ in 0..7 {
                game_state.advance_day();
            }
        }
    }
} 