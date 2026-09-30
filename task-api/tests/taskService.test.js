const taskService = require('../src/services/taskService');

beforeEach(() => {
    taskService._reset();
});

describe('Task Service', () => {

    describe('create()', () => {

        test('creates a task', () => {
            const task = taskService.create({
                title: 'Learn Jest'
            });

            expect(task.title).toBe('Learn Jest');
        });

        test('creates a task with an id', () => {
            const task = taskService.create({
                title: 'Learn Jest'
            });

            expect(task.id).toBeDefined();
        });

        test('uses default values', () => {
            const task = taskService.create({
                title: 'Learn Jest'
            });

            expect(task.status).toBe('todo');
            expect(task.priority).toBe('medium');
            expect(task.dueDate).toBeNull();
            expect(task.completedAt).toBeNull();
        });

    });

    describe('getAll()', () => {

        test('returns all tasks', () => {
            taskService.create({
                title: 'Task 1'
            });

            taskService.create({
                title: 'Task 2'
            });

            const tasks = taskService.getAll();

            expect(tasks).toHaveLength(2);
            expect(tasks[0].title).toBe('Task 1');
            expect(tasks[1].title).toBe('Task 2');
        });

    });
    describe('findById()', () => {

        test('finds a task by id', () => {
            const created = taskService.create({
                title: 'Find me'
            });

            const task = taskService.findById(created.id);

            expect(task).toBeDefined();
            expect(task.id).toBe(created.id);
            expect(task.title).toBe('Find me');
        });

        test('returns undefined for unknown id', () => {
            const task = taskService.findById('does-not-exist');

            expect(task).toBeUndefined();
        });

    });
    describe('remove()', () => {

        test('removes an existing task', () => {
            const created = taskService.create({
                title: 'Delete me'
            });

            const result = taskService.remove(created.id);

            expect(result).toBe(true);
            expect(taskService.findById(created.id)).toBeUndefined();
        });

        test('returns false when task does not exist', () => {
            const result = taskService.remove('does-not-exist');

            expect(result).toBe(false);
        });

    });
    describe('completeTask()', () => {

        test('marks a task as done', () => {
            const created = taskService.create({
                title: 'Complete me'
            });

            const completed = taskService.completeTask(created.id);

            expect(completed.status).toBe('done');
            expect(completed.completedAt).not.toBeNull();
        });

        test('returns null when task does not exist', () => {
            const result = taskService.completeTask('does-not-exist');

            expect(result).toBeNull();
        });

    });

    describe('getByStatus()', () => {

        test('returns tasks with requested status', () => {
            taskService.create({
                title: 'Todo task',
                status: 'todo'
            });

            taskService.create({
                title: 'Working task',
                status: 'in_progress'
            });

            const tasks = taskService.getByStatus('todo');

            expect(tasks).toHaveLength(1);
            expect(tasks[0].title).toBe('Todo task');
        });

    });
    describe('getStats()', () => {

        test('returns counts by status', () => {

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

            const stats = taskService.getStats();

            expect(stats.todo).toBe(1);
            expect(stats.in_progress).toBe(1);
            expect(stats.done).toBe(1);
            expect(stats.overdue).toBe(0);
        });

    });

    describe('update()', () => {

        test('updates an existing task', () => {
            const created = taskService.create({
                title: 'Old title'
            });

            const updated = taskService.update(created.id, {
                title: 'New title'
            });

            expect(updated.title).toBe('New title');
            expect(updated.id).toBe(created.id);
        });

        test('returns null when task does not exist', () => {
            const result = taskService.update('does-not-exist', {
                title: 'New title'
            });

            expect(result).toBeNull();
        });

    });

    describe('getPaginated()', () => {

        test('returns the first page of tasks', () => {

            for (let i = 1; i <= 15; i++) {
                taskService.create({
                    title: `Task ${i}`
                });
            }

            const tasks = taskService.getPaginated(1, 10);

            expect(tasks).toHaveLength(10);
            expect(tasks[0].title).toBe('Task 1');
            expect(tasks[9].title).toBe('Task 10');
        });

    });

    describe('getByStatus()', () => {

        test('returns tasks with requested status', () => {
            taskService.create({
                title: 'Todo task',
                status: 'todo'
            });

            taskService.create({
                title: 'Working task',
                status: 'in_progress'
            });

            const tasks = taskService.getByStatus('todo');

            expect(tasks).toHaveLength(1);
            expect(tasks[0].title).toBe('Todo task');
        });

        test('returns empty array when no tasks match', () => {
            taskService.create({
                title: 'Todo task',
                status: 'todo'
            });

            const tasks = taskService.getByStatus('done');

            expect(tasks).toEqual([]);
        });

    });

    describe('assign()', () => {

        test('assigns a task to a user', () => {
            const created = taskService.create({
                title: 'Assign me'
            });

            const updated = taskService.assign(
                created.id,
                'John Doe'
            );

            expect(updated.assignee).toBe('John Doe');
            expect(updated.id).toBe(created.id);
        });

        test('returns null when task does not exist', () => {
            const result = taskService.assign(
                'does-not-exist',
                'John Doe'
            );

            expect(result).toBeNull();
        });

        test('does not allow reassignment', () => {
            const created = taskService.create({
                title: 'Assign me'
            });

            taskService.assign(created.id, 'John Doe');

            const result = taskService.assign(
                created.id,
                'Jane Doe'
            );

            expect(result).toBe('ALREADY_ASSIGNED');
        });

    });

});