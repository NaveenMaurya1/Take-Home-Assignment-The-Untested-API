const {
    validateAssignTask
} = require('../src/utils/validators');

describe('validateAssignTask()', () => {

    test('accepts a valid assignee', () => {
        const result = validateAssignTask({
            assignee: 'John Doe'
        });

        expect(result).toBeNull();
    });

    test('rejects missing assignee', () => {
        const result = validateAssignTask({});

        expect(result).toBe(
            'assignee is required and must be a non-empty string'
        );
    });

    test('rejects empty assignee', () => {
        const result = validateAssignTask({
            assignee: ''
        });

        expect(result).toBe(
            'assignee is required and must be a non-empty string'
        );
    });

    test('rejects whitespace-only assignee', () => {
        const result = validateAssignTask({
            assignee: '   '
        });

        expect(result).toBe(
            'assignee is required and must be a non-empty string'
        );
    });

    test('rejects non-string assignee', () => {
        const result = validateAssignTask({
            assignee: 123
        });

        expect(result).toBe(
            'assignee is required and must be a non-empty string'
        );
    });

});