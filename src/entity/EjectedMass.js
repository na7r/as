const Cell = require('./Cell');

class EjectedMass extends Cell {
    constructor(server, owner, position, size) {
        super(server, owner, position, size);
        this.type = 3;
    };

    onAdd(server) {
        server.nodesEjected.push(this);
    };

    onRemove(server) {
        const index = server.nodesEjected.indexOf(this);
        if (index != -1) {
            server.nodesEjected.splice(index, 1);
        };
    };
};

module.exports = EjectedMass;