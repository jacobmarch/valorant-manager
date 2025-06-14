use crate::game::GameState;
use eframe::egui;

pub struct FinanceScreen;

impl FinanceScreen {
    pub fn new() -> Self {
        Self
    }

    pub fn show(&mut self, ctx: &egui::Context, game_state: &mut GameState) {
        egui::CentralPanel::default().show(ctx, |ui| {
            ui.heading("Financial Management");
            ui.separator();

            if let Some(team) = &game_state.current_team {
                ui.horizontal(|ui| {
                    ui.vertical(|ui| {
                        ui.heading("Budget Overview");

                        ui.horizontal(|ui| {
                            ui.label("Current Budget:");
                            ui.label(
                                egui::RichText::new(format!("${}", game_state.budget)).color(
                                    if game_state.budget > 0 {
                                        egui::Color32::GREEN
                                    } else {
                                        egui::Color32::RED
                                    },
                                ),
                            );
                        });

                        ui.add_space(20.0);
                        ui.heading("Monthly Finances");

                        let mut total_salaries = 0i64;
                        for &player_id in &team.players {
                            if let Some(player) = game_state.get_player_by_id(player_id) {
                                total_salaries += player.contract_salary / 12;
                            }
                        }

                        let facility_costs = 10_000i64;
                        let marketing_budget = 5_000i64;
                        let monthly_income = 50_000i64;
                        let total_expenses = total_salaries + facility_costs + marketing_budget;
                        let net_monthly = monthly_income - total_expenses;

                        ui.horizontal(|ui| {
                            ui.label("Monthly Income:");
                            ui.label(
                                egui::RichText::new(format!("${}", monthly_income))
                                    .color(egui::Color32::GREEN),
                            );
                        });

                        ui.horizontal(|ui| {
                            ui.label("Monthly Expenses:");
                            ui.label(
                                egui::RichText::new(format!("${}", total_expenses))
                                    .color(egui::Color32::RED),
                            );
                        });

                        ui.horizontal(|ui| {
                            ui.label("Net Monthly:");
                            ui.label(egui::RichText::new(format!("${}", net_monthly)).color(
                                if net_monthly > 0 {
                                    egui::Color32::GREEN
                                } else {
                                    egui::Color32::RED
                                },
                            ));
                        });

                        ui.add_space(20.0);
                        ui.heading("Expense Breakdown");

                        ui.horizontal(|ui| {
                            ui.label("Player Salaries:");
                            ui.label(format!("${}/month", total_salaries));
                        });

                        ui.horizontal(|ui| {
                            ui.label("Facility Costs:");
                            ui.label(format!("${}/month", facility_costs));
                        });

                        ui.horizontal(|ui| {
                            ui.label("Marketing:");
                            ui.label(format!("${}/month", marketing_budget));
                        });

                        ui.add_space(20.0);
                        ui.heading("6-Month Projection");

                        let six_month_projection = game_state.budget + (net_monthly * 6);
                        ui.horizontal(|ui| {
                            ui.label("Projected Budget:");
                            ui.label(
                                egui::RichText::new(format!("${}", six_month_projection)).color(
                                    if six_month_projection > 0 {
                                        egui::Color32::GREEN
                                    } else {
                                        egui::Color32::RED
                                    },
                                ),
                            );
                        });

                        if six_month_projection < 0 {
                            ui.colored_label(
                                egui::Color32::RED,
                                "⚠ Warning: Budget will go negative!",
                            );
                        }
                    });

                    ui.separator();

                    ui.vertical(|ui| {
                        ui.heading("Player Contracts");
                        egui::ScrollArea::vertical().show(ui, |ui| {
                            for &player_id in &team.players {
                                if let Some(player) = game_state.get_player_by_id(player_id) {
                                    let unique_id = format!("finance_player_{}", player.id);

                                    ui.horizontal(|ui| {
                                        ui.label(&player.name);
                                        ui.label(format!("${}/year", player.contract_salary));
                                        ui.label(format!("{} years left", player.contract_length));
                                    });

                                    ui.horizontal(|ui| {
                                        ui.label(format!("Market Value: ${}", player.market_value));
                                        if ui.add(
                                            egui::Button::new("Negotiate")
                                        ).clicked() {
                                            // TODO: Handle negotiate
                                        }
                                    });

                                    ui.separator();
                                }
                            }
                        });

                        ui.add_space(20.0);
                        ui.heading("Transfer Budget");

                        let available_for_transfers = (game_state.budget * 30 / 100).max(0);
                        ui.horizontal(|ui| {
                            ui.label("Available for Transfers:");
                            ui.label(format!("${}", available_for_transfers));
                        });

                        ui.add_space(10.0);
                        ui.heading("Prize Money");
                        ui.horizontal(|ui| {
                            ui.label("Total Prize Money:");
                            ui.label("$0");
                        });

                        ui.add_space(20.0);
                        ui.heading("Financial Actions");
                        ui.button("Request Loan");
                        ui.button("Increase Marketing Budget");
                        ui.button("Upgrade Facilities");
                    });
                });
            } else {
                ui.label("No team selected");
            }
        });
    }
}
