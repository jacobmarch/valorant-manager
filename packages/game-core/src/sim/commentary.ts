import type { Team } from "../models/team";
import type { Player } from "../models/player";
import type { SiteFocus } from "../types/enums";

export type RoundEventType =
  | "OpeningPick"
  | "SpikePlanted"
  | "Retake"
  | "Clutch"
  | "RoundWin"
  | "EcoWin"
  | "Timeout";

export type RoundEvent = {
  type: RoundEventType;
  text: string;
};

export function openingPick(player: Player, victim: Player, site: SiteFocus): RoundEvent {
  return {
    type: "OpeningPick",
    text: `${player.name} finds the opening pick on ${victim.name} near ${site} site.`
  };
}

export function spikePlanted(team: Team, site: SiteFocus): RoundEvent {
  return {
    type: "SpikePlanted",
    text: `${team.shortName} gets the spike planted on ${site}.`
  };
}

export function retake(team: Team, site: SiteFocus): RoundEvent {
  return {
    type: "Retake",
    text: `${team.shortName} slows the hit and retakes ${site} before the spike can detonate.`
  };
}

export function clutch(player: Player, against: number): RoundEvent {
  return {
    type: "Clutch",
    text: `${player.name} wins a 1v${against} clutch under pressure.`
  };
}

export function roundWin(team: Team, score: [number, number]): RoundEvent {
  return {
    type: "RoundWin",
    text: `${team.shortName} wins the round. Score: ${score[0]}-${score[1]}.`
  };
}

export function ecoWin(team: Team): RoundEvent {
  return {
    type: "EcoWin",
    text: `${team.shortName} steals the round on a low buy and wrecks the opponent economy.`
  };
}

export function timeoutCalled(team: Team): RoundEvent {
  return {
    type: "Timeout",
    text: `${team.shortName} calls a tactical timeout and resets the plan for the next few rounds.`
  };
}
