import { world, system, EntityQueryOptions } from "@minecraft/server";

system.afterEvents.scriptEventReceive.subscribe((event) => {
  switch (event.id) {
    case "team:set":
      {
        const redTeamQuery: EntityQueryOptions = {
          scoreOptions: [
            {
              objective: "team",
              maxScore: 1,
              minScore: 1,
            },
          ],
        };
        const blueTeamQuery: EntityQueryOptions = {
          scoreOptions: [
            {
              objective: "team",
              maxScore: 2,
              minScore: 2,
            },
          ],
        };

        const redTeamPlayers = world.getPlayers(redTeamQuery);
        const blueTeamPlayers = world.getPlayers(blueTeamQuery);

        for (const player of redTeamPlayers) {
          player.nameTag = `§cRedTeam\n§f${player.name}`;
        }
        for (const player of blueTeamPlayers) {
          player.nameTag = `§aBlueTeam\n§f${player.name}`;
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
  const teamScoreboard = world.scoreboard.getObjective("team");
  if (!teamScoreboard) return;

  let team = null;
  try {
    team = teamScoreboard.getScore(event.sender.scoreboardIdentity);
  } catch (e) {
    return;
  }
  if (!team) return;

  const teamQuery: EntityQueryOptions = {
    scoreOptions: [
      {
        objective: "team",
        maxScore: team,
        minScore: team,
      },
    ],
  };
  const opQuery: EntityQueryOptions = {
    tags: ["op"],
  };
  const teamPlayers = world.getPlayers(teamQuery);
  const opPlayers = world.getPlayers(opQuery);
  const targetPlayers = [...teamPlayers, ...opPlayers];

  // RedTeam
  if (team === 1) {
    for (const player of targetPlayers) {
      player.sendMessage(
        `§f[§cRedTeam§f]<${event.sender.name}> ${event.message}`,
      );
    }
    // BlueTeam
  } else if (team === 2) {
    for (const player of targetPlayers) {
      player.sendMessage(
        `§f[§aBlueTeam§f]<${event.sender.name}> ${event.message}`,
      );
    }
  }
  // Unknown
  else {
    return;
  }

  event.cancel = true;
});
