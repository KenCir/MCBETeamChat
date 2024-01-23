export default {
  opTag: "op",
  excludeMessagePrefix: ";",
  team: {
    scoreboard: "team",
    teams: [
      {
        name: "red",
        nameTagFormat: "§cRedTeam\n§f{player.name}",
        messageFormat: "§f[§cRedTeam§f]<{player.name}> {message}",
        score: 1,
      },
      {
        name: "blue",
        nameTagFormat: "§aBlueTeam\n§f{player.name}",
        messageFormat: "§f[§aBlueTeam§f]<{player.name}> {message}",
        score: 2,
      },
    ],
  },
};
