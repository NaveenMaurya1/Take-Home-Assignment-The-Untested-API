const request = require('supertest');
const app = require('../src/app');
const taskService = require('../src/services/taskService');

beforeEach(() => {
    taskService._reset();
});

describe('GET /tasks', () => {

    test('returns all tasks', async () => {

        taskService.create({
            title: 'Task 1'
        });

        taskService.create({
            title: 'Task 2'
        });

        const response = await request(app)
            .get('/tasks');

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(2);
    });

});

describe('POST /tasks', () => {

    test('creates a new task', async () => {

        const response = await request(app)
            .post('/tasks')
            .send({
                title: 'Learn testing',
                description: 'Learn Jest and Supertest',
                priority: 'high'
            });

        expect(response.status).toBe(201);

        expect(response.body.title).toBe('Learn testing');
        expect(response.body.description)
            .toBe('Learn Jest and Supertest');

        expect(response.body.priority).toBe('high');
        expect(response.body.status).toBe('todo');
        expect(response.body.id).toBeDefined();
    });

    describe('POST /tasks validation', () => {

        test('returns 400 when title is missing', async () => {

            const response = await request(app)
                .post('/tasks')
                .send({
                    description: 'No title'
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe(
                'title is required and must be a non-empty string'
            );
        });

    });

    describe('PUT /tasks/:id', () => {

        test('updates a task', async () => {

            const created = taskService.create({
                title: 'Old title'
            });

            const response = await request(app)
                .put(`/tasks/${created.id}`)
                .send({
                    title: 'New title'
                });

            expect(response.status).toBe(200);
            expect(response.body.title).toBe('New title');
        });

    });

    test('returns 404 when task does not exist', async () => {

        const response = await request(app)
            .put('/tasks/does-not-exist')
            .send({
                title: 'New title'
            });

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Task not found');

    });

    describe('DELETE /tasks/:id', () => {

        test('deletes a task', async () => {

            const created = taskService.create({
                title: 'Delete me'
            });

            const response = await request(app)
                .delete(`/tasks/${created.id}`);

            expect(response.status).toBe(204);

            expect(taskService.findById(created.id))
                .toBeUndefined();
        });

    });

    test('returns 404 for nonexistent task', async () => {

        const response = await request(app)
            .delete('/tasks/does-not-exist');

        expect(response.status).toBe(404);
    });
    describe('PATCH /tasks/:id/complete', () => {

        test('completes a task', async () => {

            const created = taskService.create({
                title: 'Complete me'
            });

            const response = await request(app)
                .patch(`/tasks/${created.id}/complete`);

            expect(response.status).toBe(200);

            expect(response.body.status).toBe('done');
            expect(response.body.completedAt).not.toBeNull();
        });

    });

    describe('GET /tasks/stats', () => {

        test('returns task statistics', async () => {

            taskService.create({
                title: 'Todo',
                status: 'todo'
            });

            taskService.create({
                title: 'Working',
                status: 'in_progress'
            });

            taskService.create({
                title: 'Done',
                status: 'done'
            });

            const response = await request(app)
                .get('/tasks/stats');

            expect(response.status).toBe(200);

            expect(response.body.todo).toBe(1);
            expect(response.body.in_progress).toBe(1);
            expect(response.body.done).toBe(1);
            expect(response.body.overdue).toBe(0);
        });

    });
    describe('GET /tasks pagination', () => {

        test('returns the first page of tasks', async () => {

            for (let i = 1; i <= 15; i++) {
                taskService.create({
                    title: `Task ${i}`
                });
            }

            const response = await request(app)
                .get('/tasks?page=1&limit=10');

            expect(response.status).toBe(200);

            expect(response.body).toHaveLength(10);
            expect(response.body[0].title).toBe('Task 1');
            expect(response.body[9].title).toBe('Task 10');
        });

    });

    describe('PATCH /tasks/:id/assign', () => {

        test('assigns a task successfully', async () => {

            const created = taskService.create({
                title: 'Assign me'
            });

            const response = await request(app)
                .patch(`/tasks/${created.id}/assign`)
                .send({
                    assignee: 'John Doe'
                });

            expect(response.status).toBe(200);
            expect(response.body.assignee).toBe('John Doe');
            expect(response.body.id).toBe(created.id);
        });

        test('returns 400 when assignee is missing', async () => {

            const created = taskService.create({
                title: 'Assign me'
            });

            const response = await request(app)
                .patch(`/tasks/${created.id}/assign`)
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.error).toBe(
                'assignee is required and must be a non-empty string'
            );
        });

        test('returns 400 when assignee is empty', async () => {

            const created = taskService.create({
                title: 'Assign me'
            });

            const response = await request(app)
                .patch(`/tasks/${created.id}/assign`)
                .send({
                    assignee: '   '
                });

            expect(response.status).toBe(400);
        });

        test('returns 404 when task does not exist', async () => {

            const response = await request(app)
                .patch('/tasks/does-not-exist/assign')
                .send({
                    assignee: 'John Doe'
                });

            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Task not found');
        });

        test('returns 409 when task is already assigned', async () => {

            const created = taskService.create({
                title: 'Already assigned'
            });

            await request(app)
                .patch(`/tasks/${created.id}/assign`)
                .send({
                    assignee: 'John Doe'
                });

            const response = await request(app)
                .patch(`/tasks/${created.id}/assign`)
                .send({
                    assignee: 'Jane Doe'
                });

            expect(response.status).toBe(409);
            expect(response.body.error).toBe(
                'Task is already assigned'
            );
        });

    });

});

