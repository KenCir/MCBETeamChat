export default {
  opTag: "op",
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
      {
        name: "aqua",
        nameTagFormat: "§3AquaTeam\n§f{player.name}",
        messageFormat: "§f[§3AquaTeam§f]<{player.name}> {message}",
        score: 3,
      },
    ],
  },
};
