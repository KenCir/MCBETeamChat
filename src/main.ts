import { world, system, EntityQueryOptions } from "@minecraft/server";
import config from "config";

const opQuery: EntityQueryOptions = {
  tags: [config.opTag],
};

function buildTeamQuery(team: number, excludeOp: boolean): EntityQueryOptions {
  return {
    scoreOptions: [
      {
        objective: config.team.scoreboard,
        maxScore: team,
        minScore: team,
      },
    ],
    excludeTags: excludeOp ? [config.opTag] : [],
  };
}

system.afterEvents.scriptEventReceive.subscribe((event) => {
  switch (event.id) {
    case "team:set":
      {
        for (const team of config.team.teams) {
          const players = world.getPlayers(buildTeamQuery(team.score, false));
          for (const player of players) {
            player.nameTag = team.nameTagFormat.replaceAll(
              "{player.name}",
              player.name
            );
          }
        }
      }
      break;
    case "team:reset":
      {
        const players = world.getAllPlayers();
        for (const player of players) {
          player.nameTag = player.name;
        }
      }
      break;
  }
});

world.beforeEvents.chatSend.subscribe((event) => {
  const teamScoreboard = world.scoreboard.getObjective(config.team.scoreboard);
  if (!teamScoreboard) return;

  let team = null;
  try {
    team = teamScoreboard.getScore(event.sender.scoreboardIdentity);
  } catch (e) {
    return;
  }
  if (!team) return;

  const teamConfig = config.team.teams.find((t) => t.score === team);
  if (!teamConfig) return;

  const teamQuery = buildTeamQuery(team, true);
  const teamPlayers = world.getPlayers(teamQuery);
  const opPlayers = world.getPlayers(opQuery);
  const targetPlayers = [...teamPlayers, ...opPlayers];

  for (const player of targetPlayers) {
    player.sendMessage(
      teamConfig.messageFormat
        .replaceAll("{player.name}", event.sender.name)
        .replaceAll("{message}", event.message)
    );
  }

  event.cancel = true;
});
