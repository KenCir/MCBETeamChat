import { world, system, EntityQueryOptions, Player } from "@minecraft/server";
import config from "config";

let systemFlag = false;
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

function setupTeam(): void {
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

function resetTeam(): void {
  const players = world.getAllPlayers();
  for (const player of players) {
    player.nameTag = player.name;
  }
}

system.afterEvents.scriptEventReceive.subscribe((event) => {
  let resultMsg: string = null;
  switch (event.id) {
    case "team:set":
      setupTeam();
      resultMsg = "プレイヤーのチーム名をセットしました";
      break;
    case "team:reset":
      resetTeam();
      resultMsg = "プレイヤーのチーム名をリセットしました";
      break;
    case "team:start":
      systemFlag = true;
      resultMsg = "TeamChatを開始しました";
      break;
    case "team:stop":
      systemFlag = false;
      resultMsg = "TeamChatを停止しました";
      break;
  }

  if (event.sourceEntity instanceof Player && resultMsg) {
    event.sourceEntity.sendMessage(resultMsg);
  }
});

world.beforeEvents.chatSend.subscribe((event) => {
  if (!systemFlag) return;

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

world.afterEvents.playerSpawn.subscribe((event) => {
  if (!event.initialSpawn) return;
  if (systemFlag) {
    const teamScoreboard = world.scoreboard.getObjective(
      config.team.scoreboard
    );
    if (!teamScoreboard) return;

    let team = null;
    try {
      team = teamScoreboard.getScore(event.player.scoreboardIdentity);
    } catch (e) {
      return;
    }
    if (!team) return;

    const teamConfig = config.team.teams.find((t) => t.score === team);
    if (!teamConfig) return;

    event.player.nameTag = teamConfig.nameTagFormat.replaceAll(
      "{player.name}",
      event.player.name
    );
  } else {
    event.player.nameTag = event.player.name;
  }
});
