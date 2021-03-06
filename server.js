var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.get('/', function (req,res) {
    res.send('Todo API Root')
});

app.get('/todos', function (req, res) {
    var queryParams = req.query;
    var filteredTodos = todos;

    if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
        filteredTodos = _.where(filteredTodos, {completed: true});
    } else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
        filteredTodos = _.where(filteredTodos, {completed: false})
    }

    if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
        filteredTodos = _.filter(filteredTodos, function (todo) {
            return todo.description.toLocaleLowerCase().indexOf(queryParams.q.toLowerCase()) > -1;
        });
    }

   res.json(filteredTodos);
});

app.get('/todos/:id', function (req, res) {
    var todoId = parseInt(req.params.id, 10);

    res.json(_.findWhere(todos, {id: todoId}));

    res.status(404).send();

});

app.post('/todos', function (req, res) {
    var body = req.body;
    body = _.pick(body, 'description', 'completed');

    if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
        return res.status(400).send();
    }

    body.description = body.description.trim();

    body.id = todoNextId;
    todoNextId ++;

    todos.push(body);

    res.json(body);
});

app.delete('/todos/:id', function (req, res) {
    var todoId = parseInt(req.params.id, 10);
    var todoItem = _.findWhere(todos, {id: todoId});

    if (!todoItem) {
        res.status(404).json({"error": "no todo found with that id"});
    } else {
        console.log("Deleting: " + todoItem.description);

        todos = _.without(todos, todoItem);

        res.json(todoItem);
    }
});

app.put('/todos/:id', function (req, res) {
    var body = _.pick(req.body, 'description', 'completed');
    var todoId = parseInt(req.params.id, 10);
    var todoItem = _.findWhere(todos, {id: todoId});
    var validAttributes = {};

    if (!todoItem) {
        return res.status(404).send();
    }

    if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
        validAttributes.completed = body.completed;
    } else if (body.hasOwnProperty('completed')) {
        return res.status(400).send();
    }

    if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
        validAttributes.description = body.description;
    } else if (body.hasOwnProperty('description')) {
        return res.status(400).send();
    }

    _.extend(todoItem, validAttributes);
    res.json(todoItem);
});

app.listen(PORT, function () {
    console.log('Express listening on port ' + PORT + '!');
});