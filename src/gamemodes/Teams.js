var Mode = require('./Mode');

class Teams extends Mode{
    constructor() {
        super();
        this.ID = 1;
        this.name = "Teams";
        this.decayMod = 1.5;
        this.packetLB = 50;
        this.haveTeams = true;
        this.colorFuzziness = 32;
        // Special
        this.teamAmount = 3; // Amount of teams. Having more than 3 teams will cause the leaderboard to work incorrectly (client issue).
        this.colors = [{
            'r': 223,
            'g': 0,
            'b': 0
        }, {
            'r': 0,
            'g': 223,
            'b': 0
        }, {
            'r': 0,
            'g': 0,
            'b': 223
        },]; // Make sure you add extra colors here if you wish to increase the team amount [Default colors are: Red, Green, Blue]
        this.nodes = []; // Teams
    }
    //Gamemode Specific Functions
    fuzzColorComponent(component) {
        component += Math.random() * this.colorFuzziness >> 0;
        return component;
    }
    getTeamColor(team) {
        var color = this.colors[team];
        return {
            r: this.fuzzColorComponent(color.r),
            b: this.fuzzColorComponent(color.b),
            g: this.fuzzColorComponent(color.g)
        };
    }
    // Override
    onPlayerSpawn(server, player) {
        // Random color based on team
        player.color = this.getTeamColor(player.team);
        // Spawn player
        server.spawnPlayer(player, server.randomPos());
    }
    onServerInit(server) {
        // Set up teams
        for (var i = 0; i < this.teamAmount; i++) {
            this.nodes[i] = [];
        }
        // migrate current players to team mode
        for (var i = 0; i < server.clients.length; i++) {
            var client = server.clients[i].playerTracker;
            this.onPlayerInit(client);
            client.color = this.getTeamColor(client.team);
            for (var j = 0; j < client.cells.length; j++) {
                var cell = client.cells[j];
                cell.color = client.color;
                this.nodes[client.team].push(cell);
            }
        }
    }
    onPlayerInit(player) {
        // Get random team
        player.team = Math.floor(Math.random() * this.teamAmount);
    }
    onCellAdd(cell) {
        // Add to team list
        this.nodes[cell.owner.team].push(cell);
    }
    onCellRemove(cell) {
        // Remove from team list
        var index = this.nodes[cell.owner.team].indexOf(cell);
        if (index != -1) {
            this.nodes[cell.owner.team].splice(index, 1);
        }
    }
    onCellMove(cell, server) {
        // Find team
        for (var i = 0; i < cell.owner.visibleNodes.length; i++) {
            // Only collide with player cells
            var check = cell.owner.visibleNodes[i];
            if ((check.type != 0) || (cell.owner == check.owner)) {
                continue;
            }
            // Collision with teammates
            var team = cell.owner.team;
            if (check.owner.team == team) {
                var manifold = server.checkCellCollision(cell, check); // Calculation info
                if (manifold != null) { // Collided
                    // Cant eat team members
                    !manifold.check.canEat(manifold.cell);
                }
            }
        }
    }
    updateLB(server) {
        server.leaderboardType = this.packetLB;
        var total = 0;
        var teamMass = [];
        // Get mass
        for (var i = 0; i < this.teamAmount; i++) {
            // Set starting mass
            teamMass[i] = 0;
            // Loop through cells
            for (var j = 0; j < this.nodes[i].length; j++) {
                var cell = this.nodes[i][j];
                if (!cell)
                    continue;
                teamMass[i] += cell._mass;
                total += cell._mass;
            }
        }
        // No players
        if (total <= 0) {
            for (var i = 0; i < this.teamAmount; i++) {
                server.leaderboard[i] = 0;
            }
            return;
        }
        // Calc percentage
        for (var i = 0; i < this.teamAmount; i++) {
            server.leaderboard[i] = teamMass[i] / total;
        }
    }
}

module.exports = Teams;
Teams.prototype = new Mode();










